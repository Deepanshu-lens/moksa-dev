import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
import { $ as $$AuthShell } from '../chunks/AuthShell_CCh9BQzB.mjs';
export { r as renderers } from '../chunks/_@astro-renderers_ByLoCuEw.mjs';

const $$Register = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AuthShell", $$AuthShell, { "title": "Moksa AI | Register", "mode": "register" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "RegistrationForm", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "@/components/forms/RegisterForm.svelte", "client:component-export": "default" })} ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/register.astro", void 0);
const $$file = "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/pages/register.astro";
const $$url = "/register.html";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
