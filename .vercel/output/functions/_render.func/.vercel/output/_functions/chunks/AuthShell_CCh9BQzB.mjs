import { c as createComponent, r as renderTemplate, a as renderComponent, b as createAstro, m as maybeRenderHead, d as renderSlot } from './astro/server_ByR5OE_x.mjs';
import 'kleur/colors';
/* empty css                         */
import { $ as $$Layout } from './Layout_DISOWcu0.mjs';

const $$Astro = createAstro();
const $$AuthShell = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AuthShell;
  const { title, mode = "login" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": title, "topbar": false }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex justify-center items-center w-full h-screen relative flex-col sm:flex-row overflow-hidden"> <div class="sm:w-1/2 w-full bg-login-background dark:bg-login-dark-background sm:h-screen h-2/3 bg-cover z-10"> <div class="absolute top-10 left-16 scale-150"> <!-- <Logo /> --> </div> </div> <div class="shadow-md sm:w-1/2 w-full sm:h-screen h-2/3 bg-background relative sm:rounded-none rounded-tl-[100px] -mt-[15rem] z-20 sm:mt-0 pt-[1rem] pb-[5rem] sm:pb-0 sm:pt-0"> <div class="form-cont flex flex-col h-full items-center justify-center gap-4 w-[350px] mx-auto scale-[.85] sm:scale-100 xl:scale-100 2xl:scale-125 lg:scale-90 md:scale-75"> <h2 class="font-medium text-2xl sm:self-start ]"> ${mode === "login" ? "Login" : "Register"} </h2> <p class="text-[#919EAB] text-sm sm:self-start pb-4">
Login with registered email ID
</p> ${renderSlot($$result2, $$slots["default"])} <!-- {
          mode === "login" ? (
            <button class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7] mt-4">
              Don't have an account yet?
              <a class="ml-1 text-primary font-semibold" href="/register">
                Sign up
              </a>
            </button>
          ) : (
            <button class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7] mt-4">
              Already have an account?
              <a class="ml-1 text-primary font-semibold" href="/login">
                Log In
              </a>
            </button>
          )
        } --> </div> </div> </div> ` })}`;
}, "/Users/deepanshukhorwal/Documents/lens/lens app/moksa_2.0/src/layouts/AuthShell.astro", void 0);

export { $$AuthShell as $ };
