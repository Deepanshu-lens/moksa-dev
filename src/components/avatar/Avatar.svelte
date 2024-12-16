<script lang="ts">
  import { user } from "@/stores";
  export let isVertical = false;
  import pb from "@/lib/pb";
  import * as Popover from "@/components/ui/popover";
  import * as DropdownMenu from "@/components/ui/dropdown-menu";
  import { toast } from "svelte-sonner";
  import Button from "../ui/button/button.svelte";
  import { writable } from "svelte/store";

  const MAX_NAME_LENGTH = 20;
  const MAX_EMAIL_LENGTH = 30;

  let displayName = "";
  let displayEmail = "";
  let fileUrl = writable("");

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

  const handleDownload = (device: string) => {
    const env = import.meta.env.PUBLIC_ENV;
    // let brand;
    // if (env === "production") {
    //   brand = "cielo";
    // } else if (brandName === "LENS VIEW") {
    //   brand = "lens";
    // }

    switch (env) {
      case "production": {
        const onBrand = import.meta.env.PUBLIC_BRAND_NAME;
        switch (device) {
          case "mac": {
            if (onBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (onBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/CieloView+ThinClient-1.0.0.dmg"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          case "win": {
            if (onBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (onBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/CieloView+ThinClient+Setup+1.0.0.exe"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          case "lin": {
            if (onBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (onBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/cielo-view_1.0.0_amd64.deb"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          default: {
            toast.error("Something went wrong.");
            break;
          }
        }
        break;
      }
      case "development": {
        const offBrand = import.meta.env.PUBLIC_OFFLINE_PUBLIC_BRAND;
        switch (device) {
          case "mac": {
            if (offBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (offBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/Offline/CieloView+ThinClient-1.0.0.dmg"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          case "win": {
            if (offBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (offBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/Offline/CieloView+ThinClient+Setup+1.0.0.exe"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          case "lin": {
            if (offBrand === "LENS VIEW") {
              fileUrl.set("");
              toast.info("App coming soon!");
            } else if (offBrand === "Cielo VIEW") {
              fileUrl.set(
                "https://build-download.s3.ap-south-1.amazonaws.com/Offline/cielo-view_1.0.0_amd64.deb"
              );
            } else {
              toast("Software coming soon!");
            }
            break;
          }
          default:
            toast.error("Something went wrong.");
            break;
        }
        break;
      }
      default: {
        toast.error("Something went wrong. Please try again.");
        break;
      }
    }
  };

  fileUrl.subscribe((value) => {
    if (value !== "") {
      const a = document.createElement("a");
      a.href = $fileUrl;
      a.download = $fileUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.info("APK downloaded.");
    }
  });
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
