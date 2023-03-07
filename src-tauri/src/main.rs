// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::cmp::{max, min};
use std::io::{Write, Read, SeekFrom, Seek, Cursor};
use std::process::{Command, Stdio};
use std::time;
use std::path::Path;

use tauri::Window;
use tar::Archive;
use flate2::read::GzDecoder;
use sha1::{Sha1, Digest};
use base64::{engine::general_purpose, Engine as _};

#[derive(Copy, Clone, serde::Serialize)]
struct Progress {
    filesize: u64,
    transfered: u64,
    transfer_rate: f64,
    percentage: f64
}

#[tauri::command(async)]
async fn make_cors_request(url: String) -> Result<String, String> {
    let res = reqwest::get(url)
        .await.or(Err("Error making HTTP request".to_string()))?;
    if !res.status().is_success() {
        return Err(format!("HTTP ERROR {}: {}", res.status().as_str(), res.text().await.unwrap_or("Error reading response text".to_string())));
    }
    match res.text().await {
        Ok(text) => Ok(text),
        Err(e) => Err(format!("Error reading response text"))
    }
}

#[tauri::command(async)]
async fn download_file(window: Window, url: String, path: String, filesize: u64) -> Result<String, String> {
    const UPDATE_SPEED: u128 = 69;

    let mut res = reqwest::Client::new()
        .get(&url)
        .send()
        .await.or(Err("HTTP GET Error".to_string()))?;
    let mut file = File::create(&path).or(Err("unable to create file".to_string()))?;
    let start = time::Instant::now();
    let mut last_update = time::Instant::now();

    let mut downloaded_bytes: u64 = 0;
    //let mut stream = res.bytes_stream();

    let mut progress = Progress {
        filesize,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0
    };

    tokio::spawn( async move {
        while let Some(chunk) = res.chunk().await.or(Err("Error getting byte chunk")).unwrap() {

            if let Err(_) = file.write_all(&chunk) {
                println!("Error while writing to file");
                break;
            }

            downloaded_bytes = min(downloaded_bytes + (chunk.len() as u64), filesize);

            progress.transfered = downloaded_bytes;
            progress.percentage = (progress.transfered * 100 / filesize) as f64;
            progress.transfer_rate = (downloaded_bytes as f64) / (start.elapsed().as_secs() as f64)
                + (start.elapsed().subsec_nanos() as f64 / 1_000_000_000.0).trunc();
            
            if last_update.elapsed().as_millis() >= UPDATE_SPEED {
                window.emit("PROGRESS", progress).or(Err("Error sending PROGRESS sig".to_string())).unwrap();
                last_update = time::Instant::now();
            }
        }

        progress.transfered = max(filesize, progress.transfered);
        progress.percentage = 100.0;
        window.emit("PROGRESS", progress).or(Err("Error sending PROGRESS sig".to_string())).unwrap();
        window.emit("FINISH", progress).or(Err("Error sending FINISH sig".to_string())).unwrap();
    });

    Ok("Download started".to_string())
}

#[tauri::command(async)]
async fn unpack_xz(srcpath: String, destpath: String) -> Result<String, String> {
    let xztarball = File::open(srcpath).or(Err("Error opening tarball".to_string()))?;
    let mut reader = std::io::BufReader::new(xztarball);
    let mut tarfile: Vec<u8> = Vec::new();

    lzma_rs::xz_decompress(&mut reader, &mut tarfile).map_err(|e| e.to_string())?;
    let mut ar = Archive::new(tarfile.as_slice());
    ar.unpack(destpath).map_err(|e| e.to_string())?;
    Ok("Extracted archive".to_string())
}

#[tauri::command(async)]
async fn unpack_gz(srcpath: String, destpath: String) -> Result<String, String> {
    println!("{}", srcpath);
    println!("{}", destpath);
    let gztarball = File::open(srcpath).or(Err("Error opening tarball".to_string()))?;

    let tarfile = GzDecoder::new(gztarball);

    let mut ar = Archive::new(tarfile);
    ar.unpack(destpath).map_err(|e| e.to_string())?;

    Ok("Extracted archive".to_string())
}

#[tauri::command(async)]
async fn sha1filehash(path: String) -> Result<String, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let filemeta = file.metadata().map_err(|e| e.to_string())?;
    let read_size: usize = filemeta.len().try_into().or(Err("Error getting file metadata"))?;
    let mut buf = vec![ 0u8; read_size ];

    file.seek(SeekFrom::Start(0)).map_err(|e| e.to_string())?;
    file.read_exact(&mut buf).map_err(|e| e.to_string())?;
    let mut hasher = Sha1::new();
    
    hasher.update(&buf);

    let resultbuf = hasher.finalize();
    Ok(general_purpose::STANDARD.encode(resultbuf))
}

#[tauri::command(async)]
async fn start_cmd(runtime: String, env: HashMap<String, String>, args: Vec<String>, wait: bool) -> Result<String, String> {
    let mut child = Command::new(runtime)
        .stdout(Stdio::null())
        .envs(&env)
        .args(&args)
        .spawn().or(Err("Error spawing child process".to_string())).unwrap();


    if wait {
        child.wait().or(Err("Error waiting for child process to finish".to_string())).unwrap();
    }

    Ok("Finished".to_string())
}

#[tauri::command]
fn path_exists(path: String) -> (bool, bool) {
    if fs::metadata(&path).is_ok() {
        (true, fs::metadata(&path).unwrap().is_dir())
    } else {
        (false, false)
    }
}

#[tauri::command]
fn remove_dir(path: String) -> bool {
    fs::remove_dir_all(path).is_ok()
}

#[tauri::command]
fn create_dir(path: String) -> bool {
    fs::create_dir_all(path).is_ok()
}

#[tauri::command]
fn remove_file(path: String) -> bool {
    fs::remove_file(path).is_ok()
}

#[tauri::command]
fn create_file(path: String, data: String) -> bool {
    let mut file = match File::create(path) {
        Ok(file) => file,
        Err(_) => return false
    };
    file.write_all(data.as_bytes()).is_ok()
}

#[tauri::command]
fn read_file(path: String) -> (String, bool) {
    match fs::read_to_string(path) {
        Ok(data) => return (data, true),
        Err(e) => (e.to_string(), false)
    }
}

#[tauri::command]
fn write_file(path: String, data: String) -> bool {
    let mut file = match fs::OpenOptions::new().write(true).truncate(true).open(path) {
        Ok(file) => file,
        Err(_) => return false
    };
    file.write_all(data.as_bytes()).is_ok()
}

//#[tauri::command]
//fn append_file(path: String, data: String) -> bool {
//    let mut file = match fs::OpenOptions::new().write(true).append(true).open(path) {
//        Ok(file) => file,
//        Err(_) => return false
//    };
//    file.write_all(data.as_bytes()).is_ok()
//}

#[tauri::command]
fn copy(src: String, dest: String) -> bool {
    fs::copy(src, dest).is_ok()
}

#[tauri::command]
fn rename(src: String, dest: String) -> bool {
    fs::rename(src, dest).is_ok()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            make_cors_request, download_file, unpack_xz, unpack_gz, sha1filehash, start_cmd,
            path_exists, remove_dir, create_dir, remove_file, create_file, read_file, write_file, copy, rename
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
