import { c as createComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute, a as renderComponent, b as createAstro, d as renderSlot, g as renderHead } from './astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
/* empty css                         */
import { u as untrack, p as push, h as head, b as bind_props, a as pop } from './_@astro-renderers_ByLoCuEw.mjs';
import { DEV } from 'esm-env';
import 'clsx';

const ATTR_REGEX = /[&"<]/g;

/**
 * @template V
 * @param {V} value
 * @param {boolean} [is_attr]
 */
function escape_html(value, is_attr) {
	const str = String(value ?? '');

	const pattern = ATTR_REGEX ;
	pattern.lastIndex = 0;

	let escaped = '';
	let last = 0;

	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}

	return escaped + str.substring(last);
}

/**
 * `<div translate={false}>` should be rendered as `<div translate="no">` and _not_
 * `<div translate="false">`, which is equivalent to `<div translate="yes">`. There
 * may be other odd cases that need to be added to this list in future
 * @type {Record<string, Map<any, string>>}
 */
const replacements = {
	translate: new Map([
		[true, 'yes'],
		[false, 'no']
	])
};

/**
 * @template V
 * @param {string} name
 * @param {V} value
 * @param {boolean} [is_boolean]
 * @returns {string}
 */
function attr(name, value, is_boolean = false) {
	if (value == null || (!value && is_boolean) || (value === '' && name === 'class')) return '';
	const normalized = (name in replacements && replacements[name].get(value)) || value;
	const assignment = is_boolean ? '' : `="${escape_html(normalized)}"`;
	return ` ${name}${assignment}`;
}

// Store the references to globals in case someone tries to monkey patch these, causing the below
// to de-opt (this occurs often when using popular extensions).

const noop = () => {};

/** @param {Array<() => void>} arr */
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i]();
	}
}

/**
 * @template V
 * @param {V} value
 * @param {V | (() => V)} fallback
 * @param {boolean} [lazy]
 * @returns {V}
 */
function fallback(value, fallback, lazy = false) {
	return value === undefined
		? lazy
			? /** @type {() => V} */ (fallback)()
			: /** @type {V} */ (fallback)
		: value;
}

/** @import { Equals } from '#client' */
/** @type {Equals} */

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function safe_not_equal(a, b) {
	return a != a
		? b == b
		: a !== b || (a !== null && typeof a === 'object') || typeof a === 'function';
}

const regex_return_characters = /\r/g;

/**
 * @param {string} str
 * @returns {string}
 */
function hash(str) {
	str = str.replace(regex_return_characters, '');
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}

/** @import { Readable } from './public' */

/**
 * @template T
 * @param {Readable<T> | null | undefined} store
 * @param {(value: T) => void} run
 * @param {(value: T) => void} [invalidate]
 * @returns {() => void}
 */
function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		// @ts-expect-error
		run(undefined);

		// @ts-expect-error
		if (invalidate) invalidate(undefined);

		return noop;
	}

	// Svelte store takes a private second argument
	// StartStopNotifier could mutate state, and we want to silence the corresponding validation error
	const unsub = untrack(() =>
		store.subscribe(
			run,
			// @ts-expect-error
			invalidate
		)
	);

	// Also support RxJS
	// @ts-expect-error TODO fix this in the types?
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

/**
 * @param {string} value
 */
function html(value) {
	var html = String(value ?? '');
	var open = DEV ? `<!--${hash(html)}-->` : '<!---->';
	return open + html + '<!---->';
}

/** @import { Readable, StartStopNotifier, Subscriber, Unsubscriber, Updater, Writable } from '../public.js' */
/** @import { Stores, StoresValues, SubscribeInvalidateTuple } from '../private.js' */

/**
 * @type {Array<SubscribeInvalidateTuple<any> | any>}
 */
const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * @template T
 * @param {T} [value] initial value
 * @param {StartStopNotifier<T>} [start]
 * @returns {Readable<T>}
 */
function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe
	};
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * @template T
 * @param {T} [value] initial value
 * @param {StartStopNotifier<T>} [start]
 * @returns {Writable<T>}
 */
