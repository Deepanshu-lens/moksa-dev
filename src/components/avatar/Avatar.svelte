<script lang="ts">
  import { user } from "@/stores";
  export let isVertical = false;
  import pb from "@/lib/pb";
  import * as Popover from "@/components/ui/popover";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import Button from "../ui/button/button.svelte";
  import { addAuthLogs } from "@/lib/logs/authLogs";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { cn } from "@/lib/utils";
  let pendingDays = writable(5);
  const MAX_NAME_LENGTH = 20;
  const MAX_EMAIL_LENGTH = 30;

  let displayName = "";
  let displayEmail = "";

  async function logout() {
    await addAuthLogs("logout", $user?.email || "");
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

  onMount(async () => {
    if (import.meta.env.PUBLIC_ENV !== "production") {
      try {
        const res = await fetch(`http://localhost:4432/license/status`);
        const data = await res?.json();
        if (data?.pendingDays) {
          pendingDays.set(data?.remainingDays || 0);
        }
      } catch (error) {
        console.log("error fetching license status");
      }
    }
  });
</script>

{#if $user}
  <Popover.Root>
    <Popover.Trigger let:builder class="border rounded-md hover:text-black border-gray-600">
      <div
        class="flex items-center space-x-3 hover:bg-accent py-1.5 px-2 rounded-md bg-transparent "
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
          <div class="space-y-0 flex-col items-start hidden md:flex text-white hover:text-black">
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
        >
        <span class="mt-0.5 font-semibold" role="none">{$user?.email}</span>
        {#if import.meta.env.PUBLIC_ENV !== "production"}
          <span
            class={cn(
              "block mt-1 text-xs font-semibold",
              $pendingDays >= 30
                ? "text-green-500"
                : $pendingDays > 7 && $pendingDays <= 20
                  ? "text-yellow-600"
                  : "text-red-600"
            )}
          >
            License Expires in {$pendingDays} days
          </span>
        {/if}
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
        <span class="opacity-50 block py-1.5 px-3.5 cursor-not-allowed"
          >User Manual</span
        >
        <span
          class="opacity-50 block py-1.5 px-3.5 hover:bg-accent cursor-not-allowed"
          >Account Settings</span
        >
        <span
          class="block py-1.5 px-3.5 hover:bg-accent"
          ><a href="/account">Manage Account</a></span
        >
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button
              variant="ghost"
              builders={[builder]}
              class="block w-full py-1.5 text-left px-3.5 hover:bg-accent"
              >Download apk</Button
            >
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56 mr-45">
            <DropdownMenu.Label>Downloading for</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item on:click={() => handleDownload("mac")}
              >MacOs</DropdownMenu.Item
            >
            <DropdownMenu.Item on:click={() => handleDownload("win")}
              >Windows</DropdownMenu.Item
            >
            <DropdownMenu.Item on:click={() => handleDownload("lin")}
              >Linux</DropdownMenu.Item
            >
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <button
          type="button"
          class="block w-full py-1.5 text-left px-3.5 hover:bg-accent"
          on:click={logout}>Sign out</button
        >
      </div></Popover.Content
    >
  </Popover.Root>
{/if}
