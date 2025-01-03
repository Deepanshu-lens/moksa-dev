import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Reports = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI | Reports" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-row"> ${renderComponent($$result2, "CameraManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/camera.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "AllEventsManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/all-events.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "GalleryManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/gallery.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "ReportsManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/reports.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/reports.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/reports.astro";
const $$url = "/reports.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reports,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