function writable(value, start = noop) {
	/** @type {Unsubscriber | null} */
	let stop = null;

	/** @type {Set<SubscribeInvalidateTuple<T>>} */
	const subscribers = new Set();

	/**
	 * @param {T} new_value
	 * @returns {void}
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}

	/**
	 * @param {Updater<T>} fn
	 * @returns {void}
	 */
	function update(fn) {
		set(fn(/** @type {T} */ (value)));
	}

	/**
	 * @param {Subscriber<T>} run
	 * @param {() => void} [invalidate]
	 * @returns {Unsubscriber}
	 */
	function subscribe(run, invalidate = noop) {
		/** @type {SubscribeInvalidateTuple<T>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set, update) || noop;
		}
		run(/** @type {T} */ (value));
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @template {Stores} S
 * @template T
 * @overload
 * @param {S} stores
 * @param {(values: StoresValues<S>, set: (value: T) => void, update: (fn: Updater<T>) => void) => Unsubscriber | void} fn
 * @param {T} [initial_value]
 * @returns {Readable<T>}
 */
/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @template {Stores} S
 * @template T
 * @overload
 * @param {S} stores
 * @param {(values: StoresValues<S>) => T} fn
 * @param {T} [initial_value]
 * @returns {Readable<T>}
 */
/**
 * @template {Stores} S
 * @template T
 * @param {S} stores
 * @param {Function} fn
 * @param {T} [initial_value]
 * @returns {Readable<T>}
 */
function derived(stores, fn, initial_value) {
	const single = !Array.isArray(stores);
	/** @type {Array<Readable<any>>} */
	const stores_array = single ? [stores] : stores;
	if (!stores_array.every(Boolean)) {
		throw new Error('derived() expects stores as input, got a falsy value');
	}
	const auto = fn.length < 2;
	return readable(initial_value, (set, update) => {
		let started = false;
		/** @type {T[]} */
		const values = [];
		let pending = 0;
		let cleanup = noop;
		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set, update);
			if (auto) {
				set(result);
			} else {
				cleanup = typeof result === 'function' ? result : noop;
			}
		};
		const unsubscribers = stores_array.map((store, i) =>
			subscribe_to_store(
				store,
				(value) => {
					values[i] = value;
					pending &= ~(1 << i);
					if (started) {
						sync();
					}
				},
				() => {
					pending |= 1 << i;
				}
			)
		);
		started = true;
		sync();
		return function stop() {
			run_all(unsubscribers);
			cleanup();
			// We need to set this to false because callbacks can still happen despite having unsubscribed:
			// Callbacks might already be placed in the queue which doesn't know it should no longer
			// invoke this derived store.
			started = false;
		};
	});
}

/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 *
 * @template T
 * @param {Readable<T>} store
 * @returns {T}
 */
function get(store) {
	let value;
	subscribe_to_store(store, (_) => (value = _))();
	// @ts-expect-error
	return value;
}

// Original Source: https://reemus.dev/article/disable-css-transition-color-scheme-change#heading-ultimate-solution-for-changing-color-scheme-without-transitions
let timeoutAction;
let timeoutEnable;
// Perform a task without any css transitions
// eslint-disable-next-line ts/no-explicit-any
function withoutTransition(action) {
    if (typeof document === "undefined")
        return;
    // Clear fallback timeouts
    clearTimeout(timeoutAction);
    clearTimeout(timeoutEnable);
    // Create style element to disable transitions
    const style = document.createElement("style");
    const css = document.createTextNode(`* {
     -webkit-transition: none !important;
     -moz-transition: none !important;
     -o-transition: none !important;
     -ms-transition: none !important;
     transition: none !important;
  }`);
    style.appendChild(css);
    // Functions to insert and remove style element
    const disable = () => document.head.appendChild(style);
    const enable = () => document.head.removeChild(style);
    // Best method, getComputedStyle forces browser to repaint
    if (typeof window.getComputedStyle !== "undefined") {
        disable();
        action();
        // eslint-disable-next-line ts/no-unused-expressions -- this is a side effect
        window.getComputedStyle(style).opacity;
        enable();
        return;
    }
    // Better method, requestAnimationFrame processes function before next repaint
    if (typeof window.requestAnimationFrame !== "undefined") {
        disable();
        action();
        window.requestAnimationFrame(enable);
        return;
    }
    // Fallback
    disable();
    timeoutAction = window.setTimeout(() => {
        action();
        timeoutEnable = window.setTimeout(enable, 120);
    }, 120);
}

