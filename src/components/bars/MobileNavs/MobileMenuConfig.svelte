<script lang="ts">
  type Section =
    | "Remote"
    | "Stream"
    | "Recording"
    | "System"
    | "Camera"
    | "License"
    | "User";

  import { writable } from "svelte/store";
  import {
    Cast,
    Disc2,
    FileSignatureIcon,
    Radio,
    Router,
    User2,
  } from "lucide-svelte";
  import { currentSection } from "@/stores/config-section";

  let search: string | null = null;

  // URL handling
  $: {
    const searchParams = new URLSearchParams(window.location.search);
    search = searchParams.get("section") as Section;
    if (
      search &&
      [
        "Remote",
        "Stream",
        "Recording",
        "System",
        "Camera",
        "License",
        "User",
      ].includes(search)
    ) {
      currentSection.set(search as Section);
    } else {
      searchParams.set("section", "Remote");
      window.history.replaceState(
        null,
        "",
        `${location.pathname}?${searchParams}`
      );
      currentSection.set("Remote");
    }
  }

  // Methods
  const handleButtonClick = (text) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("section", text);
    window.history.pushState(null, "", `${location.pathname}?${searchParams}`);
    currentSection.set(text);
  };

  // Styles
  const baseButtonClass =
    "h-[30px] w-[30px] rounded-full flex items-center justify-center mx-auto px-auto";
  const inactiveButtonClass = `text-[#727272]/90 ${baseButtonClass} border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#115DA0_0%,#06223A_100%)] dark:group-hover:bg-[#06223A] group-hover:border-none`;
  const activeButtonClass = `relative border-none ${baseButtonClass} text-white bg-[linear-gradient(90deg,#115DA0_0%,#06223A_100%)] dark:bg-[#06223A]`;
</script>

<div
  class="flex items-center justify-evenly px-2 fixed w-screen bottom-[66px] z-30 pb-4 pt-2 backdrop-blur-xl"
>
  {#each ["Remote", "Stream", "Recording", "System", "License", "User"] as section}
    <div>
      <button
        class={($currentSection !== section
          ? inactiveButtonClass
          : activeButtonClass) + (section === "Camera" ? " opacity-50" : "")}
        on:click={() => handleButtonClick(section)}
      >
        {#if section === "Remote"}
          <Router class="h-[20px] w-[20px]" />
        {:else if section === "Stream"}
          <Radio class="h-[20px] w-[20px]" />
        {:else if section === "Recording"}
          <Disc2 class="h-[20px] w-[20px]" />
        {:else if section === "System"}
          <Cast class="h-[20px] w-[20px]" />
        {:else if section === "License"}
          <FileSignatureIcon class="h-[20px] w-[20px]" />
        {:else}
          <User2 class="h-[20px] w-[20px]" />
        {/if}
      </button>
      <span
        class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
      >
        {section}
      </span>
    </div>
  {/each}
  <!-- Register -->
  <!-- <RegisterMobileDialog>
    <button
      class="flex flex-col items-center justify-center gap-1 relative"
      on:click={() =>
        showSelection === "register"
          ? (showSelection = "")
          : (showSelection = "register")}
    >
      <Icon
        icon="material-symbols:familiar-face-and-zone"
        class={`p-[11px] w-[46px] h-[46px] rounded-full ${
          showSelection === "register"
            ? "bg-[#015a62] text-white"
            : "bg-[#e8e9ea] text-[#015a62]"
        }`}
      />
      <span
        class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Register
      </span>
    </button>
  </RegisterMobileDialog> -->
</div>
