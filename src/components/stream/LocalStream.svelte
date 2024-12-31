<script lang="ts">
  import type { Camera, SelectedNode } from "@/types";
  import { activeCamera, hoveredCamera, fullscreen } from "@/lib/stores";
  import { cn } from "@/lib";
  export let camera: Camera;
  export let videoElement: HTMLElement;

  let parentDiv: HTMLDivElement;

  let videoStarted = false;

  async function connectToStream(videoElement, streamId) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    // Add transceivers to get audio/video tracks
    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    // Connect to WebSocket server with stream ID
    const ws = new WebSocket(
      `wss://vms.lenscorp.cloud:3050/watch?suuid=${streamId}`,
    );

    // Set up video element when we get a stream
    pc.ontrack = (event) => {
      if (event.track.kind === "video") {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(event.track);
        videoElement.srcObject = mediaStream;

        // Monitor stats for this stream
        // setInterval(async () => {
        //   const stats = await pc.getStats();
        //   stats.forEach((report) => {
        //     if (report.type === "inbound-rtp" && report.kind === "video") {
        //       console.log(`Video stats for ${streamId}:`, {
        //         packetsReceived: report.packetsReceived,
        //         bytesReceived: report.bytesReceived,
        //         framesDecoded: report.framesDecoded,
        //       });
        //     }
        //   });
        // }, 1000);
      }
    };

    // Log ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state for ${streamId}:`,
        pc.iceConnectionState,
      );
      if (pc.iceConnectionState === "disconnected") {
        console.log(`Attempting reconnection for ${streamId}...`);
        pc.restartIce();
      }
    };

    // Create offer and set local description
    async function createOffer() {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to server
        ws.send(
          JSON.stringify({
            type: "offer",
            sdp: btoa(pc.localDescription.sdp),
            suuid: streamId,
          }),
        );
        console.log(`Sent offer for ${streamId}`);
      } catch (e) {
        console.error(`Error creating offer for ${streamId}:`, e);
      }
    }

    // Handle WebSocket messages
    ws.onopen = () => {
      console.log(`WebSocket connected for ${streamId}`);
      createOffer();
    };

    ws.onmessage = async (event) => {
      //   try {
      //     // Try to parse as JSON first
      //     const msg = JSON.parse(event.data);

      //     if (msg.type === 'streams') {
      //         // Handle stream updates
      //         const streams = msg.streams;
      //         console.log('Stream update:', streams);

      //         // Add new streams
      //         for (let streamId in streams) {
      //             if (!activeStreams.has(streamId)) {
      //                 createVideoPlayer(streamId);
      //             }
      //         }
      //     }
      // } catch (e) {
      // If not JSON, treat as SDP
      try {
        const sdp = atob(event.data);
        const answer = new RTCSessionDescription({
          type: "answer",
          sdp: sdp,
        });
        await pc.setRemoteDescription(answer);
      } catch (e) {
        console.error("Error handling WebSocket message:", e);
      }
      // }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${streamId}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for ${streamId}`);
    };
  }

  // fetch('https://vms.lenscorp.cloud:3050/streams')
  //     .then(response => response.json())
  //     .then(streams => {
  //         console.log('Available streams:', streams);
  //         streams.forEach(stream => {
  //             createVideoPlayer(stream.id);
  //         });
  //     })
  //     .catch(error => {
  //         console.error('Error fetching streams:', error);
  //     });

  const attachVideo = (realVideo) => {
    // const existingVideo = parentDiv.querySelector("video");
    // if (existingVideo) {
    //   console.log("Video already attached.");
    //   return;
    // }
    parentDiv.appendChild(realVideo);
    // const realVideo = videoElement.querySelector("video");
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
      connectToStream(realVideo, camera.id);
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
