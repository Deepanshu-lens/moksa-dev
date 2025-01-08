<script lang="ts">
  import {
    BarChartBig,
    LineChart,
    HeartPulse,
    CalendarRange,
  } from "lucide-svelte";
  import Topbar from "@/components/reports/Topbar.svelte";
  import Analytics from "@/components/reports/Analytics.svelte";
  import Access from "@/components/reports/Access.svelte";
  import Parking from "@/components/reports/Parking.svelte";
  import Reports from "@/components/reports/Reports.svelte";
  import Health from "@/components/reports/Health.svelte";
  import type { Node } from "@/types.d.ts";
  import { selectedNode, user } from "@/stores";
  import { writable } from "svelte/store";
  import { addUserLogs } from "@/lib/logs/userLogs";
  import EventsManagement from "@/components/reports/EventsManagement.svelte";
  import StorageStatsDashboard from "@/components/reports/StorageStatsDashboard.svelte";

  let selectedScreen = writable(7);
  export let data: any;
  let nodes: Node[] = [];

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
            addUserLogs(
              "User selected option Analytics for reports",
              $user?.email || "",
              $user?.id || ""
            );
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
            addUserLogs(
              "User selected option Reports for reports",
              $user?.email || "",
              $user?.id || ""
            );
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
            addUserLogs(
              "User selected option Access Control for reports",
              $user?.email || "",
              $user?.id || ""
            );
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
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => {
            addUserLogs(
              "User selected option Access Control for reports",
              $user?.email || "",
              $user?.id || ""
            );
            handleChangeTab(6);
          }}
          class={$selectedScreen !== 6
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><CalendarRange class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`text-xs ${$selectedScreen !== 6 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Events
        </p>
      </span>
      <span class="group flex items-center justify-center gap-0.5 flex-col">
        <button
          on:click={() => {
            addUserLogs(
              "User selected option Access Control for reports",
              $user?.email || "",
              $user?.id || ""
            );
            handleChangeTab(7);
          }}
          class={$selectedScreen !== 7
            ? `text-[#727272]/90 h-[40px] w-[40px] rounded-full   border border-solid border-[#727272]/90 dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
            : `relative border-none rounded-full  h-[40px] w-[40px] text-white bg-[linear-gradient(90deg,#113046_0%,#2B6365_100%)] grid place-items-center dark:bg-[#258d9d]`}
          ><CalendarRange class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`text-xs ${$selectedScreen !== 7 ? "group-hover:text-[#015a62] text-[#727272]/90 dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d]  text-[#015a62]"}`}
        >
          Playback
        </p>
      </span>
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
    {#if $selectedScreen === 6}
      <EventsManagement />
    {/if}
    {#if $selectedScreen === 7}
      <StorageStatsDashboard />
    {/if}
  </section>
</main>
