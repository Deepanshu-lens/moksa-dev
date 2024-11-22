<script>
  import { onMount, onDestroy } from "svelte";
  import Icon from "@iconify/svelte";

  import { VideoStream } from "@/lib/video-stream";
  import { personCount, selectedCamera } from "@/stores";
  import { PersonStanding, Minimize } from "lucide-svelte";
  import { getHeatMapImage } from "@/managers/get-heathmap";
  import ImagePreviewModal from "./ImagePreviewModal.svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { cn } from "@/lib/utils";
  import { writable } from "svelte/store";

  // Props
  export let url = ""; // WebSocket URL for the stream
  export let id = "";
  export let mode = "mse"; // Supported modes
  export let media = "video,audio"; // Requested media types
  export let background = false; // Run stream when not displayed
  export let visibilityThreshold = 0; // Viewport visibility threshold
  export let visibilityCheck = true; // Check browser tab visibility
  export let name;

  let videoElement;
  let state = "LOADING";
  const isFullScreen = writable(false);

  function fullscreen(id) {
    // videoElement.changeURL(`wss://vms.lenscorp.cloud/api/ws?src=${id}_FULL`);
    let cell = document.getElementById(`grid-cell-${id}`);

    if (cell.requestFullscreen) {
      cell.requestFullscreen({ navigationUI: "show" });
      isFullScreen.set(true);
      document.addEventListener(
        "fullscreenchange",
        function handleFullscreenChange() {
          if (!document.fullscreenElement) {
            isFullScreen.set(false);
            // Reset the data-url when exiting fullscreen
            // videoElement.changeURL(`wss://vms.lenscorp.cloud/api/ws?src=${id}`);

            // Remove the event listener after fullscreen change is handled
            document.removeEventListener(
              "fullscreenchange",
              handleFullscreenChange
            );
          }
        }
      );
    }
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      isFullScreen.set(false);
    }
  }

  onMount(() => {
    // Ensure VideoStream is defined before using it
    if (!customElements.get("video-stream")) {
      customElements.define("video-stream", VideoStream);
    }

    // Configure the video stream element
    if (videoElement) {
      videoElement.mode = mode;
      videoElement.media = media;
      videoElement.background = background;
      videoElement.visibilityThreshold = visibilityThreshold;
      videoElement.visibilityCheck = visibilityCheck;

      // Set the source to start streaming
      // if (url) {
      //   videoElement.src = url;
      // }

      videoElement.addEventListener("statechange", (event) => {
        state = videoElement.state;
      });
    }
  });

  onDestroy(() => {
    if (videoElement) {
      videoElement.ondisconnect();
    }
  });

  // Handle stream URL changes
  $: if (videoElement && url) {
    videoElement.src = url;
  }

  let loading = false;
  let imgDialogOpen = writable(false);

  const getHeatImg = async (id) => {
    imgDialogOpen.set(true);
    loading = true;
    await getHeatMapImage(id);
    loading = false;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  id={`grid-cell-${id}`}
  class={state === "LOADING"
    ? "camera-placeholder"
    : "relative overflow-hidden group"}
>
  <!-- svelte-ignore element_invalid_self_closing_tag -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <video-stream
    bind:this={videoElement}
    class={cn(
      "video-player rounded-md",
      $selectedCamera === id && "border-2 border-green-300"
    )}
    {id}
    on:click={() => selectedCamera.set($selectedCamera === id ? "" : id)}
  />
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if !$isFullScreen}
    <!-- when full screen is off -->
    <div
      class="absolute top-2 right-2 rounded-md bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      on:click={() => fullscreen(id)}
    >
      <Icon icon="mdi:fullscreen" class="text-white text-3xl cursor-pointer" />
    </div>
  {:else}
    <!-- when screen is full screen -->
    <div
      class="fixed top-5 right-5 rounded-md bg-black bg-opacity-50 transition-opacity duration-300"
      on:click={() => exitFullscreen()}
    >
      <Icon icon="tabler:minimize" class="text-white text-3xl cursor-pointer" />
    </div>
  {/if}

  {#if $personCount.find((item) => item.camera === id)?.count > 0}
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
  <div
    class="absolute right-10 bottom-2 rounded-md transition-opacity duration-300 flex items-center gap-x-2 w-10"
  >
    <span class="size-2 bg-green-700 rounded-full ml-2"></span>
    <Button variant="ghost" class="text-white" on:click={() => getHeatImg(id)}
      >H</Button
    >
  </div>
  <ImagePreviewModal {loading} {imgDialogOpen}></ImagePreviewModal>
</div>

<style>
  .video-player {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
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

  /* Shimmer animation */
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
