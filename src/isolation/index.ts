// even if nothing is done, will still encrypt payloads
// for security
// see: https://tauri.app/v1/references/architecture/inter-process-communication/isolation
window.__TAURI_ISOLATION_HOOK__ = (payload) => {
	// eslint-disable-next-line no-console
	console.log("Tauri isolation hook", payload);

	return payload;
};

export {};

// TODO: find official typings if available
type IsolationPayload = unknown;

declare global {
	interface Window {
		__TAURI_ISOLATION_HOOK__: (payload: IsolationPayload) => IsolationPayload;
	}
}
