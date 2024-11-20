<script>
  import { user } from "@/stores";
  export let isVertical = false;
  import pb from "@/lib/pb";
  import * as Popover from "@/components/ui/popover";

  const MAX_NAME_LENGTH = 20;
  const MAX_EMAIL_LENGTH = 30;

  let displayName = "";
  let displayEmail = "";

  async function logout() {
    pb.authStore.clear();
    user.set(undefined);

    if (window.api) {
      await window.api.invoke("clear-auth-token");
    } else {
      localStorage.removeItem("pb_auth_token");
    }

    if (window.api) {
      console.log("CALLED FROM AVATAR");
      window.api.navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }

  // Reactive statement to update displayName and displayEmail when $user changes
  $: if ($user) {
    displayName = $user.name || `${$user.firstName} ${$user.lastName || ""}`;

    // Trim display name if it exceeds MAX_NAME_LENGTH
    if (displayName.length > MAX_NAME_LENGTH) {
      displayName = displayName.slice(0, MAX_NAME_LENGTH - 3) + "...";
    }

    displayEmail = $user.email;

    // Trim display email if it exceeds MAX_EMAIL_LENGTH
    if (displayEmail && displayEmail.length > MAX_EMAIL_LENGTH) {
      displayEmail = displayEmail.slice(0, MAX_EMAIL_LENGTH - 3) + "...";
    }
  }
</script>

{#if $user}
  <Popover.Root>
    <Popover.Trigger let:builder class="border rounded-md">
      <div
        class="flex items-center space-x-3 hover:bg-accent py-1.5 px-2 rounded-md"
      >
        <img
          src={$user.avatar ||
            `https://ui-avatars.com/api/name=${$user.name}?background=random` ||
            ""}
          alt="User Avatar"
          class="rounded-lg"
          width={isVertical ? 64 : 25}
        />
        {#if !isVertical}
          <div class="space-y-0 flex-col items-start hidden md:flex">
            <span class="text-xs">{displayName}</span>
            <span class="text-xs">{displayEmail}</span>
          </div>
        {/if}
      </div>
    </Popover.Trigger>
    <Popover.Content
      class="p-0 w-60 divide-y  rounded-lg  text-sm font-normal  transform opacity-100 scale-100"
    >
      <p class="truncate px-3.5 py-3" role="none">
        <span class="block text-xs text-gray-500" role="none">Signed in as</span
        ><span class="mt-0.5 font-semibold" role="none">{$user?.email}</span>
      </p>
      <div class="py-1.5" role="none">
        <span class="opacity-50 block py-1.5 px-3.5 cursor-not-allowed"
          >Changelog</span
        >
        <span class="opacity-50 block py-1.5 px-3.5 cursor-not-allowed"
          >Support</span
        >
        <span class="opacity-50 block py-1.5 px-3.5 cursor-not-allowed"
          >License</span
        >
      </div>
      <div class="py-1.5" role="none">
        <span
          class="opacity-50 block py-1.5 px-3.5 hover:bg-accent cursor-not-allowed"
          >Account Settings</span
        >
        <button
          type="button"
          class="block w-full py-1.5 text-left px-3.5 hover:bg-accent"
          on:click={logout}>Sign out</button
        >
      </div></Popover.Content
    >
  </Popover.Root>
{/if}
