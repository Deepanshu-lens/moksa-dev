<script lang="ts">
  import {
    Search,
    Filter,
    Expand,
    ChevronRight,
    Trash,
    X,
    ChevronDown,
  } from "lucide-svelte";
  import PocketBase from "pocketbase";
  import { addUserLog } from "@/lib/addUserLog";
  import PlaybackList from "../lists/PlaybackList.svelte";
  import { page } from "$app/stores";
  import { convertedVideos, selectedNode, uniqueUrlList } from "@/lib/stores";
  import PlaybackStream from "./PlaybackStream.svelte";
  import { onDestroy } from "svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
  import { get, writable } from "svelte/store";
  import AWSPlayer from "./AWSPlayer.svelte";
  let showRightPanel: boolean = true;
  let playbackFullscreen = false;
  let showFilters = false;
  let nvrList = writable([]);
  let isLoading = writable(false);
  let cameraList = [];
  let currentNvr;
  let addMode = 2;
  let videos: { [key: string]: HTMLElement } = {};

  export let data;
  export let features;
  const nodes = data.nodes;

  const user = data.user;
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  $: if ($selectedNode && addMode === 1) {
    (async () => {
      const list = await PB.collection("nvr").getFullList({
        filter: `node~"${$selectedNode.id}"`,
      });
      for (const nvr of list) {
        const pingStatus = await PB.collection("nvr_ping_status").getList(
          1,
          1,
          {
            filter: `nvr="${nvr.id}"`,
            sort: "-created",
          },
        );
        nvr.pingStatus = pingStatus.items[0];
      }

      nvrList.set(list);
    })();
  }

  const initVideo = async (camera, index) => {
    console.log(index);

    if (videos[index]) {
      console.log("video c.id exists", index);
      return;
    }
    console.log(
      `ws://${$page.url.hostname}:8082/api/ws?src=${currentNvr?.ip + "/" + camera.url.split("channels/")[1]}&nodeID=${1}&cn=${camera?.expand?.camera?.name}`,
    );
    let video = document.createElement("video-stream") as VideoStreamType;
    video.id = `playback-stream-${index}`;
    video.mode = "mse";
    video.url = camera.url;
    video.src = new URL(
      `ws://${$page.url.hostname}:8082/api/ws?src=${currentNvr?.ip.replace(/\./g, "_") + "_" + camera.url.split("channels/")[1]}&nodeID=${1}&cn=${camera?.expand?.camera?.name}`,
    );
    video.style.position = "relative";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.zIndex = "10";
    video.background = true;
    video.visibilityCheck = false;
    videos[index] = video;
    // console.log(videos[camera.id]);

    // console.log(videos)
  };

  async function getList(item) {
    console.log($selectedNode.name);
    console.log("calling camera pocketbase collection placubacl");
    const list = await PB.collection("camera").getList(0, 100, {
      filter: `node~"${$selectedNode.id}" && save = true`,
      sort: "-created",
    });
    console.log("camera status list", list);
    // list.items.forEach((item) => {
    // if (!$uniqueUrlList.some((uniqueItem) => uniqueItem.url === item.url)) {
    //   uniqueUrlList.update((currentList) => {
    //     currentList.push(item);
    //     return currentList;
    //   });
    // }
    // });
    uniqueUrlList.set(list.items);
  }

  $: if ($convertedVideos.length > 0 && addMode === 1) {
    // console.log("first");
    $convertedVideos.forEach((video, index) => {
      if (videos[index]) {
        console.log("video exists", index);
      } else {
        console.log("initing video", index);
        initVideo(video, index);
      }
    });
  }

  async function removePlayers() {
    $convertedVideos.forEach(async (video, index) => {
      console.log("REMOVE playesrs", video);
      await fetch(
        `http://${$page.url.hostname}:8085/api/endplayback?id=${currentNvr.ip.replace(/\./g, "_") + "_" + video.url.split("channels/")[1]}&name=${video.url.split("channels/")[1]}&url=url&subUrl=subUrl`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
        .then(async (res) => {
          const data = await res.json();
          console.log(data);
          if (videos[index]) {
            if (
              videos[index].src instanceof WebSocket &&
              videoElement.src.readyState === WebSocket.OPEN
            ) {
              videos[index].src.close();
            }
            videos[index].remove();
            delete videos[index];
            convertedVideos.set([]);
            // setTimeout(() => {
            //   initVideo(video,index)
            // }, 100);
          }
        })
        .catch((err) => console.log(err));
    });
  }

  onDestroy(async () => {
    await removePlayers();
  });

  $: {
    if ($selectedNode) {
      getList();
    }
  }
</script>

<section class="right-playback flex-1 flex w-full h-screen justify-between">
  <div class="h-full w-full">
    {#if $convertedVideos.length === 0 && addMode === 1}
      <div
        class="bg-[#333] text-white grid place-items-center w-full h-[calc(100vh-75px)]"
      >
        <p>No recordings selected</p>
      </div>
    {:else if addMode === 1 && $convertedVideos.length > 0}
      <div
        class={`bg-[#333] h-[calc(100vh-75px)] grid place-items-center gap-1 w-full  ${$convertedVideos.length === 1 ? "grid-cols-1 grid-rows-1" : $convertedVideos.length === 2 ? "grid-cols-2 grid-rows-1" : "grid-rows-2 grid-cols-2"}`}
      >
        {#each $convertedVideos as video, index}
          <div class="grid place-items-center h-full w-full relative">
            <PlaybackStream videoElement={videos[index]} />
            <button
              class="absolute top-2 right-2 text-white cursor-pointer z-10"
              on:click={async () => {
                convertedVideos.update((videos) =>
                  videos.filter((_, i) => i !== index),
                );
                await fetch(
                  `http://${$page.url.hostname}:8085/api/endplayback?id=id=${currentNvr.ip.replace(/\./g, "_") + "_" + video.url.split("channels/")[1]}&name=${video.url.split("channels/")[1]}&url=url&subUrl=subUrl`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  },
                )
                  .then(async (res) => {
                    const data = await res.json();
                    console.log(data);
                  })
                  .catch((err) => console.log(err));
              }}
            >
              <X />
            </button>
          </div>
        {/each}
      </div>
    {:else if addMode === 2}
      {#if $convertedVideos.length === 0 && !$isLoading}
        <div
          class="bg-[#333] text-white grid place-items-center w-full h-[calc(100vh-75px)]"
        >
          <p>No recordings selected</p>
        </div>
      {:else if $isLoading}
        <div
          class="bg-[#333] h-[calc(100vh-75px)] grid place-items-center gap-1 w-full grid-cols-1 grid-rows-1"
        >
          <p class="text-center mt-4">Loading video...</p>
        </div>
      {:else}
        <!-- <div class="grid place-items-center h-full w-full relative"> -->
        <div
          class={`bg-[#333] h-[calc(100vh-75px)] grid place-items-center relative  gap-1 w-full grid-cols-1 grid-rows-1`}
        >
          <AWSPlayer videoUrls={$convertedVideos} />
          <button
            on:click={() => {
              convertedVideos.set([]);
              document.getElementById("awsvid")?.remove();
            }}
            class="absolute top-2 right-2 text-white cursor-pointer z-10"
          >
            <X />
          </button>
        </div>
      {/if}
    {/if}
  </div>
  <div
    class={`h-[calc(100vh-75px)] ${showRightPanel ? "w-1/4 max-w-72 " : "w-0"} flex-shrink-0 transition-width ease-in-out duration-500 dark:border-[#292929] border-x-[1px] relative`}
  >
    <button
      on:click={() => (showRightPanel = !showRightPanel)}
      class={`absolute -left-6 py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800  top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[99999]`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700`}
      />
    </button>
    <div
      class={`${showRightPanel ? "opacity-100" : "opacity-0"} transtion-opacity ease-in-out duration-500 `}
    >
      <NodeSelection
        {data}
        {nodes}
        url={data.url ?? "/"}
        isAllFullScreen={playbackFullscreen}
        {user}
      />
      <!-- <div class='flex gap-2 items-center border rounded-md px-2 py-1 justify-center dark:bg-transparent dark:border-none bg-[#DADFEA] mx-4 my-1'>
        <Button class={`hover:bg-[#050F41] hover:text-white ${addMode===1 ? 'text-white bg-[#050F41] font-medium w-full': 'font-medium w-full bg-transparent text-[#00000066] dark:text-white/[.6]'} `} on:click={()=>addMode=1}>NVR</Button>
        <Button class={`hover:bg-[#050F41] hover:text-white ${addMode===2 ? 'text-white bg-[#050F41] font-medium w-full': 'font-medium w-full bg-transparent text-[#00000066] dark:text-white/[.6]'} `} on:click={()=>addMode=2}>Cloud</Button>
      </div> -->
      <span
        class="flex items-center bg-[#DADFEA] dark:bg-transparent dark:border-white/[.3] p-0.5 justify-center rounded-lg border-black/[.13] border-solid border-[1px] w-[94%] h-[40px] mx-auto my-2"
      >
        <button
          disabled
          on:click={() => (addMode = 1)}
          class={`rounded-lg text-xs leading-[18px] disabled:cursor-not-allowed px-[10px] py-[3px] font-medium w-full h-full ${addMode === 1 ? "text-white bg-[#050F41] " : "bg-[#DADFEA] dark:bg-transparent"}`}
          >NVR</button
        >
        <button
          on:click={() => (addMode = 2)}
          class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] disabled:cursor-not-allowed font-medium w-full h-full ${addMode === 2 ? "text-white bg-[#050F41]" : "bg-[#DADFEA] dark:bg-transparent"}`}
          >Cloud</button
        >
      </span>
      <!-- <Select.Root on:change={getList}>
        <Select.Trigger class="w-full border-none focus:ring-0 mt-2 px-4">
          <Select.Value placeholder="Select NVR" />
        </Select.Trigger>
        <Select.Content>
          {#each $nvrList as item}
          <Select.Item value={item} on:click={() => {currentNvr = item; getList(item)}}
            >{item.name}</Select.Item
          >
        {/each}
        </Select.Content>
      </Select.Root> -->
      {#if addMode == 1}
        <div class="px-4 py-4 flex flex-col gap-1">
          <label for="camera" class="text-black/[.7] dark:text-slate-200"
            >Select NVR</label
          >
          <div class="relative w-full">
            <select
              on:change={getList}
              class={`block text-[#323232] dark:text-white/[.7] capitalize font-medium rounded-md appearance-none w-full bg-[#F6F6F6] dark:bg-black border-2 py-2 text-sm px-2 leading-tight `}
            >
              <option value="" disabled selected>Select from list</option>

              {#each $nvrList as item}
                <option
                  value={item}
                  on:click={() => {
                    currentNvr = item;
                    getList(item);
                  }}>{item?.name}</option
                >
              {/each}
            </select>
            <ChevronDown
              size={22}
              class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none cursor-pointer outline-none"
            />
          </div>
        </div>{/if}
      <PlaybackList
        {nodes}
        {cameraList}
        {uniqueUrlList}
        {currentNvr}
        {features}
        {addMode}
        {isLoading}
      />
    </div>
  </div>
  <!-- <div
    class="flex flex-col gap-6 items-center justify-center px-2 bg-gradient-to-b from-[#000610] via-[#000307] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"
  >
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        disabled
        on:click={() => {
          addUserLog(`user clicked on Search button, top panel`);
        }}
        class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white bg-transparent text-white group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
        ><Search class="h-[22px] w-[22px]" /></button
      >
      <p
        class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white pointer-events-none"
      >
        Search
      </p>
    </span>
    <span
      class="group flex flex-col gap-0.5 items-center justify-center relative"
    >
      <button
        disabled
        on:click={() => (showFilters = !showFilters)}
        class={!showFilters
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><Filter class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white pointer-events-none"
      >
        Filter
      </p>
      {#if showFilters}
        <div
          id="dropdownDefaultCheckbox"
          class="z-20 flex w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-md dark:bg-[#242424] dark:divide-gray-600 absolute right-14"
        >
          <ul
            class="p-3 space-y-3 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownCheckboxButton"
          >
            <li>
              <label
                for="checkbox-item-1"
                class=" text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-1"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Object Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-2"
                class="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-2"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Fire Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-3"
                class=" text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center"
              >
                <input
                  id="checkbox-item-3"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                24 hour feed
              </label>
            </li>
            <li>
              <label
                class=" flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-4"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                Action Detection
              </label>
            </li>
            <li>
              <label
                for="checkbox-item-5"
                class="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                <input
                  id="checkbox-item-5"
                  type="checkbox"
                  class="w-4 h-4 mr-2"
                />
                All
              </label>
            </li>
          </ul>
        </div>
      {/if}
    </span>
    <span class="group flex flex-col gap-0.5 items-center justify-center">
      <button
        disabled
        class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white bg-transparent text-white group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
        ><Expand class="h-[22px] w-[22px]" />
      </button>
      <p
        class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white pointer-events-none"
      >
        Fullscreen
      </p>
    </span>
  </div> -->
</section>

<style>
  .grid-rows-1 {
    grid-template-rows: repeat(1, 100%);
  }
  .grid-rows-2 {
    grid-template-rows: repeat(2, 50%);
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, 99.9%);
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, 49.6%);
  }
</style>
