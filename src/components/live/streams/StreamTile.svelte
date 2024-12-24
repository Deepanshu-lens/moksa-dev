<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Icon from "@iconify/svelte";

  import { VideoStream } from "@/lib/video-stream";
  import { personCount, roiCamera, selectedCamera } from "@/stores";
  import { PersonStanding } from "lucide-svelte";
  import { getHeatMapImage } from "@/managers/get-heathmap";
  import ImagePreviewModal from "./ImagePreviewModal.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { cn } from "@/lib/utils";
  import { writable } from "svelte/store";
  import { updateTransform } from "@/lib/video-utils";

  const isProduction = import.meta.env.PUBLIC_ENV === "production";

  // Props
  export let url: string = "";
  export let id: string = "";
  export let mode: string = "mse";
  export let media: string = "video,audio";
  export let background: boolean = false;
  export let visibilityThreshold: number = 0;
  export let visibilityCheck: boolean = true;
  export let name: string;

  $: console.log(name, "name");
  $: console.log(id, "id");
  $: console.log(url, "url");

  // State Variables
  let videoElement: HTMLVideoElement;
  let mainVideoElement: VideoStream | null = null;
  let state: string = "LOADING";
  const isFullScreen = writable<boolean>(false);
  let loading: boolean = false;
  let imgDialogOpen = writable<boolean>(false);

  // Fullscreen Functions
  function fullscreen(id: string) {
    let cell = document.getElementById(`grid-cell-${id}`);
    if (cell?.requestFullscreen) {
      cell.requestFullscreen({ navigationUI: "show" });
      isFullScreen.set(true);
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      const mainStream = document.createElement("video-stream");
      mainStream.mode = mode;
      mainStream.id = id + "_FULL";
      mainStream.className = "video-player rounded-md";
      mainStream.src = url + "_FULL";
      mainStream.wsURL = url + "_FULL";
      mainStream.addEventListener("statechange", (event) => {
        if (event.detail.state === "PLAYING") {
          console.log("READY TO PLAY!!!!!");
          const existingStream = document.getElementById(id);
          if (existingStream) {
            existingStream.parentNode?.insertBefore(mainStream, existingStream);
            existingStream.remove();
          }
        }
      });
      document.getElementById(`grid-cell-${id}`)?.appendChild(mainStream);
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      isFullScreen.set(false);
    }
  }

  function handleFullscreenChange() {
    if (!document.fullscreenElement) {
      isFullScreen.set(false);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      const subStream = document.createElement("video-stream");
      subStream.mode = mode;
      subStream.id = id;
      subStream.className = "video-player rounded-md";
      subStream.src = url;
      subStream.wsURL = url;
      const mainStream = document.getElementById(`${id}_FULL`);
      console.log(mainStream, subStream);
      subStream.addEventListener("statechange", (event) => {
        if (event.detail.state === "PLAYING") {
          console.log("READY TO PLAY!!!!!");
          if (mainStream) {
            mainStream.parentNode?.insertBefore(subStream, mainStream);
            mainStream.remove();
          }
        }
      });
      // if (mainStream) {
      //   mainStream.parentNode?.insertBefore(subStream, mainStream);
      //   mainStream.remove();
      // }
      document.getElementById(`grid-cell-${id}`)?.appendChild(subStream);
    }
  }

  // Heatmap Image Function
  const getHeatImg = async (id: string) => {
    imgDialogOpen.set(true);
    loading = true;
    await getHeatMapImage(id);
    loading = false;
  };

  // Lifecycle Hooks
  onMount(() => {
    if (!customElements.get("video-stream")) {
      customElements.define("video-stream", VideoStream);
    }
    if (videoElement) {
      videoElement.mode = mode;
      videoElement.media = media;
      videoElement.background = background;
      videoElement.visibilityThreshold = visibilityThreshold;
      videoElement.visibilityCheck = visibilityCheck;

      videoElement.addEventListener("statechange", (event) => {
        state = videoElement.state;
      });
    }

    setupZoomAndPan();
  });

  onDestroy(() => {
    if (videoElement) {
      videoElement.ondisconnect();
    }
  });

  // Reactive Statement for URL changes
  $: if (videoElement && url) {
    videoElement.src = url;
  }

  // Zoom and Pan Setup
  function setupZoomAndPan() {
    const zoomableAreas =
      document.querySelectorAll<HTMLElement>(".zoomable-area");
    let scale: number = 1;
    const zoomStep: number = 0.2;
    const maxScale: number = 3;
    const minScale: number = 1;
    let translateX: number = 0;
    let translateY: number = 0;
    let isDragging: boolean = false;
    let startX: number | null = null;
    let startY: number | null = null;

    zoomableAreas.forEach((area) => {
      const video = area.querySelector<HTMLVideoElement>("video");

      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
          scale = 1;
          translateX = 0;
          translateY = 0;
          if (video) {
            updateTransform(video, scale, translateX, translateY);
          }
        }
      });

      area.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault();
        if (document.fullscreenElement) {
          if (e.deltaY < 0) {
            scale = Math.min(scale + zoomStep, maxScale);
          } else {
            scale = Math.max(scale - zoomStep, minScale);
          }
          if (video) {
            updateTransform(video, scale, translateX, translateY);
          }
        }
      });

      area.addEventListener("mousedown", (e: MouseEvent) => {
        if (document.fullscreenElement) {
          isDragging = true;
          startX = e.pageX - translateX;
          startY = e.pageY - translateY;
          area.style.cursor = "grabbing";
        }
      });

      area.addEventListener("mousemove", (e: MouseEvent) => {
        if (isDragging && document.fullscreenElement) {
          translateX = e.pageX - (startX ?? 0);
          translateY = e.pageY - (startY ?? 0);
          if (video) {
            const videoRect = video.getBoundingClientRect();
            const areaRect = area.getBoundingClientRect();
            const maxTranslateX =
              (videoRect.width * scale - areaRect.width) / 2;
            const maxTranslateY =
              (videoRect.height * scale - areaRect.height) / 2;
            const minTranslateX =
              areaRect.width / 2 - (videoRect.width * scale) / 2;
            const minTranslateY =
              areaRect.height / 2 - (videoRect.height * scale) / 2;
            translateX = Math.max(
              minTranslateX,
              Math.min(maxTranslateX, translateX)
            );
            translateY = Math.max(
              minTranslateY,
              Math.min(maxTranslateY, translateY)
            );
            // Block panning outside the zoomable area
            if (
              translateX < -areaRect.width / 2 ||
              translateX > areaRect.width / 2
            ) {
              translateX = Math.max(
                -areaRect.width / 2,
                Math.min(areaRect.width / 2, translateX)
              );
            }
            if (
              translateY < -areaRect.height / 2 ||
              translateY > areaRect.height / 2
            ) {
              translateY = Math.max(
                -areaRect.height / 2,
                Math.min(areaRect.height / 2, translateY)
              );
            }
            updateTransform(video, scale, translateX, translateY);
          }
        }
      });

      area.addEventListener("mouseup", () => {
        isDragging = false;
        area.style.cursor = "grab";
      });

      area.addEventListener("mouseleave", () => {
        isDragging = false;
        area.style.cursor = "grab";
      });
    });
  }
