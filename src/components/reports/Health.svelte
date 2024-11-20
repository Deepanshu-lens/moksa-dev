<script lang="ts">
  import Row from "./tableRow/Row.svelte";
  import PocketBase from "pocketbase";
  import {
    ArrowLeft,
    ArrowUpRight,
    CalendarDays,
    DatabaseIcon,
    Filter,
    FilterIcon,
    Search,
    TrendingUp,
    AlertTriangle,
    WebcamIcon,
    ChevronsUpDown,
  } from "lucide-svelte";
  import Button from "../ui/button/button.svelte";
  import { MoreVertical } from "lucide-svelte";
  import * as Table from "@/components/ui/table/index";
  import * as Select from "@/components/ui/select/index";
  import * as Carousel from "@/components/ui/carousel";
  import { writable } from "svelte/store";
  import HealthNvrcard from "../cards/HealthNvrcard.svelte";
  import { getContext, onMount } from "svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
  import { selectedNode } from "@/stores";
  import MapNvr from "../map/MapNvr.svelte";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import Autoplay from "embla-carousel-autoplay";
  import { Navigation } from "lucide-svelte";
  export let data;
  export let nodes;
  let selectedNvr = writable(null);
  let cameraList = [];

  const PB: PocketBase = new PocketBase();

  let view = 3;

  import AreaAnalysis from "./charts/AreaAnalysis.svelte";
  import { Input } from "../ui/input";
  import StorageNvrCard from "../cards/StorageNvrCard.svelte";
  import Doughnut from "./charts/Doughnut.svelte";

  let NvrData;
  let NvrStorageData;
  let uniqueCams = [];
  let activeCams = 0;
  let inactiveCams = 0;
  let activeNvr = 0;
  let inactiveNvr = 0;
  let totalCapacity = 0;
  let totalFreeSpace = 0;
  let delayedFlag = false;
  setTimeout(() => {
    delayedFlag = true;
  }, 4000);

  async function fetchNvrData() {
    if ($selectedNode) {
      NvrData = await PB?.collection("nvr").getFullList({
        filter: `node~"${$selectedNode.id}"`,
        sort: "-created",
        expand: "ip_address",
      });
      for (let i = 0; i < NvrData.length; i++) {
        const nvr = NvrData[i];
        const status = await PB.collection("nvr_ping_status").getFirstListItem(
          `nvr="${nvr.id}"`
        );
        NvrData[i].status = status;

        if (nvr.status && nvr.status.status === true) {
          activeNvr += 1;
        } else {
          inactiveNvr += 1;
        }
      }
    }
  }

  async function getNvrStorageData() {
    if ($selectedNode) {
      NvrStorageData = await PB.collection("nvr_storage").getFullList({
        filter: `node~"${$selectedNode.id}"`,
        sort: "-created",
        expand: `nvr`,
      });

      NvrStorageData.forEach((storage) => {
        totalCapacity += storage.capacity / 1024 / 1024; // Convert MB to PB
        totalFreeSpace += storage.free_space / 1024 / 1024;
      });
    }
  }

  async function getCameraList() {
    try {
      PB.autoCancellation(false);
      console.log("cameralist get inside try");
      const res = await PB.collection("camera_ping_status").getList(1, 200, {
        filter: `node~"${$selectedNode.id}"`,
        sort: "-created",
        expand: "camera",
      });

      // if(res.items.length === 0) {
      //   console.log($selectedNode.camera)
      // } else {}

      const uniqueCameras = new Map();
      activeCams = 0;
      inactiveCams = 0;
      res.items.forEach((item) => {
        const cameraId = item?.expand?.camera?.id;
        if (
          !uniqueCameras.has(cameraId) ||
          new Date(item.created) > new Date(uniqueCameras.get(cameraId).created)
        ) {
          uniqueCameras.set(cameraId, item);
          if (item.status === true) {
            activeCams += 1;
          } else {
            inactiveCams += 1;
          }
        }
      });

      const latestUniqueCameras = Array.from(uniqueCameras.values());
      uniqueCams = latestUniqueCameras;
      cameraList = latestUniqueCameras;
      return latestUniqueCameras;
    } catch (err) {
      console.log(err);
    }
  }

  // onMount(() => {
  //   fet
  // })

  // onMount(async () => {
  //    await getCameraList();

  //   PB.collection("nvr_ping_status").subscribe("*", async (e) => {
  //     console.log(e.action);
  //     if (e.action === "create") {
  //       // fetchNvrData();
  //     }
  //   });
  //   PB.collection("camera_ping_status").subscribe("*", async (e) => {
  //     console.log(e.action);
  //     if (e.action === "create") {
  //       // cameraList = await getCameraList();
  //     }
  //   });
  // });

  // onDestroy(() => {
  //   PB.collection("nvr_ping_status").unsubscribe("*");
  //   PB.collection("camera_ping_status").unsubscribe("*");
  // });

  // $: $selectedNode, fetchNvrData(), getNvrStorageData();

  $: if ($selectedNode) {
    fetchData();
  }

  async function fetchData() {
    activeNvr = 0;
    inactiveNvr = 0;
    totalCapacity = 0;
    totalFreeSpace = 0;
    // await fetchNvrData();
    // await getNvrStorageData();
    // await getCameraList();
    await Promise.all([fetchNvrData(), getNvrStorageData(), getCameraList()]);
  }

  function parseDetail(detailString, key) {
    const lines = detailString.split("\n");
    const line = lines.find((line) => line.startsWith(key));
    if (line) {
      return line.split(": ")[1];
    }
    return "Not available";
  }

  $: console.log("nvrdata", NvrData);
