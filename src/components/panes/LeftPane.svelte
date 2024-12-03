<script lang="ts">
  import SettingsList from "../lists/SettingsList.svelte";
  import type { Node } from "@/types";
  import NodeSelection from "../node/NodeSelection.svelte";
  import { fade } from "svelte/transition";
  import CameraList from "../lists/CameraList.svelte";
  import { onMount } from "svelte";
  import { leftPaneHide, selectedNode, topPanelHide } from "@/lib/stores";
  import LayoutSelection from "../layouts/LayoutSelection.svelte";
  import {
    Bell,
    Cctv,
    Disc2,
    Expand,
    ImageDown,
    LayoutPanelLeft,
    Menu,
    Monitor,
    ScanFace,
    Search,
  } from "lucide-svelte";
  import { cn } from "@/lib";
  import PlaybackList from "../lists/PlaybackList.svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import EventList from "../lists/EventList.svelte";
  export let nodes: Node[];
  export let url: string;
  export let sessionId: string;
  // export let user;
  let showItems = true;
  let selectedScreen = 1;

  const toggleVisibility = () => {
    console.log("Toggle Visibility", $leftPaneHide);
    addUserLog(
      `user clicked to switch left pane visibility to ${$leftPaneHide}`,
    );
    if ($leftPaneHide) {
      // SHOW
      leftPaneHide.set(!$leftPaneHide);
      // localStorage.setItem("leftPaneHide", JSON.stringify($leftPaneHide));
      const cameraItems = document.getElementById("node-view");
      if (cameraItems)
        cameraItems.addEventListener(
          "transitionend",
          () => {
            showItems = !$leftPaneHide;
          },
          { once: true },
        );
    } else {
      // HIDE
      showItems = false;
      // localStorage.setItem("leftPaneHide", JSON.stringify($leftPaneHide));
      // console.log(url);
      if (url === `/session/${sessionId}`) {
        const cameraItems = document.getElementById("camera-items");
        if (cameraItems)
          cameraItems.addEventListener(
            "transitionend",
            () => {
              leftPaneHide.set(true);
            },
            { once: true },
          );
      } else {
        leftPaneHide.set(true);
      }
    }
  };
</script>

<div
  id="node-view"
  class={`left hidden sm:flex flex-col parent h-[calc(100vh-75px)] ${!url.includes("session") ? "dark:border-[#292929]  border-r-[1px]" : "border-none"}
      transition-width ease-in-out duration-300
      ${!$leftPaneHide ? `${url.includes("session") ? "w-[75px]" : "w-72"}` : "w-0"}`}
  in:fade={{ delay: 600, duration: 300 }}
  out:fade={{ delay: 0, duration: 300 }}
>
  {#if url !== `/configuration/${sessionId}`}
    <NodeSelection {nodes} {url} />
  {/if}

  {#if $selectedNode}
    {#key url}
      <div class={`flex flex-row h-full`} id="left-pane-lists-sec">
        <div class="w-full h-full">
          {#if url.includes(`/session/`)}
            <CameraList {showItems} />
          {:else if url.includes(`/playback/`)}
            <PlaybackList />
          {:else if url.includes(`/configuration/`)}
            <SettingsList {sessionId} />
          {:else if url.includes(`/events/`)}
            <EventList />
          {/if}
        </div>
      </div>
    {/key}
    {#if url.includes(`/session/`)}
      <LayoutSelection {sessionId} />
    {/if}
  {/if}
</div>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class={cn(
    `relative hidden sm:block cursor-pointer border-t border-b border-transparent`,
    url === `/session/${sessionId}` && !$topPanelHide
      ? "h-[calc(100vh-75px-57px)] mt-[56px]"
      : "h-[calc(100vh-75px)]",
  )}
  on:click={toggleVisibility}
>
  <div
    class={` ${url === `/session/${sessionId}` && "pulse-blur"} absolute -top-[1px] cursor-pointer  h-full flex items-center ${url.includes(`/configuration/${sessionId}`) && $leftPaneHide && "left-0"} ${url.includes(`/configuration/${sessionId}`) && !$leftPaneHide && "right-2"}
     z-40 hover:backdrop-blur-lg transition-all ease-in-out duration-400 ${url === `/session/${sessionId}` && !$topPanelHide && "rounded-tl-lg rounded-bl-lg "}`}
  >
    <Menu
      size={24}
      class={cn("rotate-90 text-black dark:text-white w-[24px]")}
    />
  </div>
</div>

<!-- ${url.includes(`/configuration/${sessionId}`) && $leftPaneHide
  ? "left-0"
  : "right-2"} -->
