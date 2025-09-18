/* eslint-disable @typescript-eslint/no-restricted-imports */

export { twMerge as tm, twJoin as tj } from "tailwind-merge";
export { tv } from "tailwind-variants";

import type { VariantProps as BaseVariantProps } from "tailwind-variants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VariantProps<TComponent extends (...args: any) => any> =
	ExactOptional<BaseVariantProps<TComponent>>;

export function getStylePropertyValues<TMap extends StyleProperyValueMap>(
	valueMap: TMap,
): StylePropertyValues<TMap> {
	const computedStyle = getComputedStyle(document.documentElement);
	const result: StylePropertyValues<TMap> = {};

	for (const [key, property] of Object.entries(valueMap)) {
		const value = computedStyle.getPropertyValue(property);

		if (value) result[key as keyof TMap] = value;
	}

	return result;
}

export type StyleProperyValueMap = Record<string, string>;

type StylePropertyValues<T> = { [K in keyof T]?: string };

type ExactOptional<T> = { [K in keyof T]?: T[K] | undefined };
