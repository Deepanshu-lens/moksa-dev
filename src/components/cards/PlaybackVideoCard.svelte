<script lang="ts">
  export let video: string;
</script>

<div
  class="flex flex-col gap-5 w-[320px] playback-card-shadow p-0.5 pb-4 border border-solid border-[#e4e4e4] dark:bg-[#242424] dark:border-none items-center justify-center rounded-lg"
>
  {#if typeof video === "string"}
    <div
      class="relative flex w-full items-center justify-center"
      id={`container-${video}`}
    >
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        id="my-video"
        class="video-js"
        controls
        preload="auto"
        width="640"
        height="264"
      >
        <source src={`/PlayBack/${video}`} type="video/webm" />
      </video>
    </div>
    <div class="flex flex-col w-full px-4 gap-2">
      <span class="text-base text-[#16192C] font-semibold dark:text-[#828282]">
        {" "}
        Camera:{" "}

        {video.split("_").slice(0, 4).join("_")}
      </span>
      <span class="text-sm text-[#828282]">
        Date: {video.split("_").slice(4, 7).join("_")}, Time: {video
          .split("_")
          .slice(7, 10)
          .join("_")
          .split(".webm")[0]}
      </span>
      <button
        class="text-white bg-[#015a62] rounded-md px-3 py-1.5 w-[100px] text-sm"
      >
        View Feed
      </button>
    </div>
  {:else}
    <div
      class="relative flex w-full items-center justify-center"
      id={`container-${video[0].id}`}
    >
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        id="my-video"
        class="video-js"
        controls
        preload="auto"
        width="640"
        height="264"
      >
        <source src={`/PlayBack/${video[0].webmFile}`} type="video/webm" />
      </video>
    </div>
    <div class="flex flex-col w-full px-4 gap-2">
      <span class="text-base text-[#16192C] font-semibold dark:text-[#828282]">
        {" "}
        Camera:
        {video[0].id}
      </span>
      <span class="text-xsm text-[#828282]">
        Date: {video[0].startTime}, Time: {video[0].startTime}
      </span>
      <button
        class="text-white bg-[#015a62] rounded-md px-3 py-1.5 w-[100px] text-sm"
      >
        View Feed
      </button>
    </div>
  {/if}
</div>

<!-- {"camera":"udw0iqjyn0nv5ti","collectionId":"54r3sw9pwb1oicf","collectionName":"playback","created":"2024-03-15 12:48:16.369Z","endTime":"","id":"85o1h5zb059s959","startTime":"2024-03-15T12:48:16.000Z","updated":"2024-03-16 16:34:22.035Z","url":"./PlayBack/10_20_30_11_2024_03_15_13_40_25.ts","expand":{},"webmFile":"10_20_30_11_2024_03_15_13_40_25.webm"} -->
