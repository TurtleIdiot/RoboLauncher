async function invokeFunction(command: string, args?: { [index: string]: any }): Promise<any> {
	return
}
let appWindowObject = {
	once: async (event: string, callback: Function) => {
		return () => {}
	}
}

export async function invoke<T>(name: string, args?: any): Promise<T> {
	if (!import.meta.env.SSR) {
		const api = await import('@tauri-apps/api');
		return await api.tauri.invoke(name, args);
	} else {
		return await invokeFunction(name, args);
	}
}