/**
 * Santizes an array of classnames by removing any empty strings.
 */
function sanitizeClassNames(classNames) {
    return classNames.filter((className) => className.length > 0);
}

// saves having to branch for server vs client
const noopStorage = {
    getItem: (_key) => null,
    setItem: (_key, _value) => { },
};
// whether we are running on server vs client
const isBrowser = typeof document !== "undefined";
/**  the modes that are supported, used for validation & type derivation */
const modes = ["dark", "light", "system"];
/**
 * The key used to store the `mode` in localStorage.
 */
const modeStorageKey = writable("mode-watcher-mode");
/**
 * The key used to store the `theme` in localStorage.
 */
const themeStorageKey = writable("mode-watcher-theme");
/**
 * Writable store that represents the user's preferred mode (`"dark"`, `"light"` or `"system"`)
 */
const userPrefersMode = createUserPrefersMode();
/**
 * Readable store that represents the system's preferred mode (`"dark"`, `"light"` or `undefined`)
 */
const systemPrefersMode = createSystemMode();
/**
 * Theme colors for light and dark modes.
 */
const themeColors = writable(undefined);
/**
 * A custom theme to apply and persist to the root `html` element.
 */
const theme = createCustomTheme();
/**
 * Whether to disable transitions when changing the mode.
 */
const disableTransitions = writable(true);
/**
 * The classnames to add to the root `html` element when the mode is dark.
 */
const darkClassNames = writable([]);
/**
 * The classnames to add to the root `html` element when the mode is light.
 */
const lightClassNames = writable([]);
/**
 * Derived store that represents the current mode (`"dark"`, `"light"` or `undefined`)
 */
createDerivedMode();
/**
 * Derived store that represents the current custom theme
 */
