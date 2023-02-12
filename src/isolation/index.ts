// even if nothing is done, will still encrypt payloads
// for security
// see: https://tauri.app/v1/references/architecture/inter-process-communication/isolation
window.__TAURI_ISOLATION_HOOK__ = function tauriIsolationHook(payload) {
	return payload;
};

export {};

// TODO: find official typings if available
type IsolationPayload = unknown;

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		__TAURI_ISOLATION_HOOK__: (payload: IsolationPayload) => IsolationPayload;
	}
}
