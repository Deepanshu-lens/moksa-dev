<script lang='ts'>
  import { Calendar } from "@/components/ui/calendar";
  import { toast } from "svelte-sonner";
  import { convertedVideos, allVideos, selectedNode } from "@/lib/stores";
  import { ChevronDown, CalendarDaysIcon, PlusCircle, X } from "lucide-svelte";
  import { uniqueUrlList } from "@/lib/stores";
  import { page } from "$app/stores";
  import { onDestroy, onMount } from "svelte";
  import PocketBase from "pocketbase";

  export let nodes;
  export let cameraList;
  export let currentNvr;
  export let features;
  export let addMode;

  // let playbackurl = writable();
  export let isLoading
  let checkInterval
  let chosenNode;
  let markedDates = [];
  let selectedMode = 1;
  let showCalendar = false;
  let value = null;
  let searchDate;
  let selectedCamera;
  let startTime;
  let endTime;
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  $: if (value) {
    const date = new Date(value.year, value.month - 1, value.day);

    let formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    console.log(formattedDate);
    searchDate = formattedDate;
    showCalendar = false;
    value = null;
  }

  $: if (selectedMode) {
    value = null;
    searchDate = null;
    if (selectedMode === 1) {
      allVideos.set(null);
    }
  }

  $: if (selectedCamera && addMode === 1) {
    handleCameraChange(selectedCamera);
  }

  async function getList(item) {
    console.log("calling camera pocketbase collection placubacl");
    const list = await PB.collection("camera").getList(0, 100, {
      filter: `node~"${$selectedNode.id}" && save = true`,
      sort: "-created",
    });
    console.log("camera status list", list);
    list.items.forEach((item) => {
      if (!$uniqueUrlList.some((uniqueItem) => uniqueItem.url === item.url)) {
        uniqueUrlList.update((currentList) => {
          currentList.push(item);
          return currentList;
        });
      }
    });
  }

  async function handleCameraChange(cam) {
    console.log(currentNvr);
    console.log(cam);
    await fetch("/api/playbackCalendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nvr_ip: currentNvr.ip,
        http_port: currentNvr.http_port,
        username: currentNvr.user_id,
        password: currentNvr.password,
        camera_id: cam?.url?.split("channels/")[1],
        year: new Date().getFullYear().toString(),
        month: (new Date().getMonth() + 1).toString(),
      }),
    })
      .then(async (res) => {
        // const data = await res.json();
        markedDates = await res.json();
        console.log("markedDates", markedDates);
      })
      .catch((err) => console.log(err));
  }

  async function fetchPlaybackData(cameraId, date, startTime, endTime) {
    console.log("get playback data", currentNvr);
    console.log(cameraId, date, startTime, endTime);

    const dateParts = date.split(" ");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = monthNames.indexOf(dateParts[1]) + 1;
    const formattedDate = `${dateParts[2]}${monthIndex.toString().padStart(2, "0")}${dateParts[0].toString().padStart(2, "0")}T`;
    const s =
      formattedDate + startTime.split(":")[0] + startTime.split(":")[1] + "00Z";
    const e =
      formattedDate + endTime.split(":")[0] + endTime.split(":")[1] + "00Z";
    const genratedLink = `rtsp://${currentNvr?.user_id}:${currentNvr?.password}@${currentNvr?.ip}:554/Streaming/tracks/${cameraId?.url?.split("channels/")[1]}`;

    console.log("generatedlink", genratedLink);
    await fetch(
      `http://${$page.url.hostname}:8085/api/startplayback?id=${currentNvr?.ip?.replace(/\./g, "_") + "_" + cameraId?.url?.split("channels/")[1]}&name=${cameraId?.url?.split("channels/")[1]}&url=${genratedLink}&startTime=${s}&endTime=${e}&size=209328`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   startTime: s,
        //   endTime: e,
        //   size: 209328,
        //   url: genratedLink,
        // }),
      },
    )
      .then(async (res) => {
        const data = await res.json();
        console.log("getPlaybackData", data);
        if (data === "Success") {
          if ($convertedVideos.length === 0) {
            setTimeout(() => {
              convertedVideos.set([cameraId]);
            }, 500);
          } else if ($convertedVideos.length < 1) {
            setTimeout(() => {
              convertedVideos.update((videos) => [...videos, cameraId]);
            }, 500);
          } else {
            toast.error("Maximum limit of videos reached");
          }
        }
      })
      .catch((err) => console.log(err));
  }

  async function fetchFromDate(date) {
    const nodeIds = nodes.map((node) => node.id);
    const response = await fetch("/api/playbackVideo/getMany", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, nodeId: nodeIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.error}`);
    }

    const data = await response.json();
    console.log("data from data", data);
    allVideos.set(data.playback_data);
    if (data.playback_data?.length === 0) {
      toast.error(`No Recordings on chosen Date: ${searchDate}`);
    }
    return data;
  }

 
//   async function fetchfroms3(cameraId, date, startTime) {
//   console.log(date);
//   const localDate = new Date(date);
//   const formattedDate = localDate.toLocaleDateString('en-CA').replace(/-/g, '_');
//   console.log(formattedDate);
//   isLoading.set(true);

//   try {
//     const fetchPromise = fetch("/api/playbackVideo/getfromAWS", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ cameraId, date: formattedDate, startTime }),
//     });

//     const timeoutPromise = new Promise((_, reject) => {
//       setTimeout(() => reject(new Error('Timeout')), 15000);
//     });

//     try {
//       const response = await Promise.race([fetchPromise, timeoutPromise]);
      
//       if (response.status === 404 || response.status === 500) {
//         toast.error('Failed to find videos in this time range');
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       // If the response is successful, wait for it to complete
//       await response.json();

//       // Only call checkForOutputFile if we reach this point (no errors)
//       checkForOutputFile(cameraId.id, formattedDate, startTime);
//     } catch (error) {
//       if (error.message === 'Timeout') {
//         console.log('Request timed out, proceeding to check for output file');
//         checkForOutputFile(cameraId.id, formattedDate, startTime);
//       } else {
//         throw error; // Re-throw other errors
//       }
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     toast.error('An error occurred while fetching the video');
//     // Do not call checkForOutputFile here
//   } finally {
//     isLoading.set(false);
//   }
// }


async function fetchfroms3(cameraId, date, startTime) {
  console.log(date);
  const localDate = new Date(date);
  const formattedDate = localDate.toLocaleDateString('en-CA').replace(/-/g, '_');
  console.log(formattedDate);
  isLoading.set(true);

  try {
    const response = await fetch("/api/playbackVideo/getfromAWS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cameraId, date: formattedDate, startTime }),
    });

    if (response.status === 200) {
      const data = await response.json();
      convertedVideos.set(data.url);
    } else {
      console.error(`Error: Received status code ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching video from S3:', error);
  } finally {
    isLoading.set(false);
  }
}

  function checkForOutputFile(cameraId, formattedDate,startTime) {
    checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/videos/${cameraId}/${formattedDate}/${startTime}/output.m3u8`, { method: 'HEAD' });
         console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
        if (response.ok) {
          clearInterval(checkInterval);
          convertedVideos.set(`/videos/${cameraId}/${formattedDate}/${startTime}/output.m3u8`);
          // isLoading = false;
          isLoading.set(false)
        }
      } catch (error) {
        console.error("Error checking for output file:", error);
      }
    }, 7500);
  }

  onDestroy(() => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }})
  // $: console.log($uniqueUrlList)

  $: filteredVideos = $allVideos?.filter(
    (video) =>
      !chosenNode?.value ||
      chosenNode.value === "all" ||
      chosenNode.value === video.cameraNode,
  );

  onMount(() => {
    getList();
    // playbackurl.set('/videos/output.m3u8')
    // isLoading= false
  });
  // console.log('playbacklist',features)

// $: console.log($playbackurl)


    function handleVideoError(event: Event & { currentTarget: EventTarget & Element; }) {
        throw new Error("Function not implemented.");
    }
</script>

{#if addMode === 1}
  <div
    class="flex items-center w-full justify-between px-6 pt-4 pb-2 border-b border-solid"
  >
    <button
      on:click={() => (selectedMode = 1)}
      class={`${selectedMode === 1 ? "text-[#727272]" : "text-[#afafaf]"} font-medium text-sm relative`}
      >Manual {#if selectedMode === 1}<span
          class="absolute h-[2px] w-full bg-[#3D81FC] -bottom-2 left-0"
        />{/if}</button
    >
    <button
      on:click={() => (selectedMode = 2)}
      class={`${selectedMode === 2 ? "text-[#727272]" : "text-[#afafaf]"} font-medium text-sm relative`}
      >Search by Date {#if selectedMode === 2}<span
          class="absolute h-[2px] w-full bg-[#3D81FC] -bottom-2 left-0"
        />{/if}</button
    >
  </div>
{/if}
{#if addMode === 1}
  {#if selectedMode === 1}
    <div class="px-4 py-4 flex flex-col gap-1">
      <label for="camera" class="text-black/[.7] dark:text-slate-200"
        >Select Camera</label
      >
      <div class="relative w-full">
        <select
          bind:value={selectedCamera}
          class={`block text-[#323232] dark:text-white/[.7] capitalize font-medium rounded-md appearance-none w-full bg-[#F6F6F6] dark:bg-black border-2 py-2 text-sm px-2 leading-tight `}
        >
          <option value="" disabled selected>Select from list</option>
          <!-- {#each $selectedNode?.camera as cam}
          <option value={cam.id}>{cam.name}</option>
        {/each} -->
          {#if $uniqueUrlList?.length !== 0}
            {#each $uniqueUrlList as cam}
              <option value={cam}>{cam?.name}</option>
            {/each}
          {/if}
        </select>
        <ChevronDown
          size={22}
          class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none cursor-pointer outline-none"
        />
      </div>
    </div>
    <div class="px-4 flex flex-col gap-1">
      <label for="camera" class="text-black/[.7] dark:text-slate-200"
        >Select Date</label
      >
      <div class="relative w-full">
        <input
          type="text"
          placeholder="DD MONTH YY"
          disabled
          bind:value={searchDate}
          on:change={(e) => (searchDate = e.target.value)}
          class=" rounded-md block capitalize border-2 text-sm px-2 py-2 leading-tight w-full bg-[#f6f6f6] dark:bg-black text-[#979797]"
        />
        <button
          on:click={() => (showCalendar = !showCalendar)}
          class="absolute top-1/2 -translate-y-1/2 right-2 grid place-items-center"
        >
          <CalendarDaysIcon
            size={22}
            class="text-[#727272]  pointer-events-none cursor-pointer outline-none"
          />
        </button>
        {#if showCalendar}
          <Calendar
            {markedDates}
            {selectedCamera}
            bind:value
            class=" bg-white dark:bg-black absolute top-14 right-0 z-[99999999] px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
          />
        {/if}
      </div>
    </div>
    <div class="px-4 w-full py-4 flex flex-row items-center gap-3">
      <span>
        <label for="start-time" class="text-black/[.7] dark:text-slate-200"
          >Start Time</label
        >
        <input
          type="time"
          id="start-time"
          bind:value={startTime}
          placeholder="00:00"
          class="block rounded-md capitalize border-2 text-sm px-2 py-2 leading-tight w-full bg-[#f6f6f6] text-[#979797] dark:bg-black"
        />
      </span>
      <span>
        <label for="end-time" class="text-black/[.7]">End Time</label>
        <input
          type="time"
          id="end-time"
          bind:value={endTime}
          placeholder="00:00"
          class="block rounded-md capitalize border-2 text-sm px-2 py-2 leading-tight w-full bg-[#f6f6f6] text-[#979797] dark:bg-black"
        />
      </span>
    </div>
    \
    <div class="px-4 w-full">
      <button
        class="text-white bg-[#050F41] w-full py-2 text-sm font-medium mt-4 rounded-md cursor-pointer disabled:cursor-not-allowed"
        on:click={() => {
          fetchPlaybackData(selectedCamera, searchDate, startTime, endTime);
        }}
      >
        Submit
      </button>
    </div>
  {:else}
    <div class="mt-4 w-full flex flex-col gap-2">
      <label for="date" class="text-black/[.7] dark:text-slate-200 px-4"
        >Select Camera</label
      >
      <div class="relative w-full px-4">
        <select
          bind:value={selectedCamera}
          class={`block text-[#323232] dark:text-white/[.7] capitalize font-medium rounded-md appearance-none w-full bg-[#F6F6F6] dark:bg-black border-2 py-2 text-sm px-2 leading-tight `}
        >
          <option value="" disabled selected>Select from list</option>
          <!-- {#each $selectedNode?.camera as cam}
        <option value={cam.id}>{cam.name}</option>
      {/each} -->
          {#if cameraList?.length !== 0}
            {#each cameraList as cam}
              <option value={cam}>{cam.matchedChannelName}</option>
            {/each}
          {/if}
        </select>
        <ChevronDown
          size={22}
          class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-6 pointer-events-none cursor-pointer outline-none"
        />
      </div>

      <label for="camera" class="text-black/[.7] dark:text-slate-200 px-4 pb-2"
        >Select Date</label
      >
      <div class="relative w-full px-4">
        <button
          on:click={() => (showCalendar = !showCalendar)}
          class="absolute top-1/2 -translate-y-1/2 left-[1.5rem] grid place-items-center"
        >
          <CalendarDaysIcon
            size={20}
            class="text-[#727272]  pointer-events-none cursor-pointer outline-none"
          />
        </button>
        <input
          bind:value={searchDate}
          disabled
          on:change={(e) => (searchDate = e.target.value)}
          type="text"
          placeholder="DD MONTH, YY"
          class=" h-full block rounded-md capitalize border-2 text-sm pl-8 pr-4 py-2 leading-tight w-full bg-[#f6f6f6] text-[#979797] dark:bg-black"
        />

        <button
          class="absolute top-1/2 -translate-y-1/2 right-[1.5rem] grid place-items-center"
          on:click={() => {
            value = null;
            searchDate = null;
          }}
        >
          <X class="text-[#727272]" size={20} />
        </button>
        {#if showCalendar}
          <Calendar
            bind:value
            class=" bg-white dark:bg-black absolute top-14 right-0 z-[99999999] px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
          />
        {/if}
      </div>
    </div>

    {#if searchDate && selectedCamera}
      <div class="px-4 w-full">
        <button
          on:click={() => {
            fetchFromDate(searchDate);
          }}
          class="text-white bg-[#050F41] w-full py-1 text-sm font-medium mt-4 rounded-md cursor-pointer disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    {/if}
  {/if}
{:else}
  <div class="px-4 py-4 flex flex-col gap-1">
    <label for="camera" class="text-black/[.7] dark:text-slate-200"
      >Select Camera</label
    >
    <div class="relative w-full">
      <select
        bind:value={selectedCamera}
        class={`block text-[#323232] dark:text-white/[.7] capitalize font-medium rounded-md appearance-none w-full bg-[#F6F6F6] dark:bg-black border-2 py-2 text-sm px-2 leading-tight `}
      >
        <option value="" disabled selected>Select from list</option>
        <!-- {#each $selectedNode?.camera as cam}
          <option value={cam.id}>{cam.name}</option>
        {/each} -->
        {#if $uniqueUrlList?.length !== 0}
          {#each $uniqueUrlList as cam}
            <option value={cam}>{cam?.name}</option>
          {/each}
        {/if}
      </select>
      <ChevronDown
        size={22}
        class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none cursor-pointer outline-none"
      />
    </div>
  </div>
  <div class="px-4 flex flex-col gap-1">
    <label for="camera" class="text-black/[.7] dark:text-slate-200"
      >Select Date</label
    >
    <div class="relative w-full">
      <input
        type="text"
        placeholder="DD MONTH YY"
        disabled
        bind:value={searchDate}
        on:change={(e) => (searchDate = e.target.value)}
        class=" rounded-md block capitalize border-2 text-sm px-2 py-2 leading-tight w-full bg-[#f6f6f6] dark:bg-black text-[#979797]"
      />
      <button
        on:click={() => (showCalendar = !showCalendar)}
        class="absolute top-1/2 -translate-y-1/2 right-2 grid place-items-center"
      >
        <CalendarDaysIcon
          size={22}
          class="text-[#727272]  pointer-events-none cursor-pointer outline-none"
        />
      </button>
      {#if showCalendar}
        <Calendar
          {markedDates}
          {selectedCamera}
          bind:value
          class=" bg-white dark:bg-black absolute top-14 right-0 z-[99999999] px-4 py-2 flex flex-col items-center justify-center rounded-md border border-solid border-[#929292]"
        />
      {/if}
    </div>
  </div>
  <div class="px-4 w-full py-4 flex flex-col gap-1">
    <label for="start-time" class="text-black/[.7] dark:text-slate-200"
      >Start Time</label
    >
    <input
      type="time"
      id="start-time"
      bind:value={startTime}
      placeholder="00:00"
      class="block rounded-md capitalize border-2 text-sm px-2 py-2 leading-tight w-full bg-[#f6f6f6] text-[#979797] dark:bg-black"
    />
  </div>
  <div class="px-4 w-full">
    <button
    class="text-white bg-[#050F41] w-full py-2 text-sm font-medium mt-4 rounded-md cursor-pointer disabled:cursor-not-allowed"
    on:click={() => {
      isLoading.set(true) 
      fetchfroms3(selectedCamera, searchDate, startTime)
        .finally(() => {
          isLoading.set( false)
        });
    }}
    disabled={$isLoading}
  >
    {$isLoading ? 'Loading...' : 'Submit'}
  </button>
  </div>
  <!-- {#if isLoading}
  <p class="text-center mt-4">Loading video...</p>
{:else if $playbackurl}
    <AWSPlayer videoPath={$playbackurl} mimeType={$mimet}/>
{/if} -->
{/if}


<style>
  video {
    max-width: 100%;
    height: auto;
  }
</style>