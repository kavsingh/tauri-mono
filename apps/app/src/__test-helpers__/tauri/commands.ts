export function createMockOkResult<TData>(data: TData) {
	return { status: "ok", data } as const;
}

export function createMockErrorResult<TError>(error: TError) {
	return { status: "error", error } as const;
}
