<script lang="ts">
  // Imports
  import * as Tabs from "@/components/ui/tabs";
  import { Play, Pause, ChevronRight, CalendarDaysIcon } from "lucide-svelte";
  import { selectedNode } from "@/lib/stores";
  import PocketBase from "pocketbase";
  import { writable } from "svelte/store";
  import Hls from "hls.js";
  import { toast } from "svelte-sonner";
  import { Calendar } from "@/components/ui/calendar";
  import Button from "@/components/ui/button/button.svelte";
  import { cn } from "@/lib/utils";
  import NodeSelection from "@/components/node/NodeSelection.svelte";
  import { onMount } from "svelte";
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
  const pb = new PocketBase(`https://server.moksa.ai`);
  // Variables
  let availableChannels = writable<{ id: string; label: string }[]>([]);
  let events: any[] = [];
  const currentTimeInterval = writable(0);
  let showRightPanel: boolean = true;
  const videos = writable([]);
  let videoRefs: HTMLVideoElement[] = [];
  let videoBackgroundWidths = writable<number[]>([]);
  let showCalendar = writable<boolean>(false);
  let value: any = null;
  let searchDate = "";
  let eventDate = "";
  let selectedChannels = writable<{ id: string; label: string }[]>([]);
  let videoUrls: any = { responses: [], cams: [] };
  let isLoading = writable<boolean>(false);
  let startTime: string = "";
  let endTime: string = "";
  let videoPlayStates = writable<boolean[]>([]);
  let startTimeRange: number = 12;
  let isFetching = writable<boolean>(false);
  export let data;

  //Constants
  const PLAYBACK_API_URL = `${PUBLIC_POCKETBASE_URL}/playbackserver/generate-stream`;

  // Functions
  function updateVideoBackgroundWidth(index: number) {
    const video = videoRefs[index];
    if (video && video.duration) {
      const totalSecondsInDay = 24 * 60 * 60;
      const width = (video.duration / totalSecondsInDay) * 100;
      videoBackgroundWidths.update((widths) => {
        widths[index] = width;
        return widths;
      });
    }
  }

  function handlePlayed(e: any) {
    // Remove console.log only
  }

  function handleEnded(e: any) {
    // Remove console.log only
  }

  function syncPlayState(index: number, isPlaying: boolean) {
    videoPlayStates.update((states) => {
      const newState = [...states];
      newState[index] = isPlaying;
      return newState;
    });
  }

  const getCameras = async (nodeId: string) => {
    try {
      console.log("Node:", nodeId);
      pb.autoCancellation(false);
      const localCameras = await pb.collection("camera").getFullList({
        fields: "id,name",
        filter: `node.id ?= "${nodeId}" && save = true`,
        sort: "-created",
      });
      return localCameras;
    } catch (error) {
      console.error("Error initializing Camera Manager:", error);
    }
  };

  const videoPlayer = () => {
    videoPlayStates.set(new Array(videoUrls.responses.length).fill(true));

    videoRefs.forEach((video, index) => {
      const videoElement = videoRefs[index];
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrls.responses[index]);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          // Simulate minor interaction to initialize the video to tackle the bug
          // where the video is not responding to pause button initially
          videoElement.currentTime = 0.01;
          videoElement.currentTime = 0;

          videoElement
            .play()
            .then(() => {
              syncPlayState(index, true);
            })
            .catch((error) => {
              console.warn("Auto-play failed:", error);
              syncPlayState(index, false);
            });
        });
      } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
        videoElement.src = videoUrls.responses[index];
        videoElement.addEventListener("loadedmetadata", () => {
          videoElement.currentTime = 0.01;
          videoElement.currentTime = 0;

          videoElement
            .play()
            .then(() => {
              syncPlayState(index, true);
            })
            .catch((error) => {
              console.warn("Auto-play failed:", error);
              syncPlayState(index, false);
            });
        });
      }
      videoElement.addEventListener("play", () => syncPlayState(index, true));
      videoElement.addEventListener("pause", () => syncPlayState(index, false));

      video.addEventListener("loadedmetadata", () => {
        updateVideoBackgroundWidth(index);
      });

      if (startTime !== "")
        video.addEventListener("loadedmetadata", () => {
          seekAllVideos(startTimeRange);
        });
    });
  };

  function playVideo(index: number) {
    videoRefs[index].play();
  }

  function pauseVideo(index: number) {
    videoRefs[index].pause();
  }

  function seekAllVideos(intervalIndex: number) {
    currentTimeInterval.set(intervalIndex);
    const timeInSeconds = intervalIndex * 10 * 60;

    videoRefs.forEach((video, index) => {
      if (video.duration) {
        const newTime = Math.min(timeInSeconds, video.duration);
        video.currentTime = newTime;

        if (newTime < video.duration) {
          playVideo(index);
        } else {
          pauseVideo(index);
        }

        const seekBar = window.document.querySelectorAll(
          '.video-controls input[type="range"]',
        )[index] as HTMLInputElement;
        if (seekBar) {
          seekBar.value = intervalIndex.toString();
          seekBar.classList.toggle(
            "beyond-duration",
            newTime >= video.duration,
          );
        }
      }
    });
    const globalSeekBar = window.document.querySelector(
      '.global-controls input[type="range"]',
    ) as HTMLInputElement;
    if (globalSeekBar && startTime !== "") {
      globalSeekBar.value = intervalIndex.toString();
      globalSeekBar.classList.toggle("beyond-duration", timeInSeconds >= 1440);
    }
  }

  function seekVideo(index: number, intervalIndex: number) {
    currentTimeInterval.set(intervalIndex);
    const timeInSeconds = intervalIndex * 10 * 60;
    const video = videoRefs[index];

    if (video.duration) {
      const newTime = Math.min(timeInSeconds, video.duration);
      video.currentTime = newTime;

      if (newTime < video.duration) {
        playVideo(index);
      } else {
        pauseVideo(index);
      }

      const seekBar = window.document.querySelectorAll(
        '.video-controls input[type="range"]',
      )[index] as HTMLInputElement;
      if (seekBar) {
        seekBar.value = intervalIndex.toString();
        seekBar.classList.toggle("beyond-duration", newTime >= video.duration);
      }
    }
  }

  async function fetchPlaybackData() {
    if ($selectedChannels.length === 0 || !searchDate) {
      toast.error("No data to fetch");
      return;
    }

    isFetching.set(true);

    const dateParts = searchDate.split(" ");
    const day = dateParts[0].padStart(2, "0");
    const month =
      new Date(Date.parse(dateParts[1] + " 1, 2020")).getMonth() + 1;
    const year = dateParts[2];
    const formattedDate = `${year}_${month.toString().padStart(2, "0")}_${day}`;

    try {
      events = [];
      videoUrls = { responses: [], cams: [] };
      const responses = await Promise.all(
        $selectedChannels.map(async (channel) => {
          const response = await fetch(PLAYBACK_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cameraID: channel.id,
              cameraDate: formattedDate,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            toast.error(
              `${errorData.error} for ${channel.name}` ||
                "Unknown error occurred",
            );
          }
          pb.autoCancellation(false);
          const localEvents = await pb
            .collection("atlas_events")
            .getFullList<any>({
              filter: `camera="${channel.id}"`,
              sort: "-created",
              expand: "user",
            });
          const filteredEvents = localEvents.filter((event: any) => {
            const eventUnixTime = new Date(event.created).getTime();
            const startOfDay = new Date(eventDate).getTime();
            const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
            return eventUnixTime >= startOfDay && eventUnixTime < endOfDay;
          });

          const existingCameraIndex = events.findIndex(
            (event) => event.camera === channel.id,
          );
          if (existingCameraIndex !== -1) {
            events[existingCameraIndex].events = filteredEvents;
            events = [...events];
          } else {
            events = [
              ...events,
              { events: filteredEvents, camera: channel.id },
            ];
          }

          const data = await response.json();
          return data.path;
        }),
      );
      videoUrls = { responses, cams: $selectedChannels };
      videoPlayStates.set(new Array(responses.length).fill(true));
    } catch (error) {
      console.error("Error fetching playback data:", error);
    } finally {
      isFetching.set(false);
      selectedChannels.set([]);
      value = null;
      searchDate = "";
    }
  }

  function toggleCalendar() {
    showCalendar.update((currentValue) => !currentValue);
  }

  function toggleChannelSelection(channel: { id: string; label: string }) {
    selectedChannels.update((channels) => {
      if (channels.includes(channel)) {
        return channels.filter((ch) => ch !== channel);
      } else {
        return [...channels, channel];
      }
    });
  }

  onMount(() => {
    if (data?.nodes?.length > 0) {
      selectedNode.set(data?.nodes[0]);
    }
  });

  $: {
    if (videoRefs) {
      videoPlayer();
    }
  }

  $: if (value) {
    const date = new Date(value.year, value.month - 1, value.day);

    searchDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  $: if (value) {
    const date = new Date(value.year, value.month - 1, value.day, 12, 0, 0);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    eventDate = `${year}-${month}-${day}`;
  }

  $: if (searchDate) {
    showCalendar.update((currentValue) => !currentValue);
  }

  $: if (startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    startTimeRange = Math.floor((hours * 60 + minutes) / 10);
  }

  function validateEndTime() {
    if (endTime <= startTime) {
      endTime = "";
      toast.error("End time must be after start time");
    }
  }

  function togglePlayPause(index: number) {
    const video = videoRefs[index];
    if (video) {
      if (video.paused) {
        video
          .play()
          .then(() => syncPlayState(index, true))
          .catch(console.error);
      } else {
        video.pause();
        syncPlayState(index, false);
      }
    }
  }

  function toggleAllPlayPause() {
    const allPlaying = $videoPlayStates.every((state) => state);
    videoRefs.forEach((video, index) => {
      if (allPlaying) {
        pauseVideo(index);
      } else {
        playVideo(index);
      }
    });
  }

  // Function to calculate positions of red strips
  function calculateEventPositions(cameraId, eventsArray) {
    if (!eventsArray || !eventsArray.length) return [];

    // Find events for this specific camera
    const cameraEvents = eventsArray.find((item) => item.camera === cameraId);
    if (!cameraEvents || !cameraEvents.events) return [];

    return cameraEvents.events.map((event) => {
      const eventTime = new Date(event.created);
      const hours = eventTime.getUTCHours();
      const minutes = eventTime.getUTCMinutes();

      // Convert time to 10-minute interval index (0-143)
      const intervalIndex = hours * 6 + Math.floor(minutes / 10);
      return (intervalIndex / 144) * 100;
    });
  }

  let previousNode: string | null = null;
  $: if ($selectedNode && $selectedNode?.id !== previousNode) {
    isLoading.set(true);
    getCameras($selectedNode?.id).then((cameras) => {
      console.log("c", cameras);
      availableChannels.set(cameras);
      isLoading.set(false);
      previousNode = $selectedNode?.id;
    });
  }
</script>

<section class="right-playback flex-1 flex w-full h-screen justify-between">
  <!-- Video Player -->
  <div class="w-full h-full">
    <div
      class={cn(
        `grid gap-1 grid-cols-4 grid-rows-4 h-[62%] 2xl:h-[68%] w-full relative`,
        videoUrls.responses.length === 1
          ? "grid-cols-1 grid-rows-1"
          : videoUrls.responses.length === 2
            ? "grid-cols-2 grid-rows-1"
            : videoUrls.responses.length === 3
              ? "grid-cols-2 grid-rows-2"
              : videoUrls.responses.length === 4
                ? "grid-cols-2 grid-rows-2"
                : videoUrls.responses.length === 5
                  ? "grid-cols-3 grid-rows-2"
                  : videoUrls.responses.length === 6
                    ? "grid-cols-3 grid-rows-2"
                    : videoUrls.responses.length === 7
                      ? "grid-cols-4 grid-rows-2"
                      : "grid-cols-4 grid-rows-2",
      )}
    >
      {#if videoUrls.responses && videoUrls.responses.length > 0}
        {#each videoUrls.responses as video, index}
          <video
            bind:this={videoRefs[index]}
            class="w-full h-full"
            src={video}
            autoplay
            muted
            playsinline
            on:play={handlePlayed}
            on:ended={handleEnded}
          ></video>
        {/each}
      {:else}
        <div
          class="w-full h-full border flex items-center justify-center col-span-4 row-span-4"
        >
          <p class="font-semibold text-lg">No Playbacks Selected</p>
        </div>
      {/if}
    </div>
    {#if videoUrls.responses && videoUrls.responses.length > 0}
      <div class="flex flex-col col-span-2 px-5 gap-1">
        <!-- Global Controls -->
        <div
          class="global-controls flex items-center gap-3 bg-gray-800 w-full max-h-18"
        >
          <div class="flex justify-end w-[13.85%] pr-14">
            <button on:click={toggleAllPlayPause}>
              {#if $videoPlayStates.every((state) => state)}
                <Pause
                  size={18}
                  class="cursor-pointer border  border-brand rounded-full p-0.5"
                />
              {:else}
                <Play
                  size={18}
                  class="cursor-pointer border  border-brand rounded-full p-0.5"
                />
              {/if}
            </button>
          </div>
          <div class="w-[90%] 2xl:w-[90%] m-0 p-0">
            <div
              class="flex justify-between my-1 gap-0.5 2xl:text-xs text-[10px] font-thin max-w-full 2xl:min-w-full"
            >
              {#each Array(25) as _, hour}
                <span>{hour.toString().padStart(2, "0")}:00</span>
              {/each}
            </div>
            <div class="pr-6 2xl:pr-7">
              <input
                type="range"
                min="0"
                max="144"
                step="1"
                value="0"
                class="custom-slider h-4"
                on:input={(e) => seekAllVideos(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        </div>
        <!-- Individual Video Controls -->
        {#each videoUrls.cams as cam, index}
          <div class="video-controls flex items-center gap-2 2xl:gap-3">
            <div
              class="flex items-center gap-1 w-[14%] 2xl:w-[13.75%] bg-white/10 p-2 max-h-5"
            >
              <p
                class="text-xs 2xl:text-sm font-semibold mr-3 truncate min-w-[50px]"
              >
                {cam.name}
              </p>
              <button on:click={() => togglePlayPause(index)}>
                {#if $videoPlayStates[index]}
                  <Pause
                    size={14}
                    class="cursor-pointer bg-neutral-500 rounded-full p-0.5"
                  />
                {:else}
                  <Play
                    size={14}
                    class="cursor-pointer bg-neutral-500 rounded-full p-0.5"
                  />
                {/if}
              </button>
            </div>
            <div
              class="bg-white/10 w-[89%] 2xl:w-[90%] h-[95%] p-0 m-0 flex gap-1 pr-6 2xl:pr-7 relative"
              style="background: linear-gradient(to right, #3F6C1C, #3F6C1C), rgba(255, 255, 255, 0.1); background-size: {$videoBackgroundWidths[
                index
              ]}% 100%; background-repeat: no-repeat;"
            >
              {#each calculateEventPositions(cam.id, events) as position}
                <div
                  class="absolute top-0 h-full w-[2px] bg-red-500"
                  style="left: {position}%"
                />
              {/each}
              <input
                type="range"
                min="0"
                max="144"
                step="1"
                value="0"
                class="custom-slider"
                on:input={(e) => seekVideo(index, parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Right Panel -->
  <div
    class={`h-[calc(100vh-75px)] ${showRightPanel ? "w-1/4 max-w-72 " : "w-0"} transition-width ease-in-out duration-500 dark:border-[#292929] border-x-[1px] relative`}
  >
    <button
      on:click={() => (showRightPanel = !showRightPanel)}
      class={`absolute ${showRightPanel ? "-left-6" : "-left-6"} py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800  top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[99999]`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700 cursor-pointer`}
      />
    </button>
    <div
      class={`${showRightPanel ? "opacity-100" : "opacity-0"} transtion-opacity ease-in-out duration-500 `}
    >
      <NodeSelection
        {data}
        nodes={data?.nodes || []}
        url={data.url ?? "/"}
        isAllFullScreen={false}
        user={data?.user || {}}
      />
      <div class="px-4 py-4 flex flex-col gap-1">
        <Tabs.Root value="byDate">
          <Tabs.List class="w-full  border mb-4">
            <Tabs.Trigger value="byDate" class="w-1/2 rounded-md "
              >By Date</Tabs.Trigger
            >
            <Tabs.Trigger value="byTime" class="w-1/2 rounded-md "
              >By Time</Tabs.Trigger
            >
          </Tabs.List>
          <label for="camera" class="text-sm font-semibold"
            >Select Cameras</label
          >
          <!-- Cameras List limit upto 8 -->
          <div class="w-full px-2 py-1 max-h-[160px] overflow-y-auto">
            {#if $isLoading}
              <p class="text-sm text-gray-500">Loading...</p>
            {:else if $availableChannels.length === 0}
              <p class="text-sm text-gray-500">
                No cameras have recordings available.
              </p>
            {:else}
              {#each $availableChannels as channel}
                <div class="flex items-center mb-2">
                  <input
                    disabled={$selectedChannels.length === 8 &&
                      !$selectedChannels.includes(channel)}
                    type="checkbox"
                    id={channel.id}
                    value={channel.id}
                    checked={$selectedChannels.includes(channel)}
                    on:change={() => toggleChannelSelection(channel)}
                    class="mr-2"
                  />
                  <label
                    for={channel.id}
                    class={cn(
                      "text-sm",
                      $selectedChannels.length === 8 &&
                        !$selectedChannels.includes(channel) &&
                        "text-gray-400",
                    )}>{channel.name}</label
                  >
                </div>
              {/each}
            {/if}
          </div>

          <Tabs.Content value="byDate">
            <div class="flex flex-col gap-2">
              <label for="camera" class="text-sm">Select Date</label>
              <div class="relative w-full">
                <input
                  type="text"
                  placeholder="DD MONTH YY"
                  disabled
                  bind:value={searchDate}
                  class="rounded-md block capitalize border-2 text-sm px-2 py-2 leading-tight w-full"
                />
                <button
                  on:click={toggleCalendar}
                  class="absolute top-1/2 -translate-y-1/2 right-2 grid place-items-center !cursor-pointer"
                >
                  <CalendarDaysIcon
                    size={22}
                    class="text-[#727272] pointer-events-none cursor-pointer outline-none"
                  />
                </button>
                {#if $showCalendar}
                  <Calendar
                    bind:value
                    class="bg-white dark:bg-black absolute top-12 right-0 z-[99999999] px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
                  />
                {/if}
              </div>
            </div>

            <div class="w-full">
              <Button
                class="w-full py-2 text-sm font-medium mt-4 rounded-md text-white"
                on:click={fetchPlaybackData}
                disabled={$selectedChannels.length === 0 ||
                  !searchDate ||
                  $isFetching}
              >
                {$isFetching ? "Fetching..." : "Submit"}
              </Button>
            </div>
          </Tabs.Content>
          <Tabs.Content value="byTime">
            <div class="flex flex-col gap-2">
              <label for="camera" class="text-sm">Select Date</label>
              <div class="relative w-full">
                <input
                  type="text"
                  placeholder="DD MONTH YY"
                  disabled
                  bind:value={searchDate}
                  class="rounded-md block capitalize border-2 text-sm px-2 py-2 leading-tight w-full"
                />
                <button
                  on:click={toggleCalendar}
                  class="absolute top-1/2 -translate-y-1/2 right-2 grid place-items-center"
                >
                  <CalendarDaysIcon
                    size={22}
                    class="text-[#727272] pointer-events-none cursor-pointer outline-none"
                  />
                </button>
                {#if $showCalendar}
                  <Calendar
                    bind:value
                    class="bg-white dark:bg-black absolute top-14 right-0 z-[99999999] px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
                  />
                {/if}
              </div>
            </div>

            <div class="flex gap-2 mt-4">
              <div class="w-1/2 flex flex-col gap-1">
                <label for="startTime" class="text-sm">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  placeholder="00:00"
                  bind:value={startTime}
                  class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"
                />
              </div>
              <div class="w-1/2 flex flex-col gap-1">
                <label for="endTime" class="text-sm">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  placeholder="00:00"
                  bind:value={endTime}
                  on:input={validateEndTime}
                  class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"
                />
              </div>
            </div>

            <div class="w-full">
              <Button
                class="w-full py-2 text-sm font-medium mt-4 rounded-md"
                on:click={fetchPlaybackData}
                disabled={$selectedChannels.length === 0 ||
                  !searchDate ||
                  $isFetching}
              >
                {$isFetching ? "Fetching..." : "Submit"}
              </Button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  </div>
</section>

<style>
  .grid-rows-2 {
    grid-template-rows: repeat(2, 50%);
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, 49.6%);
  }

  .video-controls,
  .global-controls {
    width: 100%;
    border-radius: 4px;
  }

  .custom-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    background: transparent;
    outline: none;
  }

  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2px;
    height: 20px;
    background-color: #8aee40;
    border-radius: 0%;
    cursor: ew-resize;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  .custom-slider::-moz-range-thumb {
    width: 2px;
    height: 20px;
    background-color: #8aee40;
    border-radius: 50%;
    cursor: ew-resize;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  .custom-slider::-ms-thumb {
    width: 2px;
    height: 20px;
    background-color: #8aee40;
    border-radius: 50%;
    cursor: ew-resize;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  button {
    background: none;
    border: none;
    cursor: ew-resize;
  }

  /* Optional: Add transition for smooth updates */
  div {
    transition: all 0.3s ease;
  }
</style>
