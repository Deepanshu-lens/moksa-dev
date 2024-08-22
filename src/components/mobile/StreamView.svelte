<script lang="ts">
  import { events, selectedNode } from "@/lib/stores";
  import {
    Check,
    ChevronDown,
    EditIcon,
    Expand,
    ListFilter,
    Shrink,
    Trash2Icon,
    X,
  } from "lucide-svelte";
  import * as Carousel from "@/components/ui/carousel/index.js";

  import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
  import Stream from "../stream/Stream.svelte";
  import ComfortableProfileCard from "../cards/ComfortableProfileCard.svelte";
  import CarDetailsDialog from "../dialogs/CarDetailsDialog.svelte";
  import InfoDialog from "../dialogs/mobile/InfoDialog.svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { page } from "$app/stores";

  let showInfoModal = false;
  let allFullScreen = false;
  let cameraCount = $selectedNode.camera.length;
  let newName: string = "";
  let edit;
  let comfort = true;
  let videos: { [key: string]: HTMLElement } = {};

  // const location = window?.location?.href;
  // const neededUrl =
  //   location?.split("/")[2] === "localhost:5173"
  //     ? PUBLIC_BASE_URL
  //     : location?.split("/")[2]?.split(":")[0];

  const neededUrl = $page.url.hostname;

  const initVideo = (camera: Camera) => {
    if (videos[camera.id]) {
      return;
    }
    let video = document.createElement("video-stream") as VideoStreamType;
    video.id = `stream-${camera.id}`;
    // video.mode = "webrtc";
    // video.mode = $page.url.hostname.includes("116") ? "mse" : "webrtc";
    video.mode = "mse";
    video.url = camera.url;
    video.src = new URL(
      `ws://${neededUrl}:8082/api/ws?src=${camera.id}&nodeID=${1}`,
    );
    video.style.position = "relative";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.zIndex = "10";
    video.background = true;
    video.visibilityCheck = false;
    videos[camera.id] = video;
  };

  const updateLayout = () => {
    $selectedNode.camera.map((c, i) => {
      if (!videos[c.id]) {
        console.log("initializing video ", c);
        initVideo(c);
      } else {
        if (videos[c.id].url !== c.url) {
          videos[c.id].url = c.url;
          videos[c.id].src = new URL(
            `ws://${neededUrl}:8082/api/ws?src=${c.id}&nodeID=${1}`,
          );
        }
      }
    });
  };

  $: updateLayout();

  onMount(() => {
    if ($selectedNode.mobileLayout === 0) {
      selectedNode.set({
        ...$selectedNode,
        mobileLayout: 1,
      });
    }
  });

  export let galleryItems: any;
  export let landscape: boolean;
  export let liveFullscreen: boolean;
  export let activeStreamIndex: number | null;
  export let editMode: boolean;
  export let showAlerts: boolean;
  export let data;
</script>

<div
  class={landscape
    ? "grid place-items-center h-[calc(100vh-98px)] w-full bg-black relative"
    : "flex flex-col items-start justify-center"}
