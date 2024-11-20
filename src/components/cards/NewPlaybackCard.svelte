<script type="ts">
  import { Edit, Trash } from "lucide-svelte";
  import { convertedVideos } from "@/lib/stores";
  import { toast } from "svelte-sonner";

  export let video;
  // console.log('videocarddata',video);
  const date = new Date(video.startTime);
</script>

<div
  class="w-[225px] h-[55px] bg-[#f9f9f9] dark:bg-black rounded-md shad flex items-center justify-start p-2 gap-2 mx-auto dark:border-2 dark:border-slate-800"
>
  <button
    on:click={() => {
      if ($convertedVideos.length <= 3) {
        convertedVideos.update((videos) => [...videos, video]);
      } else {
        toast.error("Maximum limit of 4 videos reached");
      }
    }}
    class="h-[32px] w-[32px] rounded-full bg-white dark:bg-slate-800 grid place-items-center"
    ><svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-external-link text-[#727272] dark:text-slate-200"
      ><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
        d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
      /></svg
    ></button
  >
  <span
    ><p class="text-sm font-medium">
      Rec : <span class="text-primary">{video.cameraName}</span>
    </p>
    <p class="text-xs text-black/70 dark:text-slate-300">
      {date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </p></span
  >
  <span class="flex items-center gap-2 ml-auto"
    ><Edit class="text-[#727272] dark:text-slate-200" size={16} />
    <Trash class="text-[#727272] dark:text-slate-200" size={16} /></span
  >
</div>

<style>
  .shad {
    box-shadow: 0px 4px 12px 0px #00000014;
  }
</style>
