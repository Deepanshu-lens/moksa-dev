<script lang="ts">
    import { VideoStream } from "@/lib/video-stream";
    import { cn } from "@/lib";
    export let videoElement: HTMLElement;
    let parentDiv: HTMLDivElement;
    let videoStarted = false;

  
    const attachVideo = (videoElement) => {
        console.log(videoElement)
        console.log(parentDiv.contains(videoElement))
        console.log(parentDiv.querySelector('video-stream'))
        if(parentDiv.querySelector('video-stream')=== null) {
            parentDiv.appendChild(videoElement);
        }

      const realVideo = videoElement.querySelector("video");
      if (!realVideo) {
        console.error("could not find real video");
    } else {
        realVideo.controls = false;
        realVideo.style.maxWidth = "100%";
        realVideo.style.objectFit = "fill";
        realVideo.className = "rounded-lg video-element";
        realVideo.background = true;
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
       rounded-lg  flex items-center justify-center`,
      "min-w-full  h-full flex-shrink-0 bg-gradient-to-r from-slate-300 via-slate-500 to-slate-700 hover:border-primary hover:border-4")
    }
    bind:this={parentDiv}
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
  