<script lang="ts">
  import { page } from "$app/stores";
  import Stream from "./settings/Stream.svelte";
  import Camera from "./settings/Camera.svelte";
  import Recording from "./settings/Recording.svelte";
  import Remote from "./settings/Remote.svelte";
  import Groups from "./settings/Groups.svelte";
  import System from "./settings/System.svelte";
  import UserS from "./settings/UserS.svelte";
  let search: string | null = null;
  import type { LoginEvent, User } from "@/types";
  import SettingsList from "../lists/SettingsList.svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import { goto } from "$app/navigation";

  import {
    CameraIcon,
    Cast,
    Disc2,
    FileSignatureIcon,
    Boxes,
    Radio,
    Router,
    User2,
    Settings2,
  } from "lucide-svelte";
  import License from "./settings/License.svelte";
  import type { PageServerData } from "../../routes/$types";
  export let user: User;
  export let records: LoginEvent;
  export let logs: UserLog;
  export let data: PageServerData;
  export let sessionId;
  export let nodes;

  $: {
    const searchParams = new URLSearchParams($page.url.search);
    search = searchParams.get("section");
    if (search === null) {
      searchParams.set("section", "Remote");
      history.replaceState(null, "", `${location.pathname}?${searchParams}`);
      search = "Remote";
    }
  }

  const handleButtonClick = (text) => {
    goto(`/settings/${sessionId}?section=${text}`);
  };
</script>

<section
  class="right h-[calc(100vh-75px)] w-full flex-1 bg-background flex flex-row-reverse"
>
<!-- class="flex flex-col gap-4 items-center justify-center pl-2 pr-4 h-full my-auto" -->
  <div
      class="flex-shrink-0 flex flex-col gap-6 items-center justify-center px-2  bg-gradient-to-b from-[#000610] via-[#000307] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"

  >
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          addUserLog(`user clicked on Search button, top panel`);
          handleButtonClick("Remote");
        }}
        class={search !== "Remote"
         ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}  ><Router class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-xs ${search !== "Remote" ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}

      >
        Remote
      </p>
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("Stream");
        }}
        class={search !== "Stream"
       ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}  ><Radio class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "Stream" ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}

      >
        Stream
      </p>
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("Recording");
        }}
        class={search !== "Recording"
         ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `} ><Disc2 class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "Recording" ?  "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        Recording
      </p>
    </span>
    <!-- <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("System");
        }}
        class={search !== "System"
       ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}   ><Cast class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "System" ?  "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        System
      </p>
    </span> -->
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("Camera");
        }}
        class={search !== "Camera"
        ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}  ><CameraIcon class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "Camera" ?  "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        Camera
      </p>
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("Groups");
        }}
        class={search !== "Groups"
        ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
      ><Boxes class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "Groups" ?  "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        Groups
      </p>
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        on:click={() => {
          handleButtonClick("User");
        }}
        class={search !== "User"
        ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}  ><Settings2 class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${search !== "User" ?  "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        Permissions
      </p>
    </span>
  </div>
  <div class="w-full h-full">
    {#if search === "Remote"}
      <Remote />
    {:else if search === "Stream"}
      <Stream />
    {:else if search === "Recording"}
      <Recording />
    <!-- {:else if search === "System"}
      <System /> -->
    {:else if search === "Camera"}
      <Camera {user} />
    {:else if search === "License"}
      <License session={data.session} />
    {:else if search === "Groups"}
      <Groups session={data.session} data={nodes}/>
    {:else}
      <UserS {data} />
    {/if}
  </div>

  <!-- <div
    class="h-[calc(100vh-75px)] w-1/4 max-w-72 dark:border-[#292929] border-l-[1px]"
  >
    <SettingsList {sessionId} />
  </div> -->
</section>
