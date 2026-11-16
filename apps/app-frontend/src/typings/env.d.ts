interface ImportMetaEnv {
	readonly VITE_E2E: boolean | undefined;
	readonly VITE_FRONTEND_BUILD_ID: string;
	readonly VITE_NATIVE_API_VERSION: number;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
