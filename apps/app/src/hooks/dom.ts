export type UseResizeObserverEntryCallback = (
	entry: ResizeObserverEntry,
) => void;

export type UseResizeObserverObserveFn = (
	el: Element,
	callback: UseResizeObserverEntryCallback,
	options?: ResizeObserverOptions,
) => UseResizeObserverUnobserveFn;

export type UseResizeObserverUnobserveFn = () => void;

const elementCallbacks = new WeakMap<
	Element,
	Set<UseResizeObserverEntryCallback>
>();

const resizeObserver = new ResizeObserver((entries) => {
	for (const entry of entries) {
		const callbacks = elementCallbacks.get(entry.target);

		if (!callbacks) continue;

		for (const callback of callbacks) callback(entry);
	}
});

export function useResizeObserver(): UseResizeObserverObserveFn {
	const observe: UseResizeObserverObserveFn = (el, callback, options) => {
		let callbacks = elementCallbacks.get(el);

		if (!callbacks) {
			callbacks = new Set();
			elementCallbacks.set(el, callbacks);
		}

		callbacks.add(callback);
		resizeObserver.observe(el, options);

		return function unobserve() {
			resizeObserver.unobserve(el);

			const current = elementCallbacks.get(el);

			if (current) {
				current.delete(callback);

				if (current.size === 0) elementCallbacks.delete(el);
			}
		};
	};

	return observe;
}
