<script>
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
    import { Eye, EyeOff } from "lucide-svelte";

  onMount(() => {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get("message");
      if (message) {
        toast.error(`${message} Please try again.`);
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.pushState({ path: newUrl }, "", newUrl);
        }, 2000);
      }
    }
  });

    let showPassword = false;

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }


</script>

<div
  class="flex justify-center items-center w-full h-screen relative flex-col sm:flex-row overflow-hidden"
>
  <div
    class="left sm:w-1/2 w-full bg-forms-background dark:bg-dark-forms-background sm:h-screen h-2/3 bg-cover z-10"
  />

  <form
    method="post"
    action="?/login"
    class="shadow-md right sm:w-1/2 w-full sm:h-screen h-2/3 bg-background relative sm:rounded-none rounded-tl-[100px] -mt-[15rem] z-20 sm:mt-0 pt-[1rem] pb-[5rem] sm:pb-0 sm:pt-0"
  >
    <div
      class="form-cont flex flex-col h-full items-center justify-center gap-4 w-[350px] mx-auto scale-[.85] sm:scale-100 xl:scale-100 2xl:scale-125 lg:scale-90 md:scale-75"
    >
      <div
        class="flex items-center justify-center sm:justify-start sm:self-start gap-4 -ml-4"
      >
        <img
          src={"/images/moksa.png"}
          alt="logo"
          height={80}
          width={140}
          class="hidden dark:block"
        />
        <img
          src={"/images/moksa-black.png"}
          alt="logo"
          height={80}
          width={140}
          class="block dark:hidden"
        />
      </div>
      <h2 class="font-semibold text-2xl sm:self-start text-[#212B36] font-mono">
        Login
      </h2>
      <p class="text-[#919EAB] text-sm sm:self-start">
        Login with registered email ID
      </p>

      <div class="mb-4 relative w-[350px] max-h-[40px]">
        <img
          alt="mail-line"
          src={"/assets/vms/mail-line.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 block dark:hidden"
        />
        <img
          alt="mail-line"
          src={"/assets/vms/mail-line2.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 dark:block hidden"
        />

        <input
          class={`appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]  leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="email"
          type="email"
          placeholder="email"
          name="email"
          required
        />
      </div>
      <div class="mb-4 relative w-[350px] max-h-[40px]">
        <img
          alt="mail-line"
          src={"/assets/vms/password-outline1.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 dark:block hidden"
        />
        <img
          alt="mail-line"
          src={"/assets/vms/password-outline2.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 block dark:hidden"
        />

         <input
    class={`appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-10 font-semibold text-[#637381] leading-tight focus:outline-none focus:shadow-outline`}
    autoComplete="off"
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    name="password"
  />
  <button
    type="button"
    class="absolute top-1/2 right-2 -translate-y-1/2"
    on:click={togglePasswordVisibility}
  >
    {#if showPassword}
      <EyeOff class="w-5 h-5 text-[#637381]" />
    {:else}
      <Eye class="w-5 h-5 text-[#637381]" />
    {/if}
      </div>
      <div
        class="flex flex-col items-center justify-between mt-2 mb-10 sm:mb-0"
      >
        <button
          class="bg-[#015A62] hover:bg-[#015A62]/[.4] text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Sign In
        </button>
        <a
          href="/register"
          class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7] mt-4"
        >
          Don't have an account yet?
          <span class="ml-1 text-primary font-semibold"> Sign up </span>
        </a>
      </div>
    </div>
  </form>
</div>

<!-- {#each Object.keys(providers) as provider}
  {#if providers[provider].authProviderState}
    <button on:click={() => gotoAuthProvider(provider)}
      >Login with {provider}</button
    >
  {/if}
{/each} -->
