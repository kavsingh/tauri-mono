const statusElement = document.querySelector("#status");
const retry = document.querySelector("#retry");

async function connect() {
	retry.hidden = true;
	statusElement.textContent = "Connecting to the app...";

	try {
		// Tauri injects this API into the bundled page at runtime.
		// oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
		await window.__TAURI_INTERNALS__.invoke("connect_remote");
	} catch (cause) {
		console.error("Could not load the remote app", cause);
		statusElement.textContent =
			"Could not load the app. Check your connection and try again.";
		retry.hidden = false;
	}
}

retry.addEventListener("click", () => void connect());
void connect();