createDerivedTheme();
// derived from: https://github.com/CaptainCodeman/svelte-web-storage
function createUserPrefersMode() {
    const defaultValue = "system";
    const storage = isBrowser ? localStorage : noopStorage;
    const initialValue = storage.getItem(getModeStorageKey());
    let value = isValidMode(initialValue) ? initialValue : defaultValue;
    function getModeStorageKey() {
        return get(modeStorageKey);
    }
    const { subscribe, set: _set } = writable(value, () => {
        if (!isBrowser)
            return;
        const handler = (e) => {
            if (e.key !== getModeStorageKey())
                return;
            const newValue = e.newValue;
            if (isValidMode(newValue)) {
                _set((value = newValue));
            }
            else {
                _set((value = defaultValue));
            }
        };
        addEventListener("storage", handler);
        return () => removeEventListener("storage", handler);
    });
    function set(v) {
        _set((value = v));
        storage.setItem(getModeStorageKey(), value);
    }
    return {
        subscribe,
        set,
    };
}
function createCustomTheme() {
    const storage = isBrowser ? localStorage : noopStorage;
    const initialValue = storage.getItem(getThemeStorageKey());
    let value = initialValue === null || initialValue === undefined ? "" : initialValue;
    function getThemeStorageKey() {
        return get(themeStorageKey);
    }
    const { subscribe, set: _set } = writable(value, () => {
        if (!isBrowser)
            return;
        const handler = (e) => {
            if (e.key !== getThemeStorageKey())
                return;
            const newValue = e.newValue;
            if (newValue === null) {
                _set((value = ""));
            }
            else {
                _set((value = newValue));
            }
        };
        addEventListener("storage", handler);
        return () => removeEventListener("storage", handler);
    });
    function set(v) {
        _set((value = v));
        storage.setItem(getThemeStorageKey(), value);
    }
    return {
        subscribe,
        set,
    };
}
function createSystemMode() {
    const defaultValue = undefined;
    let track = true;
    const { subscribe, set } = writable(defaultValue, () => {
        if (!isBrowser)
            return;
        const handler = (e) => {
            if (!track)
                return;
            set(e.matches ? "light" : "dark");
        };
        const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
        mediaQueryState.addEventListener("change", handler);
        return () => mediaQueryState.removeEventListener("change", handler);
    });
    /**
     * Query system preferences and update the store.
     */
    function query() {
        if (!isBrowser)
            return;
        const mediaQueryState = window.matchMedia("(prefers-color-scheme: light)");
        set(mediaQueryState.matches ? "light" : "dark");
    }
    /**
     * Enable or disable tracking of system preference changes.
     */
    function tracking(active) {
        track = active;
    }
    return {
        subscribe,
        query,
        tracking,
    };
}
function createDerivedMode() {
    const { subscribe } = derived([
        userPrefersMode,
        systemPrefersMode,
        themeColors,
        disableTransitions,
        darkClassNames,
        lightClassNames,
    ], ([$userPrefersMode, $systemPrefersMode, $themeColors, $disableTransitions, $darkClassNames, $lightClassNames,]) => {
        if (!isBrowser)
            return undefined;
        const derivedMode = $userPrefersMode === "system" ? $systemPrefersMode : $userPrefersMode;
        const sanitizedDarkClassNames = sanitizeClassNames($darkClassNames);
        const sanitizedLightClassNames = sanitizeClassNames($lightClassNames);
        function update() {
            const htmlEl = document.documentElement;
            const themeColorEl = document.querySelector('meta[name="theme-color"]');
            if (derivedMode === "light") {
                if (sanitizedDarkClassNames.length)
                    htmlEl.classList.remove(...sanitizedDarkClassNames);
                if (sanitizedLightClassNames.length)
                    htmlEl.classList.add(...sanitizedLightClassNames);
                htmlEl.style.colorScheme = "light";
                if (themeColorEl && $themeColors) {
                    themeColorEl.setAttribute("content", $themeColors.light);
                }
            }
            else {
                if (sanitizedLightClassNames.length)
                    htmlEl.classList.remove(...sanitizedLightClassNames);
                if (sanitizedDarkClassNames.length)
                    htmlEl.classList.add(...sanitizedDarkClassNames);
                htmlEl.style.colorScheme = "dark";
                if (themeColorEl && $themeColors) {
                    themeColorEl.setAttribute("content", $themeColors.dark);
                }
            }
        }
        if ($disableTransitions) {
            withoutTransition(update);
        }
        else {
            update();
        }
        return derivedMode;
    });
    return {
        subscribe,
    };
}
function createDerivedTheme() {
    const { subscribe } = derived([theme, disableTransitions], ([$theme, $disableTransitions]) => {
        if (!isBrowser)
            return undefined;
        function update() {
            const htmlEl = document.documentElement;
            htmlEl.setAttribute("data-theme", $theme);
        }
        if ($disableTransitions) {
            withoutTransition(update);
        }
        else {
            update();
        }
        return $theme;
    });
    return {
        subscribe,
    };
}
function isValidMode(value) {
    if (typeof value !== "string")
        return false;
    return modes.includes(value);
}

