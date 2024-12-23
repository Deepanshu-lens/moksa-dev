<script>
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
    Trash,
    TrendingUp,
    User,
    WebcamIcon,
  } from "lucide-svelte";
  import Button from "../ui/button/button.svelte";
  import { selectedNode } from "@/stores";
  import { MoreVertical } from "lucide-svelte";
  import * as Table from "@/components/ui/table/index";
  import * as Select from "@/components/ui/select/index";
  import HealthNvrcard from "../cards/HealthNvrcard.svelte";
  import { onMount } from "svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
  import MapNvr from "../map/MapNvr.svelte";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  export let data;
  export let nodes;
  let selectedNvr = writable(null);
  let cameraList = [];

  let view = 1;

  import AreaAnalysis from "./charts/AreaAnalysis.svelte";
  import { Input } from "../ui/input";
  import StorageNvrCard from "../cards/StorageNvrCard.svelte";
  import Doughnut from "./charts/Doughnut.svelte";
  import pb from "@/lib/pb";
  import { writable } from "svelte/store";

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
      NvrData = await pb.collection("nvr").getFullList({
        filter: `node~"${$selectedNode?.id}"`,
        sort: "-created",
        expand: "ip_address",
      });
      for (let i = 0; i < NvrData.length; i++) {
        const nvr = NvrData[i];
        const status = await pb.collection("nvr_ping_status").getFirstListItem(
          `nvr="${nvr.id}"`,
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
      NvrStorageData = await pb.collection("nvr_storage").getFullList({
        filter: `node~"${$selectedNode.id}"`,
        sort: "-created",
        expand: `nvr`,
      });

      NvrStorageData.forEach((storage) => {
        totalCapacity += storage.capacity / 1024 / 1024; // Convert MB to pb
        totalFreeSpace += storage.free_space / 1024 / 1024;
      });
    }
  }

  async function getCameraList() {
    try {
      pb.autoCancellation(false);
      // console.log("cameralist get inside try");
      const res = await pb.collection("camera_ping_status").getList(1, 100, {
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

  //   pb.collection("nvr_ping_status").subscribe("*", async (e) => {
  //     console.log(e.action);
  //     if (e.action === "create") {
  //       // fetchNvrData();
  //     }
  //   });
  //   pb.collection("camera_ping_status").subscribe("*", async (e) => {
  //     console.log(e.action);
  //     if (e.action === "create") {
  //       // cameraList = await getCameraList();
  //     }
  //   });
  // });

  // onDestroy(() => {
  //   pb.collection("nvr_ping_status").unsubscribe("*");
  //   pb.collection("camera_ping_status").unsubscribe("*");
  // });

  // $: $selectedNode, fetchNvrData(), getNvrStorageData();

  $: if ($selectedNode) {
    fetchData();
  }

  async function fetchData() {
    activeNvr = 0;
    inactiveNvr = 0;
    totalCapacity = 0
    totalFreeSpace = 0
    // await fetchNvrData();
    // await getNvrStorageData();
    // await getCameraList();
    await Promise.all([
    fetchNvrData(),
    getNvrStorageData(),
    getCameraList()
  ]);
  }

  function parseDetail(detailString, key) {
    const lines = detailString.split("\n");
    const line = lines.find((line) => line.startsWith(key));
    if (line) {
      return line.split(": ")[1];
    }
    return "Not available";
  }

</script>

<div class="w-full h-[calc(100vh-75px)]">
  <div
    class="flex items-center justify-center rounded-lg border-black/[.13] dark:border-white/[.13] border-solid border-[1px] p-1 w-[500px] h-[40px] mx-auto my-4"
  >
    <button
      on:click={() => (view = 1)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 1 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
      >Cameras</button
    >
    <button
      on:click={() => (view = 2)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 2 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
      >NVR</button
    >
    <button
      on:click={() => (view = 3)}
      class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/3 h-full ${view === 3 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
      >Hard Disk</button
    >
  </div>
  {#if view === 1}
    <section
      class="flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar pb-10"
    >
      <div class="flex items-center justify-between p-4 z-[100]">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232] dark:text-slate-200">
            Health Monitor
          </h2>
          <h5 class="text-sm text-black/[.5] dark:text-white/[.5]">
            Streamlined insights into your device's vital stats for informed
            decisions.
          </h5>
        </div>
        <div class="flex items-center gap-2 z-[100]">
          <!-- <Button variant="outline" class="flex items-center gap-2 text-sm"
          ><MapPin size={18} /> Location</Button
        > -->
          <NodeSelection
            isAllFullScreen={false}
            {nodes}
            url={data.url ?? "/"}
            {data}
          />
          <!-- <Button>Export</Button> -->
        </div>
      </div>
      <div class="grid grid-cols-8 grid-rows-2 h-[320px] 2xl:h-[500px] gap-4 px-4">
        <div
          class="gap-4 col-span-2 row-span-2 grid grid-rows-2 grid-cols-1 rounded-md"
        >
          <div
            class="border col-span-2 row-span-2 grid grid-cols-3 p-2 rounded-md"
          >
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
                  <span class="h-2 w-2 rounded-full bg-[#5B93FF]" /> <strong>{activeCams}</strong> Active</span
                >
                <span class="flex items-center gap-1 text-sm"
                  ><span class="h-2 w-2 rounded-full bg-[#FFD66B]" /><strong>{inactiveCams}</strong> Inactive</span
                >
              </span>
            </span>
            <span class="col-span-3 row-span-1 relative  grid place-items-center">
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
              >{#if delayedFlag}<Doughnut2 critical={6} nonCritical={5} /><span
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
            {:else}
              <div class="w-full h-full grid place-items-center">
                <Spinner />
              </div>
            {/if}
          </div>
        </div>
        <div class=" col-span-3 row-span-2 border p-2 rounded-md overflow-clip">
          <div class="flex items-center justify-between mb-8">
            <span class="text-lg font-medium">Area Analysis</span>
            <div class="flex items-center gap-2">
              <Select.Root>
                <Select.Trigger class="w-[180px] focus:ring-0">
                  <Select.Value placeholder="Sort By: Area" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="population">Sort By: Population</Select.Item
                >
                <Select.Item value="density">Sort By: Density</Select.Item>
                <Select.Item value="growth">Sort By:Growth Rate</Select.Item>
                </Select.Content>
              </Select.Root>
              <MoreVertical size={18} />
            </div>
          </div>
          {#if NvrData && uniqueCams && delayedFlag}
            <AreaAnalysis {NvrData} {uniqueCams} />
            {:else}
            <div class="w-full h-full grid place-items-center">
              <Spinner />
            </div>
          {/if}
        </div>
      </div>
      <div class="h-full w-full p-4 flex flex-col gap-2">
        <p class="font-medium text-lg">List of Cameras</p>
        <Table.Root class="mx-auto w-full flex flex-col pb-10">
          <Table.Header
            class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9] dark:bg-black"
          >
            <Table.Row
              class="bg-transparent flex items-center justify-between p-3 w-full"
            >
              <Table.Head
                class="text-[#727272] h-full w-[10%] dark:text-slate-50"
                >ID</Table.Head
              >
              <Table.Head
                class="text-[#727272]  h-full w-[12%] dark:text-slate-50"
                >Name</Table.Head
              >
              <Table.Head
                class="text-[#727272]  h-full w-[12%] dark:text-slate-50"
                >Severity</Table.Head
              >
              <Table.Head
                class="text-[#727272]  h-full w-[12%] dark:text-slate-50"
                >Downtime</Table.Head
              >
              <Table.Head
                class="text-[#727272]  h-full w-[12%] dark:text-slate-50"
                >Status</Table.Head
              >
              <Table.Head
                class="text-[#727272]  h-full w-[12%] dark:text-slate-50"
                >Exiting alert</Table.Head
              >
              <Table.Head
                class="text-[#727272] text-center  pr-0 h-full w-[20%] dark:text-slate-50"
                >Actions</Table.Head
              >
            </Table.Row>
          </Table.Header>
          {#if cameraList && delayedFlag}
          <Table.Body>
            {#each cameraList as item, index}
              <Row {item} {index} />
            {/each}
          </Table.Body>
          {:else}
          <div class="h-full w-full grid place-items-center mt-10">
            <Spinner/>
            </div>
          {/if}
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
        <div class="flex items-center gap-2 z-[100]">
          <NodeSelection
            isAllFullScreen={false}
            {nodes}
            url={data.url ?? "/"}
            {data}
          />
          <!-- <Button>Export</Button> -->
        </div>
      </div>
      <div class="grid grid-cols-8 grid-rows-2 h-[320px]  2xl:h-[500px] gap-4 px-4">
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
                  <span class="h-2 w-2 rounded-full bg-[#5B93FF]" /><strong>{activeNvr}</strong> Active</span
                >
                <span class="flex items-center gap-1"
                  ><span class="h-2 w-2 rounded-full bg-[#FFD66B]" />
                <strong>{inactiveNvr}</strong> Inactive</span
                >
              </span>
            </span>
            <span class="col-span-3 row-span-1 relative  grid place-items-center"
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
                  <Select.Item value="population">Sort By: Population</Select.Item
                >
                  <Select.Item value="density">Sort By: Density</Select.Item>
                  <Select.Item value="growth">Sort By:Growth Rate</Select.Item>
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
        <div class="flex items-center gap-2 z-100">
          <NodeSelection
            isAllFullScreen={false}
            {nodes}
            url={data.url ?? "/"}
            {data}
          />
          <Button>Export</Button>
        </div>
      </div>
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
        </div> </div>
      <div class="flex items-center justify-between p-4">
        <div class="left flex flex-col gap-1">
          <h2 class="font-medium text-xl text-[#323232]">Storage per NVR</h2>
        </div>
        <div class="flex items-center gap-2">
          <!-- <Button variant="ghost" class="flex items-center gap-2 text-sm"
            ><MapPin size={18} /> Location</Button
          > -->
          <!-- <Button>Export</Button> -->
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-5 pb-10">
        {#if NvrStorageData}
          {#each NvrStorageData as sd}
            <StorageNvrCard {sd} />
          {/each}
        {/if}
      </div>
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
      
      </div>
    </div>
  {/if}
</div>
