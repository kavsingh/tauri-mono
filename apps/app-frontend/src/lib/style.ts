// oxlint-disable-next-line no-restricted-imports
import type { VariantProps as BaseVariantProps } from "tailwind-variants";

type ExactOptional<T> = { [K in keyof T]?: T[K] | undefined };

// oxlint-disable-next-line typescript/no-explicit-any
type VariantProps<TComponent extends (...args: any) => any> = ExactOptional<
	BaseVariantProps<TComponent>
>;

type StyleProperyValueMap = Record<string, string>;

type StylePropertyValues<T> = { [K in keyof T]?: string };

function getStylePropertyValues<TMap extends StyleProperyValueMap>(
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

// oxlint-disable-next-line no-restricted-imports
export { twMerge as tm, twJoin as tj } from "tailwind-merge";
// oxlint-disable-next-line no-restricted-imports
export { tv } from "tailwind-variants";

export { getStylePropertyValues };

export type { VariantProps, StylePropertyValues, StyleProperyValueMap };