>
  {#if !landscape}
    <div class="top flex items-center justify-center px-4 w-full">
      <InfoDialog {data}>
        <button
          class="flex items-center justify-center text-center gap-1 relative"
          on:click={() => (showInfoModal = !showInfoModal)}
        >
          <p class="text-[#505050] font-semibold text-sm">
            {`Node: ${$selectedNode?.name}`}
          </p>
          <ChevronDown class="scale-90" />
        </button>
      </InfoDialog>
    </div>
  {/if}

  {#if cameraCount !== 0}
    <div
      class={allFullScreen
        ? "z-[500] max-h-screen h-screen w-full fixed top-0 left-0 bg-[#f5f6f7]"
        : !allFullScreen && landscape
          ? "rotate-90 h-[100vw] w-[calc(100vh-200px)] absolute top-[6rem]"
          : "h-full w-full"}
    >
      {#if allFullScreen}
        <span
          class="flex items-center justify-between text-black py-3 px-4 backdrop-blur-xl rounded-md bg-white/[.12] my-2 cursor-pointer w-full"
        >
          <span class="text-base">
            Node:{" "}
            <span class="font-semibold">{$selectedNode.name}</span>
          </span>
          <button
            class="flex items-center gap-2"
            on:click={() => {
              liveFullscreen = false;
            }}
            ><Shrink />
            Minimise
          </button>
        </span>
      {/if}

      {#if landscape}
        <Carousel.Root
          class="w-full h-full flex justify-center items-center"
          opts={{ watchDrag: false }}
        >
          <Carousel.Content class="w-full h-full mx-0 px-0">
            <!-- {#each Array.from( { length: cameraCount && cameraCount > 1 ? Math.ceil(cameraCount / $selectedNode.mobileLayout !== 1 ? cameraCount : 1) : 1 }, ) as _, slideIndex} -->
            {#each Array.from( { length: cameraCount > 0 ? ($selectedNode.mobileLayout === 1 ? cameraCount : Math.ceil(cameraCount / 2)) : 1 }, ) as _, slideIndex}
              <Carousel.Item
                class="h-full w-full px-0 mx-0"
                id="carousel-slide-landscape"
              >
                <div
                  class="flex items-center w-[calc(100vh-98px)] ml-10 h-[100vw] grid-cols-{$selectedNode.mobileLayout}"
                  id={`slide-${slideIndex}`}
                >
                  {#if cameraCount > 0}
                    {#each Array.from( { length: $selectedNode.mobileLayout }, ) as _, index}
                      {@const cameraIdx =
                        slideIndex * $selectedNode.mobileLayout + index}
                      {#if cameraIdx < cameraCount}
                        <div
                          id={`stream-${$selectedNode.name}-${cameraIdx}`}
                          class={$selectedNode.mobileLayout === 1
                            ? "relative z-10 h-[100%] w-[80%] "
                            : "relative z-10 h-[100%] w-[42%]"}
                        >
                          <Stream
                            videoElement={videos[
                              $selectedNode.camera[cameraIdx].id
                            ]}
                            camera={$selectedNode.camera[cameraIdx]}
                          />
                          <span
                            class="flex gap-2 bg-[rgba(0,0,0,.5)] py-1 px-3 absolute top-2 left-1/2 -translate-x-1/2 items-center rounded-xl scale-[.80] z-20 text-white"
                          >
                            <!-- <Disc2 /> -->
                            <span
                              class={`h-2 w-2 ${$selectedNode.camera[cameraIdx].save ? "bg-[#C12828]" : "bg-[#589e67]"}' rounded-full`}
                            />
                            <span class="text-xs font-extrabold"
                              >{$selectedNode.camera[cameraIdx].name} Rec
                            </span>
                          </span>
                          <button
                            on:click={() => {
                              let cell = document.getElementById(
                                `stream-${$selectedNode.name}-${cameraIdx}`,
                              );
                              cell?.requestFullscreen();
                            }}
                            class=" rounded-lg p-1 grid place-items-center absolute left-2 top-2 text-white z-20 bg-[rgba(0,0,0,.5)]"
                          >
                            <Expand size={18} />
                          </button>
                        </div>
                      {/if}
                    {/each}
                  {/if}
                </div>
              </Carousel.Item>
            {/each}
          </Carousel.Content>
          <Carousel.Previous
            class="left-12 text-bold text-[#015a62] dark:text-white"
          />
          <Carousel.Next
            class="right-4 text-bold text-[#015a62] dark:text-white"
          />
        </Carousel.Root>
      {:else}
        <div
          class={allFullScreen && editMode
            ? "mid overflow-y-scroll w-full max-h-screen flex px-4 flex-wrap gap-4 my-4 pb-6 scroll z-20"
            : !allFullScreen && editMode
              ? "mid overflow-y-scroll w-full max-h-[calc(100vh-260px)] flex px-4 flex-wrap gap-4 my-4 pb-20 scroll z-20"
              : !allFullScreen && !editMode
                ? `mid overflow-y-scroll w-full max-h-[calc(100vh-260px)] px-4 my-4 pb-20 z-20 grid grid-cols-${$selectedNode.mobileLayout} gap-1 mx-auto scroll`
                : `mid overflow-y-scroll w-full max-h-screen px-4 my-4 pb-6 z-20 grid grid-cols-${$selectedNode.mobileLayout} gap-1 mx-auto scroll`}
        >
          {#if cameraCount > 0}
            {#each $selectedNode.camera as item, index}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              {#if editMode}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  on:click={() => {
                    if (activeStreamIndex !== index) activeStreamIndex = index;
                    else if (activeStreamIndex === index)
                      activeStreamIndex = "";
                  }}
                  id={`stream-${selectedNode.nodeName}-${index}`}
                  class={activeStreamIndex === index &&
                  $selectedNode.mobileLayout === 2
                    ? "relative bg-white shadow-smol flex flex-col max-w-[47.5%] border-2 border-solid border-[#2952e1] z-10"
                    : activeStreamIndex !== index &&
                        $selectedNode.mobileLayout === 2
                      ? "relative bg-white shadow-smol flex flex-col max-w-[47.5%] z-10"
                      : activeStreamIndex === index &&
                          $selectedNode.mobileLayout === 1
                        ? "relative bg-white shadow-smol flex flex-col w-[98%] h-auto max-h-[230px] mx-auto  border-2 border-solid border-[#2952e1] z-10"
                        : "relative bg-white shadow-smol flex flex-col w-[98%] h-auto max-h-[230px] mx-auto z-10"}
                >
                  <Stream videoElement={videos[item.id]} camera={item} />

                  <span
                    class="flex gap-2 text-white bg-[rgba(0,0,0,.5)] py-1 px-3 absolute top-1 -left-2 items-center rounded-xl scale-75 z-30"
                  >
                    <!-- <Disc2 /> -->
                    <span
                      class={`h-2 w-2 ${item.save ? "bg-[#C12828]" : "bg-[#589e67]"}' rounded-full`}
                    />
                    <span class="text-xs font-extrabold">
                      {item?.name} - Rec
                    </span>
                  </span>

                  <div
                    class={`absolute h-full w-full top-0 left-0 bg-black/[.27] backdrop-blur-sm z-40 flex flex-col items-center justify-center ${
                      $selectedNode.mobileLayout === 1 ? "gap-6" : "gap-3"
                    }`}
                  >
                    <span
                      class={$selectedNode.mobileLayout === 1
                        ? "scale-125"
                        : "scale-100"}
                    >
                      {#if edit === index}
                        <input
                          type="text"
                          id={`newName-${index}`}
                          placeholder={item?.name}
                          class={`text-white placeholder-slate-200 placeholder-opacity-70 px-2 ${
                            $selectedNode.mobileLayout === 1
                              ? "scale-125 max-w-[150px] text-sm"
                              : "scale-90 max-w-[100px] text-xs"
                          } bg-transparent border-[1px] border-solid border-white`}
                          on:change={(e) => (newName = e.target.value)}
                          on:click={(e) => e.stopPropagation()}
                        />
                      {:else}
                        <p class="text-white font-semibold text-xs text-center">
                          {item?.name}
                        </p>
                      {/if}
                    </span>

                    <span
                      class={` ${
                        $selectedNode.mobileLayout === 1 ? "h-1" : "h-[2px]"
                      } w-[90%] bg-white/[.26]`}
                    />
                    <span
                      class={`flex items-center gap-6 ${
                        $selectedNode.mobileLayout === 1
                          ? "scale-125"
                          : "scale-100"
                      }`}
                    >
                      {#if edit !== index}
                        <button
                          class="flex flex-col gap-1 items-center text-white"
                          on:click={(e) => {
                            e.stopPropagation();
                            edit = index;
                          }}
                        >
                          <span
                            class="h-[26px] w-[26px] rounded-full bg-white/[.3] grid place-items-center"
                          >
                            <EditIcon class="scale-75" />
                          </span>
                          <p class="text-white text-[8px]">Rename</p>
                        </button>
                      {:else}
                        <button
                          class="flex flex-col gap-1 items-center text-white"
                          on:click={(e) => {
                            e.stopPropagation();
                            const oldname = item?.name;
                            if (newName) {
                              fetch("/api/camera/editCamera", {
                                method: "put",
                                headers: {
                                  "Content-type": "application/json",
                                },
                                body: JSON.stringify({
                                  cameraId: item.id,
                                  nodeId: $selectedNode.id,
                                  name: newName,
                                  url: item.url,
                                }),
                              }).then(() => {
                                edit = null;
                                toast(`Camera name updated to ${newName}`);
                                newName = "";
                              });
                            }
                          }}
                        >
                          <Check />
                          <p class="text-white text-[8px]">Save</p>
                        </button>
                      {/if}

                      {#if edit !== index}
                        <span
                          class="flex flex-col items-center gap-1 text-white"
                        >
                          <button
                            class="h-[26px] w-[26px] p-[5px] rounded-full bg-white/[.3] flex justify-center items-center"
                            on:click={() => {
                              fetch("/api/camera/deleteCamera", {
                                method: "delete",
                                headers: {
                                  "Content-type": "application/json",
                                },
                                body: JSON.stringify({
                                  cameraId: item.id,
                                  nodeId: $selectedNode.id,
                                  name: item.name,
                                  url: item.url,
                                }),
                              })
                                .then(() => {
                                  document
                                    .getElementById(`stream-${item.id}`)
                                    ?.remove();
                                  toast("camera deleted");
                                })
                                .catch((err) => console.log(err));
                            }}
                          >
                            <Trash2Icon />
                          </button>
                          <p class="text-white text-[8px]">Delete</p>
                        </span>
                      {:else}
                        <span
                          class="flex flex-col gap-1 items-center text-white"
                          on:click={(e) => {
                            e.stopPropagation();
                            edit = null;
                          }}
                        >
                          <X class="text-white" />
                          <p class="text-white text-[8px]">Discard</p>
                        </span>
                      {/if}
                    </span>
                  </div>
                </div>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
              {:else}
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  id={`stream-${$selectedNode.name}-${index}`}
                  on:click={() => {
                    if (activeStreamIndex !== index) {
                      activeStreamIndex = index;
                    } else if (activeStreamIndex === index) {
                      activeStreamIndex = null;
                    }
                  }}
                  class={activeStreamIndex === index &&
                  $selectedNode.mobileLayout === 2
                    ? "relative border-2 border-solid border-[#2952e1] max-h-[110px]"
                    : activeStreamIndex !== index &&
                        $selectedNode.mobileLayout === 2
                      ? "relative border-[1px] border-solid border-transparent max-h-[110px]"
                      : activeStreamIndex === index &&
                          $selectedNode.mobileLayout === 1
                        ? "relative border-2 border-solid border-[#2952e1] max-h-[230px]"
                        : "relative border-2 border-solid border-transparent max-h-[230px]"}
                >
                  <!-- {$selectedNode.camera[index].id} -->
                  <!-- {JSON.stringify($selectedNode.camera[index])} -->
                  <Stream
                    videoElement={videos[$selectedNode.camera[index].id]}
                    camera={$selectedNode.camera[index]}
                  />
                  <span
                    class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white py-1 px-3 absolute top-2 left-0 items-center rounded-xl scale-75 z-10"
                  >
                    <span
                      class={`h-2 w-2 ${item.save ? "bg-[#C12828]" : "bg-[#589e67]"}' rounded-full`}
                    />

                    <span class="text-xs font-extrabold">
                      {item?.name} - Rec
                    </span>
                  </span>
                </div>
              {/if}
            {/each}
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 mix-blend-multiply flex flex-col justify-center items-center z-40"
    >
      <img
        src="/images/plusLight.png"
        alt={"darkvector"}
        class="img-h-w mix-blend-multiply aspect-square h-[150px] w-[150px]"
      />
      <h2 class="text-[#333] font-semibold text-xl text-center -mt-8">
        Add Camera
      </h2>
      <p class="text-[#333] text-base font-medium text-center w-[250px]">
        Click here to add your first camera to Node {$selectedNode.name}
      </p>
    </div>
  {/if}

  <Drawer bind:open={showAlerts}>
    <DrawerTrigger class="hidden" id="trigger">Open</DrawerTrigger>
    <DrawerContent>
      <div class={landscape ? "rotate-90" : "mx-auto w-[95%] max-w-sm"}>
        <div
          class={`flex items-center justify-center relative border-b border-solid border-[rgb(145,158,171)]/[.46] mt-2 ${
            landscape ? "pt-12 gap-8" : "gap-4"
          }`}
        >
          <button
            class={`px-4 py-2 text-lg shrink-0 ${
              comfort
                ? " text-black font-medium dark:text-white"
                : "text-black/[.4] font-medium dark:text-white/[.6]"
            }`}
            on:click={() => (comfort = true)}
          >
            Comfort
          </button>
          <button
            class={`px-4 py-2 text-lg shrink-0  ${
              !comfort
                ? " text-black font-medium dark:text-white"
                : "text-black/[.4] font-medium dark:text-white/[.6]"
            }`}
            on:click={() => (comfort = false)}
          >
            Informative
          </button>
        </div>
        {#if comfort}
          <div
            class=" my-4 flex flex-col items-center justify-start gap-2 overflow-y-scroll whitespace-nowrap overflow-x-clip h-[350px] mx-auto pb-4 text-black text-sm dark:text-white"
          >
            {#if $events?.length > 0}
              <div class="m-4 flex flex-col sm:gap-2 w-[80%] gap-8 pb-10">
                {#each galleryItems as galleryItem}
                  <ComfortableProfileCard
                    isAllFullScreen={false}
                    {galleryItem}
                  />
                {/each}
              </div>
            {:else}
              No event records found.
            {/if}
          </div>
        {:else}
          <div
            class=" my-4 flex flex-col items-center justify-start gap-2 overflow-y-scroll whitespace-nowrap overflow-x-clip h-[350px] mx-auto pb-4 text-black text-sm dark:text-white"
          >
            {#if $events.length > 0}
              {#each $events as event}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <article
                  class={`relative items-center gap-4 mx-4 p-2 bg-background w-full fade-in-15 transition-all duration-200
                   flex rounded-xl shadow-md text-base border}
               `}
                >
                  <img
                    class="object-cover w-24 h-24 rounded-md"
                    src={"data:image/jpeg;base64," + event.frameImage}
                    alt="Team Member"
                  />
                  {#if event.title.includes("car") && event.description !== ""}
                    <CarDetailsDialog
                      plateImage={event.videoUrl}
                      plateNumber={event.description}
                      carColor={event.title.replace(" car", "")}
                      fullImage={event.frameImage}
                      ><img
                        class="object-cover w-64 h-16 rounded-md col-span-1"
                        src={"data:image/jpeg;base64," + event.videoUrl}
                        alt="Team Member"
                      />
                    </CarDetailsDialog>
                  {/if}
                  <div class="flex flex-col items-start w-full">
                    <h3 class={"font-semibold text-base"}>
                      {#if event.title.includes("car") && event.description !== ""}
                        {event.description} {event.title}
                      {:else}
                        {event.title}
                      {/if}
                    </h3>
                    <p class={"text-sm text-black/.7"}>
                      Camera {$selectedNode.camera.filter(
                        (c) => c.id === event.camera,
                      )[0] &&
                        $selectedNode.camera.filter(
                          (c) => c.id === event.camera,
                        )[0].name}
                    </p>
                    <span
                      class="flex items-center justify-between border-b border-solid border-[#1c1c1c]/.1 gap-2 w-full"
                    >
                      <p class="text-sm text-[#D28E3D] font-medium">
                        {event.matchScore !== 0 &&
                        event.matchScore !== undefined &&
                        event.matchScore !== null
                          ? `Match Score : ${event?.matchScore.toFixed(3)}`
                          : "No matches found"}
                      </p>
                      <p class="text-xs font-semibold">
                        {event?.score.toFixed(3)}
                      </p>
                    </span>
                    <span
                      class="flex items-center justify-between gap-2 w-full"
                    >
                      <p class="text-xs">
                        {event.created.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p class="text-xs">
                        {event.created.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </span>
                  </div>
                </article>
              {/each}
            {:else}
              No event records found.
            {/if}
          </div>
        {/if}

        <button
          class={`absolute shadow-big flex flex-col items-center justify-center text-[#015a62] rounded-full p-2 h-[60px] w-[60px] bg-white shadow-filter flex-shrink-0  ${
            landscape ? "bottom-16 right-4" : "bottom-8 right-4"
          }`}
        >
          <ListFilter class="flex-shrink-0 scale-90 text-[#015a62]" />
          <span class="text-sm scale-95">Filter</span>
        </button>
        <!-- <RegisterMobileDialog>
          <button
            class={`absolute informative-shadow flex flex-col items-center justify-center text-[#015a62] rounded-full p-2 h-[60px] w-[60px] bg-white shadow-filter flex-shrink-0  ${
              landscape ? "bottom-16 right-4" : "bottom-[7rem] right-4"
            }`}
          >
            <ScanFace class="flex-shrink-0 scale-90 text-[#015a62]" />
            <span class="text-sm scale-95">Register</span>
          </button>
        </RegisterMobileDialog> -->
      </div>
    </DrawerContent>
  </Drawer>
</div>
