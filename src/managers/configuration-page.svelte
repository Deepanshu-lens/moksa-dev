<script lang="ts">
  //types
  type Section = "Remote" | "Stream" | "Recording" | "System" | "Camera" | "License" | "User";

  // Imports
  import {
    CameraIcon,
    Cast,
    Disc2,
    FileSignatureIcon,
    Radio,
    Router,
    User2,
    TriangleAlert
  } from "lucide-svelte";
  import Stream from "@/components/configuration//settings/Stream.svelte";
  import Camera from "@/components/configuration/settings/Camera.svelte";
  import Recording from "@/components/configuration/settings/Recording.svelte";
  import Remote from "@/components/configuration/settings/Remote.svelte";
  import System from "@/components/configuration/settings/System.svelte";
  import UserS from "@/components/configuration/users.svelte";
  import License from "@/components/configuration/settings/License.svelte";
  import PageBarMobile2 from "@/components/bars/PageBarMobile2.svelte";
  import MobileMenuConfig from "@/components/bars/MobileNavs/MobileMenuConfig.svelte";
  import { currentSection } from "@/stores/config-section";
  import { addUserLogs } from "@/lib/logs/userLogs";
  import { user } from "@/stores";
  import AlertsManagement from "@/components/configuration/alerts-management.svelte";

  // State
  let search: string | null = null;

  // URL handling
  $: {
    const searchParams = new URLSearchParams(window.location.search);
    search = searchParams.get("section") as Section;
    if (search && ["Remote", "Stream", "Recording", "System", "Camera", "License", "User"].includes(search)) {
      currentSection.set(search as Section);
    } else {
      searchParams.set("section", "Remote");
      window.history.replaceState(null, "", `${location.pathname}?${searchParams}`);
      currentSection.set("Remote");
    }
  }

  // Methods
  const handleButtonClick = (text: Section) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("section", text);
    window.history.pushState(null, "", `${location.pathname}?${searchParams}`);
    currentSection.set(text);
    addUserLogs(`User selected option ${text} for configuration`, $user?.email || "", $user?.id || "");
  }

  // Styles
  const baseButtonClass = "h-[40px] w-[40px] rounded-full grid place-items-center";
  const inactiveButtonClass = `text-[#727272]/90 ${baseButtonClass} border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258D9D] group-hover:border-none`;
  const activeButtonClass = `relative border-none ${baseButtonClass} text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:bg-[#258d9d]`;
</script>
<div class="block lg:hidden">
  <PageBarMobile2 />
</div>
<section class="right h-[calc(100vh-75px)] w-full flex-1 bg-background flex flex-row-reverse">
  <!-- Navigation Buttons -->
  <div class="flex-col gap-4 items-center justify-center pl-2 pr-4 h-full my-auto hidden lg:flex">
    {#each ["Remote", "Stream", "Recording", "System", "Camera", "License", "User","Alerts"] as section}
      <span class="group flex flex-col gap-0.5 items-center justify-center">
        <button
          disabled={section === "Camera"}
          on:click={() => {
            handleButtonClick(section as Section);
          }}
          class={($currentSection !== section ? inactiveButtonClass : activeButtonClass) + (section === "Camera" ? " opacity-50" : "")}
        >
          {#if section === "Remote"}
            <Router class="h-[22px] w-[22px]" />
          {:else if section === "Stream"}
            <Radio class="h-[22px] w-[22px]" />
          {:else if section === "Recording"}
            <Disc2 class="h-[22px] w-[22px]" />
          {:else if section === "System"}
            <Cast class="h-[22px] w-[22px]" />
          {:else if section === "Camera"}
            <CameraIcon class="h-[22px] w-[22px]" />
          {:else if section === "License"}
            <FileSignatureIcon class="h-[22px] w-[22px]" />
          {:else if section === "User"}
            <User2 class="h-[22px] w-[22px]" />
          {:else}
            <TriangleAlert class="h-[22px] w-[22px]" />
          {/if}
        </button>
        <p class={`text-xs ${$currentSection !== section ? "text-[#727272]/90 dark:text-white" : ""}`}>
          {section}
        </p>
      </span>
    {/each}
  </div>

  <!-- Content Section -->
  <div class="w-full h-full">
    {#if $currentSection === "Remote"}
      <Remote />
    {:else if $currentSection === "Stream"}
      <Stream />
    {:else if $currentSection === "Recording"}
      <Recording />
    {:else if $currentSection === "System"}
      <System />
    {:else if $currentSection === "Camera"}
      <Camera />
    {:else if $currentSection === "License"}
      <License />
    {:else if $currentSection === "User"}
      <UserS/>
    {:else}
      <AlertsManagement/>
    {/if}
  </div>

  <div class="block lg:hidden">
    <MobileMenuConfig/>
  </div>
  <!-- Settings List -->
  <!-- <div class="h-[calc(100vh-75px)] w-1/4 max-w-72 dark:border-[#292929] border-l-[1px]">
    <SettingsList />
  </div> -->
</section>