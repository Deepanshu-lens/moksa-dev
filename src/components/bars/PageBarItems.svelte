<script lang="ts">
  import { addUserLogs } from "@/lib/logs/userLogs";
  import { cn } from "@/lib/utils";
  import { user } from "@/stores";
  import Icon from "@iconify/svelte";
  import axios from "axios";

  let currentPath = window.location.pathname;
  if (window.api) {
    const pathSegments = currentPath.split("/");
    const fileName = pathSegments[pathSegments.length - 1];

    // Remove the ".html" extension if it exists
    currentPath = "/" + fileName.replace(".html", "");
    if (currentPath === "/index") currentPath = "/";
  }

  // Function to check if the link is active
  let isActive: (href: string) => boolean;
  $: isActive = (href: string) => {
    return currentPath === href;
  };

  let data = [
    { name: "Live", link: "/", icon: "live-icon" },
    { name: "Playback", link: "/playback", icon: "playback-icon" },
    { name: "Events", link: "/events", icon: "events-icon" },
    { name: "Gallery", link: "/gallery", icon: "gallery-icon" },
    {
      name: "Atlas",
      link: "/atlas",
      icon: "atlas-icon",
    },
    { name: "Reports", link: "/reports", icon: "reports-icon" },
    {
      name: "Configuration",
      link: "/configuration",
      icon: "configuration-icon",
    },
  ];

  if (import.meta.env.PUBLIC_ENV === "production") {
    data = data.filter((item) => item.name !== "Reports");
  }

  const disabledPaths: string[] = ["/reports"];

  export let isVertical = false;
</script>

<div
  class={isVertical
    ? "flex flex-col items-center space-y-12"
    : "flex justify-center space-x-6 w-full"}
>
  <nav class="hidden md:flex space-x-4">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each data as link}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_missing_attribute -->
      <a
        on:click={async (e) => {
          if (disabledPaths.includes(link.link)) {
            e.preventDefault();
            return;
          }
          await addUserLogs(
            `User visited ${link?.name} page`,
            $user?.email || "",
            $user?.id || ""
          );
          currentPath = link.link;
          if (window.api) {
            if (link.link === "/") {
              window.api.navigate("/index");
            } else {
              window.api.navigate(link.link);
            }
          } else {
            window.location.href = link.link;
          }
        }}
        class={cn(
          "text-sm transition-all px-3 py-2 rounded-md cursor-pointer",
          isActive(link.link)
            ? "font-medium bg-gray-200 text-black"
            : "font-normal hover:bg-gray-100 hover:text-black",
          disabledPaths.includes(link.link) && "cursor-not-allowed opacity-50"
        )}
      >
        <Icon icon={link.icon} width="24" height="24" />
        <span>{link.name}</span>
      </a>
    {/each}
  </nav>
</div>
