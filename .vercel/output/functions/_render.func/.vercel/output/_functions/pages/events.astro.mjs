import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Events = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI | Events", "topbar": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PersonCount", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/person-count.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "AllEvents", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/managers/all-events.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "EventsLayout", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/all-events/layout.svelte", "client:component-export": "default" })} ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/events.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/events.astro";
const $$url = "/events.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Events,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
