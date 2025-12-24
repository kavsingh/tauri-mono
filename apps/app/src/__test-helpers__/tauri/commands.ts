import type { Result } from "#__generated__/bindings";

type Ok<TData> = Extract<Result<TData, unknown>, { status: "ok" }>;
type Err<TError> = Extract<Result<unknown, TError>, { status: "error" }>;

export function createMockOkResult<TData>(data: TData): Ok<TData> {
	return { status: "ok", data };
}

export function createMockErrorResult<TError>(error: TError): Err<TError> {
	return { status: "error", error };
}
