<script lang="ts">
  import Camera from "./settings/Camera.svelte";
  let search: string | null = null;

  import { CameraIcon } from "lucide-svelte";
  export let user;
  export let records;
  export let logs;
  export let data;
  export let sessionId;
  export let nodes;

  $: {
    // Get the query string from the window's URL
    const queryString = window.location.search;

    // Parse the query string using URLSearchParams
    const searchParams = new URLSearchParams(queryString);

    // Get a specific parameter
    search = searchParams.get("section");

    console.log(search); // Logs the value of the "section" parameter
    if (search === null) {
      searchParams.set("section", "Remote");
      history.replaceState(null, "", `${location.pathname}?${searchParams}`);
      search = "Camera";
    }
  }
</script>

<section
  class="right h-[calc(100vh-75px)] w-full flex-1 bg-background flex flex-row-reverse"
>
  <div
    class="flex-shrink-0 flex flex-col gap-6 items-center justify-center px-2 bg-gradient-to-b from-[#000610] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"
  >
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <a
        href={`/settings/${sessionId}?section=Camera`}
        class={search !== "Camera"
          ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white/[.7] bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><CameraIcon class="h-[22px] w-[22px]" />
      </a>
      <p
        class={`text-xs ${search !== "Camera" ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : "text-[#07E1A4]"}`}
      >
        Camera
      </p>
    </span>
  </div>
  <div class="w-full h-full">
    <Camera {user} />
  </div>
</section>