function defineConfig(config) {
    return config;
}
/** Used to set the mode on initial page load to prevent FOUC */
function setInitialMode({ defaultMode, themeColors, darkClassNames = ["dark"], lightClassNames = [], defaultTheme = "", }) {
    const rootEl = document.documentElement;
    const mode = localStorage.getItem("mode-watcher-mode") || defaultMode;
    const theme = localStorage.getItem("mode-watcher-theme") || defaultTheme;
    const light = mode === "light" ||
        (mode === "system" && window.matchMedia("(prefers-color-scheme: light)").matches);
    if (light) {
        if (darkClassNames.length)
            rootEl.classList.remove(...darkClassNames);
        if (lightClassNames.length)
            rootEl.classList.add(...lightClassNames);
    }
    else {
        if (lightClassNames.length)
            rootEl.classList.remove(...lightClassNames);
        if (darkClassNames.length)
            rootEl.classList.add(...darkClassNames);
    }
    rootEl.style.colorScheme = light ? "light" : "dark";
    if (themeColors) {
        const themeMetaEl = document.querySelector('meta[name="theme-color"]');
        if (themeMetaEl) {
            themeMetaEl.setAttribute("content", mode === "light" ? themeColors.light : themeColors.dark);
        }
    }
    if (theme) {
        rootEl.setAttribute("data-theme", theme);
        localStorage.setItem("mode-watcher-theme", theme);
    }
    localStorage.setItem("mode-watcher-mode", mode);
}

function Mode_watcher($$payload, $$props) {
	push();
	let trueNonce;
	let track = fallback($$props["track"], true);
	let defaultMode = fallback($$props["defaultMode"], "system");
	let themeColors$1 = fallback($$props["themeColors"], () => void 0, true);
	let disableTransitions$1 = fallback($$props["disableTransitions"], true);
	let darkClassNames$1 = fallback($$props["darkClassNames"], () => ["dark"], true);
	let lightClassNames$1 = fallback($$props["lightClassNames"], () => [], true);
	let defaultTheme = fallback($$props["defaultTheme"], "");
	let nonce = fallback($$props["nonce"], "");
	let themeStorageKey$1 = fallback($$props["themeStorageKey"], "mode-watcher-theme");
	let modeStorageKey$1 = fallback($$props["modeStorageKey"], "mode-watcher-mode");

	const initConfig = defineConfig({
		defaultMode,
		themeColors: themeColors$1,
		darkClassNames: darkClassNames$1,
		lightClassNames: lightClassNames$1,
		defaultTheme,
		modeStorageKey: modeStorageKey$1,
		themeStorageKey: themeStorageKey$1
	});

	disableTransitions.set(disableTransitions$1);
	themeColors.set(themeColors$1);
	darkClassNames.set(darkClassNames$1);
	lightClassNames.set(lightClassNames$1);
	modeStorageKey.set(modeStorageKey$1);
	themeStorageKey.set(themeStorageKey$1);
	trueNonce = typeof window === "undefined" ? nonce : "";

	head($$payload, ($$payload) => {
		if (themeColors$1) {
			$$payload.out += "<!--[-->";
			$$payload.out += `<meta name="theme-color"${attr("content", themeColors$1.dark)}>`;
		} else {
			$$payload.out += "<!--[!-->";
		}

		$$payload.out += `<!--]--> `;

		if (trueNonce) {
			$$payload.out += "<!--[-->";
			$$payload.out += `${html(`<script nonce=${trueNonce}>(` + setInitialMode.toString() + `)(` + JSON.stringify(initConfig) + `);</script>`)}`;
		} else {
			$$payload.out += "<!--[!-->";
			$$payload.out += `${html(`<script>(` + setInitialMode.toString() + `)(` + JSON.stringify(initConfig) + `);</script>`)}`;
		}

		$$payload.out += `<!--]-->`;
	});

	bind_props($$props, {
		track,
		defaultMode,
		themeColors: themeColors$1,
		disableTransitions: disableTransitions$1,
		darkClassNames: darkClassNames$1,
		lightClassNames: lightClassNames$1,
		defaultTheme,
		nonce,
		themeStorageKey: themeStorageKey$1,
		modeStorageKey: modeStorageKey$1
	});

	pop();
}

