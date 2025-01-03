import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DISOWcu0.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Astro = createAstro();
const $$Analytics = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Analytics;
  const moksa = Astro2.locals.moksa;
  return renderTemplate`<!-- Changed -->${renderComponent($$result, "Layout", $$Layout, { "title": "Moksa AI" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-row"> ${renderComponent($$result2, "AnalyticsManager", null, { "client:only": "svelte", "moksa": moksa, "client:component-hydration": "only", "client:component-path": "@/managers/analytics-manager.svelte", "client:component-export": "default" })} ${renderComponent($$result2, "AnalyticsLayout", null, { "client:only": "svelte", "moksa": moksa, "client:component-hydration": "only", "client:component-path": "@/components/analytics/layout.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/analytics.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/analytics.astro";
const $$url = "/analytics.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Analytics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
