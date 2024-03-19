export default function isErrorLike(value: unknown): value is ErrorLike {
	return (
		!!value &&
		typeof value === "object" &&
		"message" in value &&
		typeof value.message === "string"
	);
}

export type ErrorLike = { [key: string]: unknown; message: string };
