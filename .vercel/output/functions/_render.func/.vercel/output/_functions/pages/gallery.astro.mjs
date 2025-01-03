import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Gallery = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- Changed -->${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI | Gallery" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "GalleryManager", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/gallery.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "GalleryPage", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/gallery-page.svelte", "client:component-export": "default" })} ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/gallery.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/gallery.astro";
const $$url = "/gallery.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Gallery,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
