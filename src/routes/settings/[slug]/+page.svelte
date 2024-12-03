<script lang="ts">
  import AddDevice from "../../../components/configuration/mobile/AddDevice.svelte";
  import PocketBase from "pocketbase";
  import type { PageServerData } from "./$types";
  import { getContext, onDestroy, onMount } from "svelte";
  import ConfigPanel from "./../../../components/configuration/ConfigPanel.svelte";
  import type { Node, User, Camera } from "@/types";
  import { selectedNode } from "@/lib/stores";
  import { ChevronLeft, ChevronRight } from "lucide-svelte";
  import Configuration from "@/components/configuration/mobile/Configuration.svelte";
  import Subscription from "@/components/configuration/mobile/Subscription.svelte";
  import ContactUs from "@/components/configuration/mobile/ContactUs.svelte";
  import HelpCenter from "@/components/configuration/mobile/HelpCenter.svelte";
  import About from "@/components/configuration/mobile/About.svelte";
  import Logout from "@/components/configuration/mobile/Logout.svelte";
  import { writable } from "svelte/store";
  import { page } from "$app/stores";
  const user: User = getContext("user");
  export let data: PageServerData;
  const { session } = data;
  const { features } = data.user;
  let nodes: Node[] = [];

  let activeSec = writable<null | number>(null);
  const PB = new PocketBase(`https://server.moksa.ai`);

  async function getNodes(): Promise<Node[]> {
    if (session?.node.length > 0) {
      PB.autoCancellation(false);
      const nodes = await PB.collection("node").getFullList(200, {
        sort: "created",
        filter: `session~"${session.id}"`,
      });

      for (const node of nodes) {
        const cameras = await PB.collection("camera").getFullList({
          filter: `node~"${node.id}"`,
          sort: "-created",
        });
        node.camera = cameras.map((cam: Camera) => ({
          ...cam,
        }));
      }

      return nodes.map(
        (node) =>
          ({
            ...node,
            session: session.id,
          }) as Node,
      );
    }
    return [];
  }

  const menuList = [
    {
      text: "Add Device",
      icon: "/assets/vms/device-imac-plus1.svg",
      iconS: "/assets/vms/device-imac-plus2.svg",
    },
    {
      text: "Configuration",
      icon: "/assets/vms/configure1.svg",
      iconS: "/assets/vms/configure2.svg",
    },
    {
      text: "Subscription",
      icon: "/assets/vms/subscriptions1.svg",
      iconS: "/assets/vms/subscriptions2.svg",
    },
    {
      text: "Contact Us",
      icon: "/assets/vms/perm-contact-calendar-sharp1.svg",
      iconS: "/assets/vms/perm-contact-calendar-sharp2.svg",
    },
    {
      text: "Help Centre",
      icon: "/assets/vms/help-outline1.svg",
      iconS: "/assets/vms/help-outline2.svg",
    },
    {
      text: "About",
      icon: "/assets/vms/about-circle-outline1.svg",
      iconS: "/assets/vms/about-circle-outline2.svg",
    },
    {
      text: "Log Out",
      icon: "/assets/vms/log-out1.svg",
      iconS: "/assets/vms/log-out2.svg",
    },
  ];

  onMount(async () => {
    nodes = await getNodes();
    selectedNode.set(nodes[0]);
  });
</script>

<!-- desktop -->
<main
  class="hidden sm:flex items-start justify-between w-full overflow-y-hidden min-h-[calc(100vh-75px)]"
>
  <!-- Main container -->
  <ConfigPanel
    {user}
    records={data.records}
    logs={data.logs}
    sessionId={data.session.id}
    {data}
    {nodes}
  />
</main>

<!-- mob -->
<main class="flex sm:hidden w-full bg-[#F5F6F7] h-screen z-10 relative">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="top-config w-full">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      class="flex items-center justify-start text-black/[.7] pt-4"
      on:click={() => {
        window.location.href = `/session/${$selectedNode.session}`;
      }}
    >
      <ChevronLeft class="h-[30px] w-[30px]" />
      <p class="text-lg font-semibold">Settings</p>
    </span>
    <div class="user-details flex flex-row items-center py-4 px-4 w-full">
      <span
        class="rounded-full bg-[#015a62] text-white font-medium text-base h-[48px] w-[48px] mr-4 capitalize grid place-items-center"
      >
        {data?.user && data?.user?.name.split("")[0]}
      </span>
      <span class="flex flex-col">
        <p class="text-lg font-medium text-[#212836] capitalize">
          {data?.user && data.user.firstName}
          {data?.user && data.user.lastName}
        </p>
        <p class="text-xs text-[#919eab] leading-[16px] flex gap-1">
          Logged in via:
          <span class="text-black/[.7]">{data?.user && data.user.email}</span>
        </p>
      </span>
      <button
        class="rounded-[25px] bg-[rgb(189,189,189)]/[.2] px-[10px] pt-[2px] text-sm text-[#637381] ml-auto mr-4"
      >
        Edit
      </button>
    </div>
    <div class="flex flex-col items-center w-full gap-[15px] my-[15px]">
      {#each menuList as menu, index}
        {@const isLastItem = index === menuList.length - 1}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          on:click={() => {
            $activeSec = index;
          }}
          class={` flex flex-row items-center w-[349px] scale-95 sm:scale-100 h-[45px] sm:h-[50px] px-[19px] py-[13px] rounded-[8px] border-b-[1px] border-solid ${
            $activeSec === index
              ? "border-[#015a62] bg-[#015a62]/[.13]"
              : " border-[#e0e0e0]"
          }`}
        >
          <img
            alt={menu.text}
            src={$activeSec === index ? menu.iconS : menu.icon}
            height={24}
            width={24}
            class="h-[24px] w-[24px] mr-6 aspect-square"
          />
          <p
            class={`text-base font-medium ${
              $activeSec === index ? "text-[#015A62]" : "text-[#919eab]"
            }`}
          >
            {menu.text}
          </p>
          {#if !isLastItem}
            <ChevronRight class="ml-auto h-[26px] w-[26px]" />
          {/if}
        </span>
      {/each}
    </div>
    {#if $activeSec === 0}
      <div class="z-30 absolute top-0 left-0">
        <AddDevice bind:activeSec={$activeSec} />
      </div>
    {/if}
    {#if $activeSec === 1}
      <div class="z-30 absolute top-0 left-0">
        <Configuration
          bind:activeSec={$activeSec}
          userData={data}
          {user}
          records={data.records}
        />
      </div>
    {/if}
    {#if $activeSec === 2}
      <div class="z-30 absolute top-0 left-0">
        <Subscription bind:activeSec={$activeSec} />
      </div>
    {/if}
    {#if $activeSec === 3}
      <div class="z-30 absolute top-0 left-0">
        <ContactUs bind:activeSec={$activeSec} />
      </div>
    {/if}
    {#if $activeSec === 4}
      <div class="z-30 absolute top-0 left-0">
        <HelpCenter bind:activeSec={$activeSec} />
      </div>
    {/if}
    {#if $activeSec === 5}
      <div class="z-30 absolute top-0 left-0">
        <About bind:activeSec={$activeSec} />
      </div>
    {/if}
    {#if $activeSec === 6}
      <div class="z-30 absolute top-0 left-0">
        <Logout bind:activeSec={$activeSec} />
      </div>
    {/if}
  </div>
</main>