const $$Astro$1 = createAstro();
const $$PageBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$PageBar;
  const { location = "top" } = Astro2.props;
  const isVertical = location === "left" || location === "right";
  return renderTemplate`${maybeRenderHead()}<header${addAttribute(`
  ${isVertical ? "fixed h-full w-16 md:w-20 flex-col px-6 py-4 lg:py-8 border-l bg-custom-gradient" : "h-10 md:h-20 w-full px-4 md:px-4 lg:px-12 border-b bg-custom-gradient"}  ${location === "top" ? "top-0" : location === "bottom" ? "bottom-0" : ""} ${location === "left" ? "left-0" : location === "right" ? "right-0" : ""}  flex ${isVertical ? "items-center justify-between" : "justify-between items-center"}`, "class")}> <div${addAttribute(`${isVertical ? " flex flex-col  items-center  w-full" : "flex items-center space-x-3"}`, "class")}> <img${addAttribute("./images/moksa.png", "src")} alt="Logo" class="h-10 w-auto dark:hidden block"> <img${addAttribute("./images/moksa.png", "src")} alt="Logo" class="h-10 w-auto hidden dark:block"> </div> <!-- Navigation Links --> <nav${addAttribute(`${isVertical ? "flex flex-col space-y-4 flex-grow justify-center w-full" : "flex flex-grow justify-center"}`, "class")}> ${renderComponent($$result, "PageBarItems", null, { "isVertical": isVertical, "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/components/bars/PageBarItems.svelte", "client:component-export": "default" })} </nav> <div class="flex items-center gap-3"> ${renderComponent($$result, "Avatar", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/avatar/Avatar.svelte", "client:component-export": "default" })} ${renderComponent($$result, "ThemeSwitch", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/ui/theme-button/theme-switch.svelte", "client:component-export": "default" })} </div> </header>`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/components/bars/PageBar.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, topbar = true } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<script>\n  const isBrowser = typeof localStorage !== "undefined";\n  const getThemePreference = () => {\n    if (isBrowser && localStorage.getItem("theme")) {\n      return localStorage.getItem("theme");\n    }\n    return window.matchMedia("(prefers-color-scheme: dark)").matches\n      ? "dark"\n      : "light";\n  };\n  const isDark = getThemePreference() === "dark";\n  document.documentElement.classList[isDark ? "add" : "remove"]("dark");\n\n  if (isBrowser) {\n    const observer = new MutationObserver(() => {\n      const isDark = document.documentElement.classList.contains("dark");\n      localStorage.setItem("theme", isDark ? "dark" : "light");\n    });\n    observer.observe(document.documentElement, {\n      attributes: true,\n      attributeFilter: ["class"],\n    });\n  }\n</script> <html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description" content="Astro description"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="icon" type="image/svg+xml"', "><title>", "</title>", '</head> <body class="antialiased" data-astro-cid-sckkx6r4> ', " ", " ", ' <div class="hidden lg:block" data-astro-cid-sckkx6r4> ', " </div> ", ' <div class="lg:hidden block" data-astro-cid-sckkx6r4> ', " </div> ", " </body></html>"])), addAttribute("./images/moksa.png", "href"), title, renderHead(), renderComponent($$result, "Node", null, { "client:only": "svelte", "client:component-hydration": "only", "data-astro-cid-sckkx6r4": true, "client:component-path": "@/managers/node.svelte", "client:component-export": "default" }), renderComponent($$result, "ModeWatcher", Mode_watcher, { "client:load": true, "client:component-hydration": "load", "client:component-path": "mode-watcher", "client:component-export": "ModeWatcher", "data-astro-cid-sckkx6r4": true }), renderComponent($$result, "User", null, { "client:only": "svelte", "client:component-hydration": "only", "data-astro-cid-sckkx6r4": true, "client:component-path": "@/managers/User.svelte", "client:component-export": "default" }), topbar && renderTemplate`${renderComponent($$result, "PageBar", $$PageBar, { "location": "top", "data-astro-cid-sckkx6r4": true })}`, renderComponent($$result, "Toaster", null, { "client:only": "svelte", "client:component-hydration": "only", "data-astro-cid-sckkx6r4": true, "client:component-path": "@/components/ui/sonner", "client:component-export": "Toaster" }), renderComponent($$result, "MobileNavbar", null, { "client:only": "svelte", "client:component-hydration": "only", "data-astro-cid-sckkx6r4": true, "client:component-path": "@/components/bars/MobileNavbar.svelte", "client:component-export": "default" }), renderSlot($$result, $$slots["default"]));
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
