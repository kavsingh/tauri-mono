/* eslint-disable */
// This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

declare global {
    interface Window {
        __TAURI_INVOKE__<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    }
}

// Function avoids 'window not defined' in SSR
const invoke = () => window.__TAURI_INVOKE__;

export function getSysInfo() {
    return invoke()<SysInfoResponse>("get_sys_info")
}

export function initHeartbeat() {
    return invoke()<null>("init_heartbeat")
}

export type SysInfoResponse = { name: string | null; osVersion: string | null; hostName: string | null }
