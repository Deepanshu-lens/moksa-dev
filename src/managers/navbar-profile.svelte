<script>
  import * as Popover from "@/components/ui/popover";
  import { cn } from "@/lib/utils";
  import pb from "@/lib/pb";
  import { LogOut } from "lucide-svelte";
  import { actions, isInputError } from "astro:actions";
  export let displayEmail;
  export let displayName;
  export let isVertical;
  export let data;
  let profileOn = false;

  //   handle logout
  export async function logout() {
    const result = await actions.auth.logout();
    if (result?.error) {
      if (!isInputError(result.error)) {
        toast.error(result.error.message);
      } else {
        errors = result.error.fields;
      }
      return;
    }

    localStorage.removeItem("pb_auth_token");
    console.log("CALLED FROM AVATAR");
    window.location.href = "/login";
  }
</script>

<Popover.Root bind:open={profileOn}>
  <Popover.Trigger
    ><button
      class={cn(
        "hidden items-end md:flex p-1 rounded-md  space-x-2",
        profileOn ? "bg-slate-100 dark:bg-gray-900" : "hover:bg-accent "
      )}
    >
      <img
        src={data?.avatar}
        alt="User Avatar"
        class="rounded-lg"
        width={isVertical ? 64 : 36}
      />
      <div class="flex flex-col text-left">
        <span class="text-sm font-medium">{displayName}</span>
        <span class="text-[0.6rem] font-medium">{displayEmail}</span>
      </div>
    </button></Popover.Trigger
  >
  <Popover.Content
    class="p-0 w-60 divide-y rounded-lg text-sm font-normal transform opacity-100 scale-100"
  >
    <p class="truncate px-3.5 py-3" role="none">
      <span class="block text-xs text-gray-500" role="none">Signed in as</span
      ><span class="mt-0.5 font-semibold" role="none">{displayEmail}</span>
    </p>
    <div class="py-1.5" role="none">
      <!-- svelte-ignore a11y_missing_attribute -->
      <a href="/" class="block py-1.5 px-3.5 hover:bg-accent">Changelog</a><a
        href="/"
        class="block py-1.5 px-3.5 hover:bg-accent">Support</a
      ><a href="/" class="block py-1.5 px-3.5 hover:bg-accent">License</a>
    </div>
    <div class="py-1.5" role="none">
      <a href="/" class="block py-1.5 px-3.5 hover:bg-accent"
        >Upgrade to Team License</a
      >
    </div>
    <div class="py-1.5" role="none">
      <a href="/" class="block py-1.5 px-3.5 hover:bg-accent"
        >Account Settings</a
      ><button
        type="button"
        class="w-full py-1.5 text-left px-3.5 hover:bg-accent flex items-center justify-between"
        on:click={logout}>Sign out <LogOut size={12} /></button
      >
    </div></Popover.Content
  >
</Popover.Root>
