import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Configuration = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI | Configuration", "topbar": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "ConfigurationPage", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/configuration-page.svelte", "client:component-export": "default" })} ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/configuration.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/configuration.astro";
const $$url = "/configuration.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Configuration,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