</script>

<!-- HTML Template -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

<!-- ROI Camera is selected -->
{#if !!$roiCamera}
  <div
    id={`grid-cell-${id}`}
    class={cn(
      "zoomable-area h-[100%]",
      state === "LOADING"
        ? "camera-placeholder"
        : "relative overflow-hidden group"
    )}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <video-stream
      bind:this={videoElement}
      class={cn(
        "video-player rounded-md",
        $selectedCamera === id && "border-2 border-green-300"
      )}
      {id}
    />

    <div
      class="absolute left-4 top-2 rounded-md bg-neutral-600 bg-opacity-50 transition-opacity duration-300 text-white flex items-center gap-x-2 text-nowrap p-1"
    >
      <span class="size-2 bg-green-700 rounded-full"></span>
      {name}
    </div>
  </div>
  <!-- when roi is not selected -->
{:else}
  <div
    id={`grid-cell-${id}`}
    class={cn(
      "zoomable-area h-[100%]",
      state === "LOADING"
        ? "camera-placeholder"
        : "relative overflow-hidden group"
    )}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <video-stream
      bind:this={videoElement}
      class={cn(
        "video-player rounded-md",
        $selectedCamera === id && "border-2 border-green-300"
      )}
      {id}
      on:click={() => selectedCamera.set($selectedCamera === id ? "" : id)}
      on:dblclick={() => {
        if ($isFullScreen) {
          exitFullscreen();
        } else {
          fullscreen(id);
        }
      }}
    />
    {#if !$isFullScreen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="absolute top-2 right-2 rounded-md bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        on:click={() => fullscreen(id)}
      >
        <Icon
          icon="mdi:fullscreen"
          class="text-white text-3xl cursor-pointer"
        />
      </div>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="fixed top-5 right-5 rounded-md bg-black bg-opacity-50 transition-opacity duration-300"
        on:click={() => exitFullscreen()}
      >
        <Icon
          icon="tabler:minimize"
          class="text-white text-3xl cursor-pointer"
        />
      </div>
    {/if}

    {#if $personCount.find((item) => item.camera === id)?.count > 0 && isProduction}
      <div
        class="absolute left-4 bottom-2 rounded-md bg-neutral-600 bg-opacity-50 transition-opacity duration-300 text-white flex items-center gap-x-2 w-10"
      >
        <PersonStanding size={18} />
        {$personCount.find((item) => item.camera === id)?.count}
      </div>
    {/if}
    <div
      class="absolute left-4 top-2 rounded-md bg-neutral-600 bg-opacity-50 transition-opacity duration-300 text-white flex items-center gap-x-2 text-nowrap p-1"
    >
      <span class="size-2 bg-green-700 rounded-full"></span>
      {name}
    </div>
    {#if isProduction}
      <div
        class="absolute right-10 bottom-2 rounded-md transition-opacity duration-300 flex items-center gap-x-2 w-10"
      >
        <span class="size-2 bg-green-700 rounded-full ml-2"></span>
        <Button
          variant="ghost"
          class="text-white"
          on:click={() => getHeatImg(id)}>H</Button
        >
      </div>
    {/if}
    <ImagePreviewModal {loading} {imgDialogOpen}></ImagePreviewModal>
  </div>
{/if}

<style>
  .video-player {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: fill;
  }

  .camera-placeholder {
    position: relative;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .camera-placeholder::before {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    animation: shimmer 1.5s infinite;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
