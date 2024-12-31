<script lang="ts">
  import {
    BarChartBig,
    KeyRound,
    CarFront,
    LineChart,
    HeartPulse,
    ParkingMeter,
    Lock,
  } from "lucide-svelte";
  import Topbar from "@/components/reports/Topbar.svelte";
  import Analytics from "@/components/reports/Analytics.svelte";
  import Access from "@/components/reports/Access.svelte";
  import Parking from "@/components/reports/Parking.svelte";
  import Reports from "@/components/reports/Reports.svelte";
  import Health from "@/components/reports/Health.svelte";
  import type { Node, Camera, Event } from "@/types.d.ts";
  import { selectedNode } from "@/stores";
  import { writable } from "svelte/store";

  let selectedScreen = writable(1);
  export let data: any;
  let nodes: Node[] = [];

  //   async function getNodes(): Promise<Node[]> {
  //     if (session?.node.length > 0) {
  //       const nodes = await PB.collection("node").getFullList(200, {
  //         sort: "created",
  //         expand: "camera",
  //         filter: `session~"${session.id}"`,
  //       });
  //       console.log("getnodes", nodes);
  //       return nodes.map(
  //         (node) =>
  //           ({
  //             ...node,
  //             session: session.id,
  //             camera:
  //               node.camera.length > 0
  //                 ? (node.expand.camera.reverse().map((cam: Camera) => ({
  //                     name: cam.name,
  //                     id: cam.id,
  //                     url: cam.url,
  //                     subUrl: cam.subUrl,
  //                     save: cam.save,
  //                     face: cam.face,
  //                     vehicle: cam.vehicle,
  //                     faceDetThresh: cam.faceDetThresh,
  //                     faceMatchThresh: cam.faceMatchThresh,
  //                     vehicleDetThresh: cam.vehicleDetThresh,
  //                     vehiclePlateThresh: cam.vehiclePlateThresh,
  //                     vehicleOCRThresho: cam.vehicleOCRThresh,
  //                     saveFolder: cam.saveFolder,
  //                     saveDuration: cam.saveDuration,
  //                     motionThresh: cam.motionThresh,
  //                     priority: cam.priority,
  //                   })) as Camera[])
  //                 : [],
  //           }) as unknown as Node
  //       );
  //     }
  //     return [];
  //   }

  //   onMount(async () => {
  //     nodes = await getNodes();
  //     selectedNode.set(nodes[0]);

  //     PB.collection("camera").subscribe("*", async (e) => {
  //       nodes = await getNodes();
  //       selectedNode.set(nodes[0]);
  //     });

  //     PB.collection("node").subscribe("*", async (e) => {
  //       nodes = await getNodes();
  //       selectedNode.set(nodes[0]);
  //     });
  //   });

  //   onDestroy(() => {
  //     PB.collection("node").unsubscribe("*");
  //     PB.collection("camera").unsubscribe("*");
  //   });

  const handleChangeTab = (tab: number) => {
    selectedScreen.set(tab);
  };
</script>

<main
  class="flex items-start flex-row-reverse px-4 w-full h-[calc(100vh-75px)]"
>
  <section
    class="left flex flex-col justify-center items-center h-[calc(100vh-75px)]"
  >
    <div class="flex flex-col gap-6 items-center justify-center pl-2">
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => {
            handleChangeTab(1);
          }}
          class={$selectedScreen !== 1
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><LineChart class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`text-xs ${$selectedScreen !== 1 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Analytics
        </p>
      </span>
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => {
            handleChangeTab(2);
          }}
          class={$selectedScreen !== 2
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><BarChartBig class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`text-xs ${$selectedScreen !== 2 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Reports
        </p>
      </span>
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => {
            handleChangeTab(5);
          }}
          class={$selectedScreen !== 5
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><HeartPulse class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`text-xs ${$selectedScreen !== 3 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Health
        </p>
      </span>
      <!-- <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => handleChangeTab(3)}
          class={$selectedScreen !== 3
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
        >
          {#if $selectedScreen !== 3}
            <img
              src="/images/access.png"
              alt="access"
              class="h-[25px] w-[25px]"
            />
          {:else}
            <img
              src="/images/acces_dark.png"
              alt="access"
              class="h-[25px] w-[25px]"
            />
          {/if}
        </button>
        <p
          class={`text-xs ${$selectedScreen !== 3 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Access
        </p>
      </span>
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => handleChangeTab(4)}
          class={$selectedScreen !== 4
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
        >
          {#if $selectedScreen === 4}
            <img
              src="/images/parking.png"
              alt="parking"
              class="h-[25px] w-[25px]"
            />
          {:else}
            <img
              src="/images/parking_light.png"
              alt="parking"
              class="h-[25px] w-[25px]"
            />
          {/if}
        </button>
        <p
          class={`text-xs ${$selectedScreen !== 4 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Parking
        </p>
      </span>

      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => handleChangeTab(5)}
          class={$selectedScreen !== 5
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><HeartPulse class="h-[22px] w-[22px]" />
        </button>
        <p
          class={`text-xs ${$selectedScreen !== 5 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Health
        </p>
      </span> -->
    </div>
  </section>
  <section class="right w-full h-full">
    {#if $selectedScreen !== 5}
    <Topbar selectedScreen={$selectedScreen} />
    {/if}
    {#if $selectedScreen === 1}
      <Analytics />
    {/if}
    {#if $selectedScreen === 2}
      <Reports />
    {/if}
    {#if $selectedScreen === 3}
      <div class="overflow-y-scroll max-h-[calc(100vh-160px)]">
        <Access />
      </div>
    {/if}
    {#if $selectedScreen === 4}
      <div class="overflow-y-scroll max-h-[calc(100vh-160px)]">
        <Parking />
      </div>
    {/if}
    {#if $selectedScreen === 5 && $selectedNode}
      <Health {data} {nodes} />
    {/if}
  </section>
</main>
