<script lang="ts">
  // Imports
  import * as Tabs from "@/components/ui/tabs";
  import { Play, Pause, ChevronRight, CalendarDaysIcon, Loader2 } from "lucide-svelte";
  import { selectedNode } from "@/stores";
  import { writable } from "svelte/store";
  import Hls from "hls.js";
  import { toast } from "svelte-sonner";
  import { Calendar } from "@/components/ui/calendar";
  import Button from "@/components/ui/button/button.svelte";
  import { cn } from "@/lib/utils";
  import * as Pagination from "@/components/ui/pagination";
  import pb from "@/lib/pb";
  import NodeSelection from "../node/NodeSelection.svelte";
  import { getCameras } from "@/managers/get-camera";
  import { toggleFullscreen, updateTransform } from "@/lib/video-utils";
  import Checkbox from "../ui/checkbox/checkbox.svelte";
  import Label from "../ui/label/label.svelte";

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
  let currentPage = 0;
  const videosPerPage = 8;
  let isFetching = writable<boolean>(false);
  let selectedEvents = writable<string[]>([]);
  let isFetchingEvents = writable<boolean>(false);

  //Constants
  const PLAYBACK_API_URL = "https://playback.lenscorp.cloud/generate-stream";
  const EVENT_API_URL = "http://74.50.98.77:3333/events";
  const EVENTS_OPTIONS = [
    { label: "Person", value: "person", color: "#FF4764" },
    { label: "Fire", value: "fire", color: "#FF5733" },
    { label: "Face", value: "face", color: "#24DA8E" },
    { label: "Vehicle", value: "alpr", color: "#8A2BE2" },
  ];

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
    // console.log only
  }

  function handleEnded(e: any) {
    // console.log only
  }

  function syncPlayState(index: number, isPlaying: boolean) {
    videoPlayStates.update((states) => {
      const newState = [...states];
      newState[index] = isPlaying;
      return newState;
    });
  }

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

        const seekBar = document.querySelectorAll(
          '.video-controls input[type="range"]'
        )[index] as HTMLInputElement;
        if (seekBar) {
          seekBar.value = intervalIndex.toString();
          seekBar.classList.toggle(
            "beyond-duration",
            newTime >= video.duration
          );
        }
      }
    });
    const globalSeekBar = document.querySelector(
      '.global-controls input[type="range"]'
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

      const seekBar = document.querySelectorAll(
        '.video-controls input[type="range"]'
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
              `Playback not available for ${channel.name}` ||
                "Unknown error occurred"
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
            (event) => event.camera === channel.id
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
        })
      );
      videoUrls = { responses, cams: $selectedChannels };
      videoPlayStates.set(new Array(responses.length).fill(true));
    } catch (error) {
      console.error("Error fetching playback data:", error);
    } finally {
      isFetching.set(false);
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

  $: paginatedVideos = videoUrls.responses
    ? videoUrls.responses.slice(
        currentPage * videosPerPage,
        (currentPage + 1) * videosPerPage
      )
    : [];

  function handlePageChange(newPage: number) {
    // Pause all videos except those on the current page
    videoRefs.forEach((video, index) => {
      if (video) {
        // Calculate the page that each video belongs to
        const videoPage = Math.floor(index / videosPerPage);
        if (videoPage !== newPage - 1) {
          pauseVideo(index); // Pause all videos not on the new page
        }
      }
    });

    // Update the current page to the new page
    currentPage = newPage - 1;

    // After a short delay, play only the videos on the current page
    setTimeout(() => {
      videoRefs
        .slice(currentPage * videosPerPage, (currentPage + 1) * videosPerPage)
        .forEach((video, index) => {
          if (video) {
            playVideo(currentPage * videosPerPage + index);
          }
        });
    }, 100);
  }

  // Function to calculate positions of red strips
  function calculateEventPositions(eventsArray: any[], cameraId: string) {
    if (!eventsArray || !eventsArray.length) return { person: [], fire: [], face: [], alpr: [] };

    const typeToColorMap = {
      person: "#FF4764",
      fire: "#FF5733",
      face: "#24DA8E",
      alpr: "#8A2BE2",
    };

    // Initialize arrays for each event type
    const eventPositions = {
      person: [],
      fire: [],
      face: [],
      alpr: [],
    };

    // Filter and map events for the specific camera
    eventsArray
      .filter((event) => event.camera === cameraId)
      .forEach((event) => {
        const eventTime = new Date(event.created);
        const hours = eventTime.getUTCHours();
        const minutes = eventTime.getUTCMinutes();

        const intervalIndex = hours * 6 + Math.floor(minutes / 10);
        const position = (intervalIndex / 144) * 100;
        const color = typeToColorMap[event.type] || "#000000";

        // Add the event to the appropriate array
        if (eventPositions[event.type]) {
          eventPositions[event.type].push({ position, color });
        }
      });

    return eventPositions;
  }

  async function getEvents() {
    isFetchingEvents.set(true);
    try {
      const promises = $selectedChannels.map((channel) => {
        return fetch(EVENT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cameraId: channel.id,
            date: eventDate,
            types: $selectedEvents,
          }),
        }).then(async (response) => {
          const res = await response.json();
          if (res.data.length === 0) {
            toast.error(`No events found for ${channel.name}`);
            return [];
          }
          return res.data;
        });
      });
      const results = await Promise.all(promises);
      events = results.flat();
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      isFetchingEvents.set(false);
    }
  }

  let previousNode: string | null = null;
  $: if ($selectedNode && $selectedNode !== previousNode) {
    isLoading.set(true);
    getCameras($selectedNode).then((cameras) => {
      availableChannels.set(cameras);
      isLoading.set(false);
      previousNode = $selectedNode;
    });
  }

  $: if (videoRefs) {
    const zoomableAreas = document.querySelectorAll(".zoomable-area");

    let scale = 1;
    const zoomStep = 0.2;
    const maxScale = 3;
    const minScale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX: number | null = null;
    let startY: number | null = null;

    zoomableAreas.forEach((area) => {
      const video = area.querySelector("video");
      area.addEventListener("dblclick", () => {
        if (!document.fullscreenElement) {
          toggleFullscreen(area);
        } else {
          document.exitFullscreen();
        }
      });
      document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
          scale = 1;
          translateX = 0;
          translateY = 0;
          updateTransform(video, scale, translateX, translateY);
        }
      });
      area.addEventListener("wheel", (e) => {
        e.preventDefault();
        if (document.fullscreenElement) {
          if (e instanceof WheelEvent && e.deltaY < 0) {
            scale = Math.min(scale + zoomStep, maxScale);
          } else if (e instanceof WheelEvent) {
            scale = Math.max(scale - zoomStep, minScale);
          }
          updateTransform(video, scale, translateX, translateY);
        }
      });
      area.addEventListener("mousedown", (e) => {
        if (document.fullscreenElement) {
          isDragging = true;
          startX = (e as MouseEvent).pageX - translateX;
          startY = (e as MouseEvent).pageY - translateY;
          (area as HTMLElement).style.cursor = "grabbing";
        }
      });

      area.addEventListener("mousemove", (e) => {
        if (isDragging && document.fullscreenElement) {
          if (e instanceof MouseEvent) {
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
        }
      });

      area.addEventListener("mouseup", () => {
        isDragging = false;
        (area as HTMLElement).style.cursor = "grab";
      });

      area.addEventListener("mouseleave", () => {
        isDragging = false;
        (area as HTMLElement).style.cursor = "grab";
      });
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
                      : "grid-cols-4 grid-rows-2"
      )}
    >
      {#if videoUrls.responses && videoUrls.responses.length > 0}
        {#each videoUrls.responses as video, index}
          <div class="zoomable-area" id={`area-${index}`}>
            <video
              id={`video-${index}`}
              bind:this={videoRefs[index]}
              class="w-full h-full"
              src={video}
              autoplay
              muted
              playsinline
              on:play={handlePlayed}
              on:ended={handleEnded}
            ></video>
          </div>
        {/each}
      {:else}
        <div
          class="w-full h-full border flex items-center justify-center col-span-4 row-span-4"
        >
          <p class="font-semibold text-lg">No Playbacks Selected</p>
        </div>
      {/if}
      {#if videoUrls.responses.length > videosPerPage}
        <div
          class="absolute bottom-0 left-0 w-full flex justify-center mt-4 mb-2"
        >
          <Pagination.Root
            count={videoUrls.responses.length}
            perPage={videosPerPage}
            siblingCount={1}
            page={currentPage + 1}
            on:change={(e) => handlePageChange(e.detail)}
          >
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.PrevButton />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.NextButton />
              </Pagination.Item>
            </Pagination.Content>
          </Pagination.Root>
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
                on:input={(e) =>
                  seekAllVideos(
                    parseInt((e.target as HTMLInputElement).value, 10)
                  )}
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
              <button
                aria-label="Fullscreen"
                on:click={() => toggleFullscreen(index)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 cursor-pointer"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v6h6M4 20v-6h6M20 4v6h-6M20 20v-6h-6"
                  />
                </svg>
              </button>
            </div>
            <div
              class="bg-white/10 w-[89%] 2xl:w-[90%] h-[95%] p-0 m-0 flex gap-1 pr-6 2xl:pr-7 relative"
              style="background: linear-gradient(to right, #3F6C1C, #3F6C1C), rgba(255, 255, 255, 0.1); background-size: {$videoBackgroundWidths[
                index
              ]}% 100%; background-repeat: no-repeat;"
            >
              {#each Object.values(calculateEventPositions(events, cam.id)) as markers}
                {#each markers as { position, color }}
                  <div
                    class="absolute top-0 h-full w-[2px]"
                    style="left: {position}%; background-color: {color};"
                  ></div>
                {/each}
              {/each}
              <input
                type="range"
                min="0"
                max="144"
                step="1"
                value="0"
                class="custom-slider"
                on:input={(e) =>
                  seekVideo(
                    index,
                    parseInt((e.target as HTMLInputElement).value, 10)
                  )}
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
      class={`absolute ${showRightPanel ? "-left-6" : "-left-6"} py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800  top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[5]`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700 cursor-pointer z-10`}
      />
    </button>
    <div
      class={`${showRightPanel ? "opacity-100" : "opacity-0"} transtion-opacity ease-in-out duration-500 `}
    >
      <NodeSelection />
      <div class="px-4 py-4 flex flex-col gap-1">
        <Tabs.Root value="byDate">
          <Tabs.List class="w-full border mb-4">
            <Tabs.Trigger value="byDate" class="w-1/2 rounded-md"
              >By Date</Tabs.Trigger
            >
            <Tabs.Trigger value="byTime" class="w-1/2 rounded-md"
              >By Time</Tabs.Trigger
            >
          </Tabs.List>
          <label for="camera" class="text-sm font-semibold"
            >Select Cameras</label
          >
          <!-- Cameras List limit upto 8 -->
          <div class="w-full px-2 py-1 max-h-[160px] overflow-y-auto">
            {#if $isLoading}
              <Loader2 size={20} class="animate-spin" />
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
                        "text-gray-400"
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
                class="w-full py-2 text-sm font-medium mt-4 rounded-md"
                on:click={fetchPlaybackData}
                disabled={$selectedChannels.length === 0 ||
                  !searchDate ||
                  $isFetching}
              >
                {#if $isFetching}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin inline" />
                  Fetching...
                {:else}
                  Submit
                {/if}
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
                {#if $isFetching}
                  <Loader2 class="mr-2 h-4 w-4 animate-spin inline" />
                  Fetching...
                {:else}
                  Submit
                {/if}
              </Button>
            </div>
          </Tabs.Content>
          <!-- events makers -->
          <div class="py-4">
            <p
              class={cn("text-sm font-semibold", {
                hidden: videoUrls?.responses?.length === 0,
              })}
            >
              Mark Events
            </p>
            <div
              class={cn("flex flex-wrap gap-4 py-4", {
                hidden: videoUrls?.responses?.length === 0,
              })}
            >
              {#each EVENTS_OPTIONS as option}
                <div class="flex items-center justify-center gap-2">
                  <Checkbox
                    onCheckedChange={(v) => {
                      selectedEvents.update((events) => {
                        if (v) {
                          return [...events, option.value]; // Add event
                        } else {
                          return events.filter(
                            (event) => event !== option.value
                          ); // Remove event
                        }
                      });
                    }}
                    checked={$selectedEvents.includes(option.value)}
                    class={cn({
                      "data-[state=checked]:bg-[#8A2BE2]":
                        option.color === "#8A2BE2",
                      "data-[state=checked]:bg-[#FF4764]":
                        option.color === "#FF4764",
                      "data-[state=checked]:bg-[#24DA8E]":
                        option.color === "#24DA8E",
                      "data-[state=checked]:bg-[#FF5733]":
                        option.color === "#FF5733",
                    })}
                  />
                  <Label>{option.label}</Label>
                </div>
              {/each}
            </div>
            <Button
              disabled={$selectedEvents.length < 1 || $isFetchingEvents}
              class={cn("w-full py-2 text-sm font-medium rounded-md", {
                hidden: videoUrls?.responses?.length === 0,
              })}
              on:click={getEvents}
            >
              {#if $isFetchingEvents}
                <Loader2 class="mr-2 h-4 w-4 animate-spin inline" />
                Fetching Events...
              {:else}
                Get Events
              {/if}
            </Button>
          </div>
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

  .zoomable-area {
    overflow: hidden;
    cursor: grab;
    position: relative;
  }

  .zoomable-area video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform-origin: center;
    transform: scale(1) translate(0, 0);
    transition: transform 0.3s ease-out;
  }

  /* Optional: Add transition for smooth updates */
  div {
    transition: all 0.3s ease;
  }
</style>
