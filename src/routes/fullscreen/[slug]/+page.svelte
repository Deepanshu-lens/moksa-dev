<script lang="ts">
  import { Shrink } from "lucide-svelte";
  import { ArrowLeft } from "lucide-svelte";
  import { Expand } from "lucide-svelte";
  import { page } from "$app/stores";
  import Stream from "@/components/stream/Stream.svelte";
  import type { Camera } from "@/types";
  import PocketBase from "pocketbase";
  let videos: { [key: string] } = {};
  const neededUrl = $page.url.hostname;
  import { onMount } from "svelte";
  //   const slug = $page.url.pathname.split('/').pop();
  const slug = $page.params.slug;
  const PB = new PocketBase(`https://server.moksa.ai`);
  let queryCam: Camera;
  let isSingleFullscreen = false;

  const singleFullscreen = () => {
    let cell = document.getElementById(`cell-${queryCam.id}`);
    cell?.requestFullscreen({ navigationUI: "show" });
    isSingleFullscreen = true;
  };

  const exitFullscreen = () => {
    document.exitFullscreen();
    isSingleFullscreen = false;
  };

  onMount(async () => {
    const query = new URLSearchParams(window.location.search).get("query");
    // console.log(query);
    if (query) {
      try {
        const camera = await PB.collection("camera").getFullList({
          filter: `id = "${query}"`,
        });
        if (camera) {
          //   console.log(camera);
          queryCam = camera[0];
          initVideo(camera[0]);
        }
      } catch (error) {
        console.error("Error fetching camera:", error);
      }
    }
  });

  const initVideo = (camera) => {
    console.log("camera inside init", camera);
    if (videos[camera]) {
      return;
    }
    let video = document.createElement("video-stream") as VideoStreamType;
    video.id = `stream-${camera.id}`;
    video.mode = "mse";
    video.url = camera.url;
    video.src = new URL(
      `wss://server.moksa.ai/api/ws?src=${camera.id}&nodeID=${1}&cn=${camera.name}`,
    );
    video.style.position = "relative";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.zIndex = "10";
    video.background = true;
    video.visibilityCheck = false;
    videos[camera] = video;
  };
</script>

{#if queryCam}
  <div
    id={`cell-${queryCam.id}`}
    class={`h-full w-full relative ${isSingleFullscreen ? "max-h-[calc(100vh-75px)]" : "max-h-screen"}`}
  >
    <Stream videoElement={videos[queryCam]} camera={queryCam} />
    {#if !isSingleFullscreen}
      <button
        class=" flex items-center gap-1 absolute py-1 px-2 top-2 right-2 cursor-pointer bg-[rgba(0,0,0,.5)] text-white rounded z-20 disabled:cursor-not-allowed"
        id="fullscrennbtn"
        on:click={() => singleFullscreen()}
      >
        <Expand size={16} />
        Fullscreen</button
      >
    {:else}
      <button
        class=" flex items-center gap-1 absolute py-1 px-2 top-2 right-2 cursor-pointer bg-[rgba(0,0,0,.5)] text-white rounded z-20 disabled:cursor-not-allowed"
        on:click={() => exitFullscreen()}><Shrink size={16} /> Minimize</button
      >
    {/if}
    <button
      class=" flex items-center gap-1 absolute py-1 px-2 top-2 left-2 cursor-pointer bg-[rgba(0,0,0,.5)] text-white rounded z-20 disabled:cursor-not-allowed"
      on:click={() => (window.location.href = `/session/${slug}`)}
      ><ArrowLeft size={16} /> Back to Grid</button
    >
  </div>
{/if}
