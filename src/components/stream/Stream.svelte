<script lang="ts">
  import type { Camera, SelectedNode } from "@/types";
  import { VideoStream } from "@/lib/video-stream";
  import { activeCamera, hoveredCamera, fullscreen } from "@/lib/stores";
  import { cn } from "@/lib";
  export let camera: Camera;
  export let videoElement: HTMLElement;

  let parentDiv: HTMLDivElement;

  let videoStarted = false;

  const attachVideo = (videoElement) => {
    const existingVideo = parentDiv.querySelector("video");
    if (existingVideo) {
      console.log("Video already attached.");
      return;
    }
    parentDiv.appendChild(videoElement);
    const realVideo = videoElement.querySelector("video");
    if (!realVideo) {
      console.error("could not find real video");
    } else {
      realVideo.controls = false;
      realVideo.style.maxWidth = "100%";
      realVideo.style.objectFit = "fill";
      realVideo.className = "video-element";
      realVideo.background = true;
      realVideo.muted = true;
      realVideo.visibilityCheck = false;
      realVideo.addEventListener("play", () => {
        videoStarted = true;
      });
      realVideo.addEventListener("pause", () => {
        videoStarted = false;
      });
    }
  };
  $: document && parentDiv && videoElement && attachVideo(videoElement);
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class={cn(
    `mx-auto w-full h-full relative 
  flex items-center justify-center`,
    // !videoStarted &&
    "min-w-full  h-full flex-shrink-0 bg-gradient-to-r from-slate-300 via-slate-500 to-slate-700",
    !$fullscreen &&
      ($activeCamera === camera.id
        ? `animate-gradient-border border-4`
        : $hoveredCamera === camera.id
          ? `w-full h-full relative border-[#3D81FC] border-4 border-solid`
            : `hover:border-[#3D81FC] hover:border-4`),
  )}
  id={camera.id}
  bind:this={parentDiv}
  on:click={() => {
    console.log("CLICKED");
    activeCamera.update((previous) =>
      previous === camera.id ? "" : camera.id,
    );
  }}
/>

<style>
  .video-element {
    position: relative; /* Ensure position is not 'static' */
    z-index: 200; /* Increase z-index to ensure it's above the span */
  }

  .span-animation {
    position: relative; /* Ensure position is not 'static' */
    z-index: 1; /* Ensure this is lower than the video's z-index */
  }

  .new-animate {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      z-index: 1;
    }
    50% {
      opacity: 0.5;
      z-index: 1;
    }
  }
</style>
