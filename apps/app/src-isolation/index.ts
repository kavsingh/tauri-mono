// even if nothing is done, will still encrypt payloads
// for security
// see: https://tauri.app/v1/references/architecture/inter-process-communication/isolation
globalThis.window.__TAURI_ISOLATION_HOOK__ = function tauriIsolationHook(
	payload,
) {
	return payload;
};

// oxlint-disable-next-line require-module-specifiers
export {};

// TODO: find official typings if available
type IsolationPayload = unknown;

declare global {
	interface Window {
		__TAURI_ISOLATION_HOOK__: (payload: IsolationPayload) => IsolationPayload;
	}
}
