const elementCallbacks = new WeakMap<Element, UseResizeObserverEntryCallback>();

const resizeObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		elementCallbacks.get(entry.target)?.(entry);
	}
});

export function useResizeObserver(): UseResizeObserverObserveFn {
	const observe: UseResizeObserverObserveFn = (el, callback, options) => {
		elementCallbacks.set(el, callback);
		resizeObserver.observe(el, options);

		return function unobserve() {
			resizeObserver.unobserve(el);
			elementCallbacks.delete(el);
		};
	};

	return observe;
}

export type UseResizeObserverEntryCallback = (
	entry: ResizeObserverEntry,
) => void;

export type UseResizeObserverObserveFn = (
	el: Element,
	callback: UseResizeObserverEntryCallback,
	options?: ResizeObserverOptions,
) => UseResizeObserverUnobserveFn;

export type UseResizeObserverUnobserveFn = () => void;
