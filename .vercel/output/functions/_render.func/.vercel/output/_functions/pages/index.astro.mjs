import { c as createComponent, r as renderTemplate, m as maybeRenderHead, e as addAttribute, a as renderComponent, b as createAstro } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const $$Astro = createAstro();
const $$PageBarMobile = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageBarMobile;
  const { location = "top" } = Astro2.props;
  const isVertical = location === "left" || location === "right";
  return renderTemplate`${maybeRenderHead()}<header${addAttribute(`
  ${isVertical ? "fixed h-full w-16 md:w-20 flex-col px-4 py-4 lg:py-8 border-l flex justify-between" : "md:h-16 w-full px-4 md:px-4 lg:px-12 mt-6"}  ${location === "top" ? "top-0" : location === "bottom" ? "bottom-0" : ""} ${location === "left" ? "left-0" : location === "right" ? "right-0" : ""}  flex ${isVertical ? "items-center justify-between" : "justify-between items-center"}`, "class")}> <!-- Mobile Actions add/edit/delete --> <div class="flex items-start justify-between w-full"> <div class="w-[50%]"> <div class="flex items-center"> <div${addAttribute(`flex flex-col justify-between items-center gap-4 w-full`, "class")}> <img${addAttribute("./images/moksa.png", "src")} alt="Logo" class="h-8 w-auto dark:hidden block"> <img${addAttribute("./images/moksa.png", "src")} alt="Logo" class="h-8 w-auto hidden dark:block"> <div${addAttribute(cn("flex justify-end ml-20", "gap-1"), "class")}> ${renderComponent($$result, "NodeActionButton", null, { "action": "add", "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/node/crud/NodeActionButton.svelte", "client:component-export": "default" })} ${renderComponent($$result, "NodeActionButton", null, { "action": "edit", "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/node/crud/NodeActionButton.svelte", "client:component-export": "default" })} ${renderComponent($$result, "NodeActionButton", null, { "action": "delete", "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/node/crud/NodeActionButton.svelte", "client:component-export": "default" })} </div> </div> </div> <div class="mt-4 w-full"> ${renderComponent($$result, "NodeSelection", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/node/NodeSelection.svelte", "client:component-export": "default" })} </div> </div> <div class="flex items-center gap-1"> ${renderComponent($$result, "Avatar", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/avatar/Avatar.svelte", "client:component-export": "default" })} ${renderComponent($$result, "ThemeSwitch", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/ui/theme-button/theme-switch.svelte", "client:component-export": "default" })} </div> </div> </header>`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/components/bars/PageBarMobile.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Changed -->${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Camera", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/camera.svelte", "client:component-export": "default" })} ${maybeRenderHead()}<div class="block lg:hidden"> ${renderTemplate`${renderComponent($$result2, "PageBarMobile", $$PageBarMobile, { "location": "top" })}`} </div> <div class="flex flex-row"> ${renderComponent($$result2, "MoksaTokenManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/moksa-token.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "EventsManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/events.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "PersonCountManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/person-count.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "GalleryPage", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/gallery.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "LiveLayout", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/live/layout.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/index.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
