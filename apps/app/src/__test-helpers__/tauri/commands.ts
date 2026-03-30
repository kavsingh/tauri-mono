interface Ok<TData> {
	status: "ok";
	data: TData;
}

interface Err<TError> {
	status: "error";
	error: TError;
}

function createMockOkResult<TData>(data: TData): Ok<TData> {
	return { status: "ok", data };
}

function createMockErrorResult<TError>(error: TError): Err<TError> {
	return { status: "error", error };
}

export { createMockOkResult, createMockErrorResult };
