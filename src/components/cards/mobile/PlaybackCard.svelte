<script lang="ts">
  export let video;
</script>

<div
  class="flex flex-col p-3 bg-white rounded-sm playback-card-shadow gap-1 flex-shrink-0"
>
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    id="my-video"
    class="video-js aspect-video"
    controls
    preload="auto"
    width="250"
    height="300"
  >
    <source src={`/PlayBack/${video}`} type="video/webm" />
  </video>

  <div class="flex flex-col items-center justify-center w-full px-1 gap-2">
    <span class="text-sm text-[#828282]">
      {" "}
      Recording from camera:{" "}
      <span class="text-[#fb9a2e] font-semibold"
        >{video.split("_").slice(0, 4).join("_")}</span
      >
    </span>
    <span class="text-xs text-[#828282]">
      Date: {video.split("_").slice(4, 7).join("_")}, Time: {video
        .split("_")
        .slice(7, 10)
        .join("_")
        .split(".webm")[0]}
    </span>
  </div>
</div>
