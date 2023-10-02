# RoboLauncher

An unofficial launcher for Robocraft 2 built with [tauri](https://tauri.app/)

# THIS LAUNCHER IS NOT OFFICIAL. IT IS NOT AFFILIATED WITH FREEJAM OR ROBOCRAFT2 DEVELOPMENT
For windows users or for the official launcher download, click [here](https://www.robocraft2.com/)

# V2: A partial rewrite

A linux launcher for downloading and running Robocraft 2 using proton and dxvk

This launcher was built to make installing and running Robocraft 2 under proton as close to one-click as possible and handles downloading runtimes like wine/proton, DXVK and EAC, setting up the wine prefix, downloading game files, etc.

Also the first unofficial launcher/script to implement game file verification

# Installation
Currently, a `.deb` and a `.AppImage` are provided

## Debian and Ubuntu-based systems

First, download the latest `.deb` file from [the releases page](https://github.com/TurtleIdiot/RoboLauncher/releases)

Navigate to the directory in which the deb file is saved

Run the command

```
sudo apt install ./robo-launcher_X.X.X_amd64.deb
```

## Other distributions

For all other distributions, simply download the AppImage bundle from [the releases page](https://github.com/TurtleIdiot/RoboLauncher/releases) and set the correct permission for execution:
```
chmod a+x ./robo-launcher_X.X.X_amd64.AppImage
```
Flatpak is currently being considered

# Usage

First set an install directory in the settings page, clicking either the "OPEN SETTINGS" in the warning banner or by clicking ` ⋮ > Settings `

It is recommended to create a new directory, such as `/home/user/robocraft`

Everything required to run is self-contained inside the install directory like so:

```
installDirectory
  ├ game
  ├ gameconfig.json
  ├ prefix
  └ runtimes
```

Afterwards, you may edit any other settings, click "SAVE" in the top right and navigate back to the main page

The main button should then be enabled, prompting you to install, update or play

The menu button also has options for reistalling the game/runtimes, re-creating the wine prefix and re-verifying game files

# Development

This is a tauri project and therefore requires the [tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites#setting-up-linux)

Ensure you also have [node.js](https://nodejs.org/) (v18+ recommended) and npm installed.

Next, clone the repo and install dependencies

```
git clone https://github.com/TurtleIdiot/RoboLauncher.git
cd RoboLauncher
npm install
```

Finally, run a debugging build with

```
npm run tauri dev
```

# Building

If you're building for your own system, you can simply use

```
npm run tauri build
```

However, it is recommended to use an older system for building if you plan on distributing your build ([read more here](https://tauri.app/v1/guides/building/linux#limitations))

Debian 10 (Buster)/Ubuntu 18.04 (Bionic) is the recommended build system

## Building using docker

This is the recommended build workflow using docker

Create a new buster container configured with rust

```
docker run -d -t --name robolauncherbuild rust:buster
```

Enter a shell inside the container

```
docker exec -it robolauncherbuild bash
```

Install node

```
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install nodejs
```

Setup dev environment

```
git clone https://github.com/TurtleIdiot/RoboLauncher.git
cd RoboLauncher
npm install
```

Build and exit container

```
npm run tauri build
(Wait for build to fully finish...)
exit
```

Copy files and stop container

```
docker cp robolauncherbuild:/RoboLauncher/src-tauri/target/release/bundle ./bundle
docker stop robolauncherbuild
```

# Credits

These are the people that made running Robocraft 2 on linux possible and I highly recommend you check them out and maybe donate to them for their amazing work

## GloriousEggroll
- https://github.com/GloriousEggroll
- https://github.com/GloriousEggroll/wine-ge-custom
GloriousEggroll is the creator of proton-GE which is know to improve performance and compatibility of many various windows games running on linux

## doitsujin/ドイツ人
- https://github.com/doitsujin
- https://github.com/doitsujin/dxvk
Creator of DXVK, which is responsible for translating DirectX graphics calls into Vulkan commands, making GPU-intensive windows games on linux possible
