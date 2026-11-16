import { mockCreator } from "./mock-creator";

import type { ConnectionStatus_Serialize } from "../../../tauri-bindings.gen";

const createMockConnectionStatus = mockCreator<ConnectionStatus_Serialize>({
	mode: "remote",
	retrying: false,
	error: null,
});

export { createMockConnectionStatus };
