const isErrorLike = (value: unknown): value is ErrorLike =>
	!!value &&
	typeof value === "object" &&
	"message" in value &&
	typeof value.message === "string";

export default isErrorLike;

export type ErrorLike = { [key: string]: unknown; message: string };