</script>

<div class="w-full h-[calc(100vh-75px)]">
  <div
    class="flex items-center justify-center rounded-lg border-black/[.13] dark:border-white/[.13] border-solid border-[1px] p-1 w-[500px] h-[40px] mx-auto my-4"
  >
    <button
      on:click={() => (view = 1)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 1 ? "text-white bg-[#016667]" : "bg-transparent"}`}
      >Cameras</button
    >
    <button
      on:click={() => (view = 2)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 2 ? "text-white bg-[#016667]" : "bg-transparent"}`}
      >NVR</button
    >
    <button
      on:click={() => (view = 3)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 3 ? "text-white bg-[#016667]" : "bg-transparent"}`}
      >Hard Disk</button
    >
  </div>
  {#if view === 1}
    <section
      class="flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar pb-10"
    >
      <div class="flex items-center justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232] dark:text-slate-200">
            Health Monitor
          </h2>
          <h5 class="text-sm text-black/[.5] dark:text-white/[.5]">
            Streamlined insights into your device's vital stats for informed
            decisions.
          </h5>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
          >
            <Navigation class="w-4 h-4" />
            <span class="font-medium">Location</span>
          </Button>
          <Button>Export</Button>
        </div>
      </div>
      <div class="flex items-start gap-x-4">
        <!-- camera count  -->
        <div class=" rounded-md">
          <div class="border p-2 rounded-md">
            <span class=" col-span-3 flex flex-col gap-4 h-full justify-center">
              <span class="text-lg font-semibold leading-6"
                >Camera Count & Status</span
              >
              <span class="flex items-center gap-2 text-2xl font-bold leading-8"
                >Total: {uniqueCams.length}
                <span class="flex items-center gap-1 text-sm text-[#00B69B]">
                  <TrendingUp size={18} /> 1.3%
                </span>
              </span>
              <span class="flex items-center gap-3">
                <span class="flex items-center gap-1 text-sm">
                  <span class="h-2 w-2 rounded-full bg-[#5B93FF]" />
                  <strong>{activeCams}</strong> Active</span
                >
                <span class="flex items-center gap-1 text-sm"
                  ><span class="h-2 w-2 rounded-full bg-[#FFD66B]" /><strong
                    >{inactiveCams}</strong
                  > Inactive</span
                >
              </span>
            </span>
            <span class="col-span-3 row-span-1 relative">
              {#if delayedFlag}<Doughnut
                  activeCameras={activeCams}
                  inactiveCameras={inactiveCams}
                />
                <span
                  id="bell"
                  class="h-[35px] w-[35px] rounded-full bg-[#5B93FF] bg-opacity-15 grid place-items-center absolute -translate-x-1/2 -translate-y-1/3 top-1/2 left-1/2 z-[200]"
                >
                  <WebcamIcon size={24} class="text-[#5B93FF]" />
                </span>
              {:else}
                <div class="w-full h-full grid place-items-center">
                  <Spinner />
                </div>
              {/if}</span
            >
          </div>
        </div>

        <!-- total cameras -->
        <div class="flex flex-col gap-4">
          <div
            class="border-2 border-black/.23 border-solid h-[100px] w-[180px] rounded-lg p-2 relative flex flex-col justify-between py-4"
          >
            <p class="text-[#202224] font-medium text-sm">Total Cameras</p>
            <p class="text-xl text-[#202224] font-bold">2,314</p>
            <span
              class=" rounded-2xl h-[51px] w-[51px] grid place-items-center absolute top-4 right-2"
            >
              <img src="/images/camera_1.png" alt="camera" class="h-10 w-10" />
            </span>
          </div>
          <div
            class="border-2 border-black/.23 border-solid h-[100px] w-[180px] rounded-lg p-2 relative flex flex-col justify-between py-4"
          >
            <p class="text-[#202224] font-medium text-sm">Active Alerts</p>
            <p class="text-xl text-[#202224] font-bold">2,314</p>
            <span
              class=" rounded-2xl h-[51px] w-[51px] grid place-items-center absolute top-4 right-2"
            >
              <img
                src="/images/persons_icon.png"
                alt="person"
                class="h-10 w-10"
              />
            </span>
          </div>
        </div>

        <!-- Area anaylsis Graph -->
        <div class="border p-2 rounded-md overflow-clip">
          <div class="flex items-center justify-between mb-8">
            <span class="text-lg font-medium">Area Analysis</span>
            <div class="flex items-center gap-2">
              <Select.Root>
                <Select.Trigger class="w-[180px] focus:ring-0">
                  <Select.Value placeholder="Sort By: Area" />
                </Select.Trigger>
                <Select.Content>
                  <!-- <Select.Item value="population">Sort By: Population</Select.Item
                >
                <Select.Item value="density">Sort By: Density</Select.Item>
                <Select.Item value="growth">Sort By:Growth Rate</Select.Item> -->
                </Select.Content>
              </Select.Root>
              <MoreVertical size={18} />
            </div>
          </div>
          <!-- {#if NvrData && uniqueCams && delayedFlag}
            <AreaAnalysis {NvrData} {uniqueCams} />
          {:else}
            <div class="w-full h-full grid place-items-center">
              <Spinner />
            </div>
          {/if} -->
          <div class="h-full w-full overflow-hidden">
            <img
              src="/images/Graph08.png"
              class="max-h-[250px] w-full object-contain"
              alt="8"
            />
          </div>
        </div>
      </div>

      <div class="h-full w-full p-4 flex flex-col gap-2">
        <p class="font-medium text-lg">List of Cameras</p>
        <Table.Root class="mx-auto w-full flex flex-col pb-10">
          <Table.Header
            class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9]"
          >
            <Table.Row
              class="bg-transparent flex items-center justify-between p-3"
            >
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  ID
                  <ChevronsUpDown class="scale-75" />
                </span>
              </Table.Head>
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  Name <ChevronsUpDown class="scale-75" />
                </span>
              </Table.Head>
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  Severity <ChevronsUpDown class="scale-75" />
                </span>
              </Table.Head>
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  Downtime <ChevronsUpDown class="scale-75" />
                </span></Table.Head
              >
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  Status <ChevronsUpDown class="scale-75" />
                </span></Table.Head
              >
              <Table.Head class="text-[#727272] w-full h-full">
                <span class="flex items-center gap-1">
                  Exisitng Alert <ChevronsUpDown class="scale-75" />
                </span></Table.Head
              >
              <Table.Head class="text-[#727272] w-full h-full"
                >Actions</Table.Head
              >
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each Array(20) as _, index}
              <Table.Row
                class="bg-transparent flex items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4]"
              >
                <Table.Cell class="text-black w-full h-full"
                  ><span class="flex items-center gap-2">
                    #{index + 1}
                  </span>
                </Table.Cell>
                <Table.Cell class="text-[#727272] w-full h-full text-sm ml-2"
                  ><span>Camera {index + 1}</span></Table.Cell
                >
                <Table.Cell
                  class="text-[#727272] w-full h-full text-sm flex items-center gap-x-2"
                  ><div class="bg-red-500 size-3 rounded-full"></div>
                  Critical</Table.Cell
                >
                <Table.Cell class="text-[#727272] w-full h-full text-sm"
                ><span>04:54:19 PM</span></Table.Cell
              >
                <Table.Cell class="text-[#4976F4] bg-[#EDF2FE]  h-8 rounded-sm text-sm flex items-center"
                  ><span>Active</span></Table.Cell
                >
               
                <Table.Cell class="text-[#727272] w-full h-full text-sm"
                  ><span>Unknown person at front door</span></Table.Cell
                >
                <Table.Cell class="text-[#727272] w-full h-full text-sm">
                  <Carousel.Root
                    opts={{
                      align: "start",
                    }}
                    class="w-1/2 mx-auto"
                    plugins={[
                      Autoplay({
                        delay: 2000,
                      }),
                    ]}
                  >
                    <Carousel.Content class="m-0">
                      {#each Array(4) as img}
                        <Carousel.Item
                          class="pl-[2px] md:basis-1/2 lg:basis-1/3"
                          ><img
                            src={"/images/01.svg"}
                            alt="carousel-img"
                            width="100%"
                            height="100%"
                          />
                        </Carousel.Item>
                        <!-- <Render of={cell.render()} /> -->
                      {/each}
                    </Carousel.Content>
                    <Carousel.Previous />
                    <Carousel.Next />
                  </Carousel.Root>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </div>
    </section>
  {/if}
  {#if view === 2 && $selectedNvr === null}
    <section
      class="flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar pb-10"
    >
      <div class="flex items-center justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232]">Health Monitor</h2>
          <h5 class="text-sm text-black/.5">
            Streamlined insights into your device's vital stats for informed
            decisions.
          </h5>
        </div>
        <div class="flex items-center gap-2">
          <!-- <NodeSelection
            isAllFullScreen={false}
            {nodes}
            url={data.url ?? "/"}
            {data}
          /> -->

          <!-- location button -->
          <Button
            variant="outline"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm"
          >
            <Navigation class="w-4 h-4" />
            <span class="font-medium">Location</span>
          </Button>
          <!-- <Button variant="outline" class="flex items-center gap-2 text-sm"
          ><MapPin size={18} /> Location</Button
        > -->
          <Button>Export</Button>
        </div>
      </div>
      <div class="grid grid-cols-8 grid-rows-2 h-[320px] gap-4 px-4">
        <div class="gap-4 col-span-2 row-span-2 grid grid-rows-2 grid-cols-1">
          <div
            class="border col-span-1 row-span-2 grid grid-cols-3 p-2 rounded-md"
          >
            <span
              class=" col-span-3 row-span-1 flex flex-col gap-4 h-full justify-center"
            >
              <span class="text-lg font-semibold leading-6"
                >NVR Count & Status</span
              >
              <span class="flex items-center gap-2 text-2xl font-bold leading-8"
                >Total: {NvrData?.length}
                <span class="flex items-center gap-1 text-sm text-[#00B69B]">
                  <TrendingUp size={18} /> 1.3%
                </span>
              </span>
              <span class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full bg-[#5B93FF]" /><strong
                    >{activeNvr}</strong
                  > Active</span
                >
                <span class="flex items-center gap-1"
                  ><span class="h-2 w-2 rounded-full bg-[#FFD66B]" />
                  <strong>{inactiveNvr}</strong> Inactive</span
                >
              </span>
            </span>
            <span class="col-span-3 row-span-1 relative"
              >{#if delayedFlag}<Doughnut
                  activeCameras={activeNvr}
                  inactiveCameras={inactiveNvr}
                />
                <span
                  id="bell"
                  class="h-[30px] w-[30px] rounded-full bg-[#5B93FF] bg-opacity-15 grid place-items-center absolute -translate-x-1/2 -translate-y-1/3 top-1/2 left-1/2 z-[200]"
                >
                  <DatabaseIcon size={18} class="text-[#5B93FF]" />
                </span>
              {/if}</span
            >
          </div>
          <!-- <div
          class="border col-span-1 row-span-1 grid grid-cols-3 p-2 rounded-md"
        >
          <span class=" col-span-2 flex flex-col gap-4 h-full justify-center">
            <span class="text-lg font-semibold leading-6">Alerts</span>
            <span class="flex items-center gap-2 text-2xl font-bold leading-8"
              >100
              <span class="flex items-center gap-1 text-sm text-[#00B69B]">
                <TrendingUp size={18} /> 1.3%
              </span>
            </span>
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <span class="h-2 w-2 rounded-full bg-[#99A2FB]" /> Critical</span
              >
              <span class="flex items-center gap-1"
                ><span class="h-2 w-2 rounded-full bg-[#FB99B0]" /> Non-critical</span
              >
            </span>
          </span>
          <span class="col-span-1 relative"
            >{#if delayedFlag}<Doughnut2 critical={3} nonCritical={5} />
              <span
                id="bell"
                class="h-[30px] w-[30px] rounded-full bg-[#605BFF] bg-opacity-15 grid place-items-center absolute -translate-x-1/2 -translate-y-1/3 top-1/2 left-1/2 z-[200]"
              >
                <BellRing size={18} class="text-[#605BFF]" />
              </span>{/if}</span
          >
        </div> -->
        </div>
        <div class=" col-span-3 row-span-2 border p-2 rounded-md">
          <div class="flex items-center justify-between pt-2">
            <p class="text-lg font-medium leading-5">Map View</p>
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 bg-[#03A185] rounded-full" /> Active</span
              >
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 bg-[#B5496E] rounded-full" /> Inactive</span
              >
            </span>
          </div>
          <div class="h-[95%] w-full">
            {#if NvrData && delayedFlag}
              <MapNvr {NvrData} />
            {/if}
          </div>
        </div>
        <div class=" col-span-3 row-span-2 border p-2 rounded-md overflow-clip">
          <div class="flex items-center justify-between mb-8">
            <span class="text-lg font-medium">Area Analysis</span>
            <div class="flex items-center gap-2">
              <Select.Root>
                <Select.Trigger class="w-[180px]">
                  <Select.Value placeholder="Sort By: Area" />
                </Select.Trigger>
                <Select.Content>
                  <!-- <Select.Item value="population">Sort By: Population</Select.Item
                > -->
                  <!-- <Select.Item value="density">Sort By: Density</Select.Item> -->
                  <!-- <Select.Item value="growth">Sort By:Growth Rate</Select.Item> -->
                </Select.Content>
              </Select.Root>
              <MoreVertical size={18} />
            </div>
          </div>
          {#if NvrData && uniqueCams && delayedFlag}
            <AreaAnalysis {NvrData} {uniqueCams} />
          {/if}
        </div>
      </div>
      <span class=" flex items-center gap-4 pt-4 px-4">
        <span class="text-xl font-bold leading-8 tracking-wide"
          >List of Network Video Recorder
        </span>
        <span class="ml-auto relative"
          ><Search class="absolute top-1/2 -translate-y-1/2 left-4" size={18} />
          <Input class="w-[300px] pl-12" placeholder="Search by name" /></span
        >
        <span class=" flex items-center gap-2">
          <FilterIcon /> Filters
        </span>
      </span>
      <div class="flex flex-wrap items-center gap-4 p-4">
        {#each NvrData as nvr, i}
          <HealthNvrcard {selectedNvr} {nvr} />
        {/each}
      </div>
    </section>
  {/if}
  {#if view === 3}
    <section
      class="flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar"
    >
      <div class="flex items-center justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232]">
            Hard Disk Health Monitor
          </h2>
          <h5 class="text-sm text-black/.5">
            Streamlined insights into your device's vital stats for informed
            decisions.
          </h5>
        </div>
        <div class="flex items-center gap-2">
          <!-- <NodeSelection
            isAllFullScreen={false}
            {nodes}
            url={data.url ?? "/"}
            {data}
          /> -->

          <!-- location button -->
          <Button
            variant="outline"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 shadow-sm mr-2"
          >
            <Navigation class="w-4 h-4" />
            <span class="font-medium">Location</span>
          </Button>
          <Button variant="brand">Export</Button>
        </div>
      </div>

      <!-- first card row  -->
      <div
        class="grid grid-cols-8 grid-rows-1 h-[150px] 2xl:h-[250px] gap-4 px-4"
      >
        <div class="gap-4 col-span-8 row-span-1 grid grid-rows-1 grid-cols-8">
          <div
            class="p-2 col-span-2 row-span-1 border rounded-md grid grid-rows-2 grid-cols-3 gap-1 relative"
          >
            <span class="col-span-3 flex items-start justify-between">
              <span class="flex flex-col gap-1">
                <p class="font-medium text-black dark:text-white">
                  Total Storage
                </p>
                <p class="text-xs text-black/[.6] dark:text-white/[.6]">
                  Includes storage on all Location
                </p>
                <p class="text-lg font-semibold text-black dark:text-white">
                  {totalCapacity?.toFixed(2)}TB
                </p>
              </span>
              <span
                class="h-[40px] w-[40px] grid place-items-center rounded-md bg-[#F7E8FF] dark:text-black"
              >
                <ArrowUpRight size={24} />
              </span>
            </span>
            <img
              src="/images/storage1.png"
              alt="graph"
              class="absolute bottom-2 left-1/2 -translate-x-1/2 scale-90"
            />
          </div>
          <div
            class="p-2 col-span-2 row-span-1 border rounded-md grid grid-rows-2 grid-cols-3 gap-1 relative"
          >
            <span class="col-span-3 flex items-start justify-between">
              <span class="flex flex-col gap-1">
                <p class="font-medium text-black dark:text-white">
                  Total Used Storage
                </p>
                <p class="text-xs text-black/[.6] dark:text-white/[.6]">
                  Summary of used storage
                </p>
                <p class="text-lg font-semibold text-black dark:text-white">
                  {(totalCapacity - totalFreeSpace)?.toFixed(2)} TB
                </p>
              </span>
              <span
                class="h-[40px] w-[40px] grid place-items-center rounded-md bg-[#FFE5F7] dark:text-black"
              >
                <ArrowUpRight size={24} />
              </span>
            </span>
            <img
              src="/images/storage2.png"
              alt="graph"
              class="absolute bottom-2 scale-90 left-1/2 -translate-x-1/2"
            />
          </div>
          <div
            class="p-2 col-span-2 row-span-1 border rounded-md grid grid-rows-2 grid-cols-3 gap-1 relative"
          >
            <span class="col-span-3 flex items-start justify-between">
              <span class="flex flex-col gap-1">
                <p class="font-medium text-black dark:text-white">
                  Available Storage
                </p>
                <p class="text-xs text-black/[.6] dark:text-white/[.6]">
                  Summary of all Storage
                </p>
                <p class="text-lg font-semibold text-black dark:text-white">
                  {totalFreeSpace?.toFixed(2)} TB
                </p>
              </span>
              <span
                class="h-[40px] w-[40px] grid place-items-center rounded-md bg-[#FFEAE4]"
              >
                <ArrowUpRight size={24} />
              </span>
            </span>
            <img
              src="/images/storage3.png"
              alt="graph"
              class="absolute bottom-2 scale-90 left-1/2 -translate-x-1/2"
            />
          </div>
          <div
            class="p-2 col-span-2 row-span-1 border rounded-md grid grid-rows-2 grid-cols-3 gap-1 relative"
          >
            <span class="col-span-3 flex items-start justify-between">
              <span class="flex flex-col gap-1">
                <p class="font-medium text-black dark:text-white">
                  Average Storage per NVR
                </p>
                <p class="text-xs text-black/[.6] dark:text-white/[.6]">
                  Summray of avg storage
                </p>
                <p class="text-lg font-semibold text-black dark:text-white">
                  {(totalCapacity?.toFixed(2) / NvrData?.length)?.toFixed(2)} TB
                </p>
              </span>
              <span
                class="h-[40px] w-[40px] grid place-items-center rounded-md bg-[#FFE8ED] dark:text-black"
              >
                <ArrowUpRight size={24} />
              </span>
            </span>
            <img
              src="/images/storage4.png"
              alt="graph"
              class="absolute bottom-2 scale-90 left-1/2 -translate-x-1/2"
            />
          </div>
        </div>
      </div>

      <!-- graphs Container section -->
      <div class="flex items-center justify-between gap-x-3 mt-4 mx-3 h-full">
        <!-- bar graph -->
        <div
          class="col-span-6 row-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
        >
          <span class="font-semibold text-lg text-[#323232]"
            >Reports & Analytics</span
          >
          <span class="text-sm font-medium">Average Storage Usage</span>
          <span class="w-full flex items-center justify-between"
            ><span class="flex items-center gap-2 tex-lg font-medium">
              64.23% <span
                class="text-xs text-[#589e67] bg-[#EEF5F0] rounded-xl p-1 w-[50px] h-[25px] flex items-center gap-1"
                ><TrendingUp class="h-[14px] w-[14px]" /> 12%</span
              >
            </span>
            <span class="flex items-center gap-1">
              <button
                class="flex items-center gap-2 px-2 py-1 w-[150px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-base text-[#4f4f4f]"
                ><CalendarDays class="text-[#4f4f4f]" /> Date</button
              >
              <button
                class="flex items-center gap-2 px-2 py-1 w-[100px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-base text-[#4f4f4f]"
                ><Filter class="text-[#4f4f4f]" /> Filter</button
              >
            </span></span
          >
          <span class="text-sm text-opacity-60"
            >Average storage used in a month</span
          >
          <span class="h-[22.5rem] w-full overflow-clip"
            ><img
              src="/images/GraphReports.png"
              alt="garph"
              class="h-full w-full object-contain overflow-clip"
            /></span
          >
        </div>

        <!-- Pie chart -->
        <div
          class="col-span-6 row-span-2 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
        >
          <span class="w-full flex items-center justify-between">
            <p class="text-xl font-semibold">Available Storage</p>
            <Button variant="outline" class="flex items-center gap-2">
              <FilterIcon size={20} /> Filter</Button
            >
          </span>
          <p class="text-sm text-[#727272] w-[80%] py-2">
            The data below show the available storage location wise
          </p>
          <span class=" w-full flex items-center justify-between pb-2">
            <span class="flex font-semibold items-center gap-2 tex-lg">
              64.23%
              <span
                class="text-xs text-[#589e67] bg-[#EEF5F0] rounded-xl p-1 w-[50px] h-[25px] flex items-center gap-1"
                ><TrendingUp class="h-[14px] w-[14px]" /> 12%</span
              >
            </span>
          </span>

          <div class="grid grid-rows-2 grid-cols-3">
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-black" /> location
            </span>
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-[#0D454B]" /> location
            </span>
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-[#015A62]" /> location
            </span>
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-[#027680]" /> location
            </span>
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-[#00A3B2]" /> location
            </span>
            <span class="flex items-center gap-2 col-span-1"
              ><span class="h-2 w-2 rounded-full bg-[#06D2E5]" /> location
            </span>
          </div>

          <div class="pie-graph-container">
            <img
              src="/images/pie_graph.png"
              alt="pie-chart"
              class="w-full h-full object-contain overflow-clip"
            />
          </div>
        </div>
      </div>

      <!-- <div class="flex items-center justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232]">Storage per NVR</h2>
        </div>
        <div class="flex items-center gap-2">
       
          <Button>Export</Button>
        </div>
      </div> -->
      <!-- <div class="flex flex-wrap items-center gap-5 pb-10">
        {#if NvrStorageData}
          {#each NvrStorageData as sd}
            <StorageNvrCard {sd} />
          {/each}
        {/if}
      </div> -->
    </section>
  {/if}
  {#if view === 2 && $selectedNvr}
    <div class="p-4">
      <div class="flex items-start justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2
            class="flex items-center font-medium text-xl text-[#323232] gap-2"
          >
            <button on:click={() => selectedNvr.set(null)}>
              <ArrowLeft size={20} />
            </button>
            {$selectedNvr.name}
          </h2>
          <span
            class={$selectedNvr?.status?.status === true
              ? "text-sm ml-5 text-black/.5 flex items-center text-[#03A185] gap-2"
              : "text-sm ml-5 text-black/.5 flex items-center text-[#B5496E] gap-2"}
          >
            {#if $selectedNvr?.status?.status === true}
              <span class="h-3 w-3 rounded-full bg-[#03A185]" /> Active
            {:else}
              <span class="h-3 w-3 rounded-full bg-[#B5496E]" /> Inactive
            {/if}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <!-- <Button variant="outline" class="flex items-center gap-2 text-sm"
            ><MapPin size={18} /> Location</Button
          > -->
          <Button>Export</Button>
        </div>
      </div>
      <div
        class="h-[calc(100vh-250px)] grid grid-cols-4 grid-rows-2 gap-4 w-full"
      >
        <div
          class="col-span-2 row-span-2 rounded-md border flex flex-col gap-2 p-2"
        >
          <span class="text-lg font-semibold">Device Information</span>
          <span class="grid grid-cols-3 grid-rows-3 gap-5 py-2">
            <span>
              <p class=" font-medium">Device Name</p>
              <p>{parseDetail($selectedNvr?.details, "Device Name")}</p>
            </span>
            <span>
              <p class="font-medium">Device Type</p>
              <p>{parseDetail($selectedNvr?.details, "Device Type")}</p>
            </span>
            <span>
              <p class="font-medium">Device Model</p>
              <p>{parseDetail($selectedNvr?.details, "Model")}</p>
            </span>
            <span>
              <p class="font-medium">Location</p>
              <p>{$selectedNvr?.expand?.ip_address?.location}</p>
            </span>
            <span>
              <p class="font-medium">Region</p>
              <p>{$selectedNvr?.expand?.ip_address?.region}</p>
            </span>
            <span>
              <p class="font-medium">Firmware version</p>
              <p>{parseDetail($selectedNvr?.details, "Firmware Version")}</p>
            </span>
            <span>
              <p class="font-medium">IP address</p>
              <p>{$selectedNvr?.expand?.ip_address?.query}</p>
            </span>
            <span>
              <p class="font-medium">Mac address</p>
              <p>{parseDetail($selectedNvr?.details, "MAC Address")}</p>
            </span>
            <span>
              <p class="font-medium">Storage usage</p>
              <p>Storage usage</p>
            </span>
          </span>
        </div>
        <div class="col-span-2 row-span-2 rounded-md border p-2">
          <div class="flex items-center justify-between pt-2">
            <p class="text-lg font-medium leading-5">Location</p>
            <span class="flex items-center gap-3">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 bg-[#03A185] rounded-full" /> Active</span
              >
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 bg-[#B5496E] rounded-full" /> Inactive</span
              >
            </span>
          </div>
          <div class="h-[95%] w-full">
            {#if $selectedNvr}
              <MapNvr NvrData={[$selectedNvr]} />
            {/if}
          </div>
        </div>
        <!-- <div class="col-span-2 row-span-1 rounded-md border p-2">
          <div class="flex items-center justify-between">
            <span class="text-lg font-medium">Usage Trend</span>
            <div class="flex items-center gap-2">
              <Select.Root>
                <Select.Trigger class="w-[180px]">
                  <Select.Value placeholder="Sort By: Area" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="population"
                    >Sort By: Population</Select.Item
                  >
                  <Select.Item value="density">Sort By: Density</Select.Item>
                  <Select.Item value="growth">Sort By:Growth Rate</Select.Item>
                </Select.Content>
              </Select.Root>
              <MoreVertical size={18} />
              <MoreVertical size={18} />
            </div>
          </div>
        </div> -->
      </div>
    </div>
  {/if}
</div>
