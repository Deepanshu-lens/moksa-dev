<script>
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  onMount(() => {
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get("message");
      if (message) {
        toast.error(`${message} Please try again.`);
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.pushState({ path: newUrl }, "", newUrl);
        }, 1000);
      }
    }
  });

  // function handleSubmit(event) {
  //   const form = event.target;
  //   const name = form.name.value.trim();
  //   const email = form.email.value.trim();
  //   const password = form.password.value.trim();
  //   const confirmPassword = form['confirm-password'].value.trim();

  //   if (!name || !email || !password || !confirmPassword) {
  //     event.preventDefault();
  //     toast.error("All fields are required. Please fill out the missing fields.");
  //   }
  // }
</script>

<div
  class="flex justify-center items-center w-full h-screen relative flex-col sm:flex-row overflow-hidden"
>
  <div
    class="left sm:w-1/2 w-full bg-forms-background dark:bg-dark-forms-background h-screen bg-cover z-10 fixed sm:static bg-top sm:bg-center"
  />
  <form
    class="shadow-md right w-full sm:w-1/2 h-3/4 sm:h-screen bg-background rounded-tl-[100px] sm:rounded-none z-20 pt-[1rem] pb-[5rem] sm:pb-0 sm:pt-0 absolute bottom-5 sm:static"
    method="POST"
    action="?/signup"
  >
    <div
      class="form-cont flex flex-col h-full items-center justify-center gap-4 w-[380px] mx-auto scale-[.85] sm:scale-100 xl:scale-100 2xl:scale-125 lg:scale-90 md:scale-75"
    >
      <div
        class="flex items-center sm:justify-start sm:self-start gap-4 sm:-ml-4 pt-[2rem] sm:pt-0"
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
      <h2
        class="font-semibold text-2xl self-center sm:self-start text-[#212B36] font-mono"
      >
        Register
      </h2>
      <div class="mb-4 w-[380px] max-h-[40px] flex flex-row items-center gap-4">
        <span class='w-1/2 relative'>
          <img
          alt="mail-line"
          src={"/assets/vms/edit-name1.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 block dark:hidden"
          />
          <img
          alt="mail-line"
          src={"/assets/vms/edit-name2.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 dark:block hidden"
          />
          
          <input
          class={` appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]   leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="firstName"
          type="text"
          placeholder="First Name"
          name="firstName"
          required
          />
        </span>
        <span class='w-1/2 relative'>
          <img
          alt="mail-line"
          src={"/assets/vms/edit-name1.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 block dark:hidden"
        />
        <img
          alt="mail-line"
          src={"/assets/vms/edit-name2.svg"}
          height={30}
          width={30}
          class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 dark:block hidden"
        />
          <input
          class={` appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]   leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="name"
          type="text"
          placeholder="Last Name"
          name="lastName"
          required
          />
        </span>
      </div>
      <div class="mb-4 relative w-[380px] max-h-[40px]">
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
          class={` appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]   leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
      </div>
      <div class="mb-4 relative w-[380px] max-h-[40px]">
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
          class={` appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]   leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="password"
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={8}
        />
      </div>
      <div class="mb-4 relative w-[380px] max-h-[40px]">
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
          class={` appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381]   leading-tight focus:outline-none focus:shadow-outline`}
          autoComplete="off"
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder="Confirm Password"
          minLength={8}
          required
        />
      </div>

      <div class="flex flex-col items-center justify-between mt-2">
        <button
          class="bg-[#015A62] hover:bg-[#015A62]/[.4] text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Sign Up
        </button>

        <a
          href="/login"
          class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80]/[.7] mt-4"
        >
          Already have an account?
          <span class="ml-1 text-primary font-semibold">Login</span>
        </a>
      </div>
    </div>
  </form>
</div>
