<script lang="ts">
  import DarkModeSwitch from "./../toggles/DarkModeSwitch.svelte";
  import type { User } from "@/types";
  import PocketBase from "pocketbase";
  import { page } from "$app/stores";
  import {
    User as UserIcon,
    LogOut,
    Radio,
    PlayCircle,
    Calendar,
    Image,
    SettingsIcon,
    RefreshCw,
    MessageCircleQuestion,
    ChevronDown,
    BellDot,
    Settings,
  } from "lucide-svelte";
  export let user: User;
  export let session;
  export let sessionId: string | undefined;
  import { addUserLog } from "@/lib/addUserLog";
  import { onDestroy, onMount } from "svelte";
  import NotificationDropdown from "../dropdown/NotificationDropdown.svelte";

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  let showNotifications: boolean = false;
  const menuList = [
    {
      text: "Live",
      href: `/session/${sessionId}`,
    },
    {
      text: "Playback",
      href: `/playback/${sessionId}`,
    },
    {
      text: "Analytics",
      href: `/analytics/${sessionId}`,
    },
    {
      text: "Users",
      href: `/users/${sessionId}`,
    },
    {
      text: "Settings",
      href: `/settings/${sessionId}`,
    },
  ];

  const menuListMob = [
    {
      text: "Live",
      href: `/session/${sessionId}`,
    },
    {
      text: "Playback",
      href: `/playback/${sessionId}`,
    },
    {
      text: "Events",
      href: `/events/${sessionId}`,
    },
    {
      text: "Reports",
      href: `/reports/${sessionId}`,
    },
    {
      text: "Configuration",
      href: `/configuration/${sessionId}`,
    },
  ];

  let isOpen = false;

  function toggleOpen() {
    isOpen = !isOpen;
    addUserLog("user clicked on user icon");
  }

  const getSession = async () => {
    const updatedSession = await PB.collection("session").getFullList({
      filter: `id="${user.session}"`,
    });
    return updatedSession;
  };

  onMount(async () => {
    PB.collection("session").subscribe("*", async (e) => {
      const check = await getSession();
      session = check[0];
    });
  });

  onDestroy(() => {
    PB.collection("session").unsubscribe("*");
  });

  // $: console.log(data)
</script>

<header class="sm:flex sticky top-0 left-0 w-full z-20 h-[75px]">
  <nav
    class="bg-gradient-to-r from-[#000610] via-[#000307] via-[#050E41] to-[#000307] w-full flex flex-row items-center justify-between"
  >
    <div class="flex w-full justify-between">
      <div
        class="cursor-pointer flex items-center gap-2 justify-start px-2 w-1/3"
      >
        <img src="/images/moksa.png" alt="logo" class="w-24 p-2" />
      </div>
      <div
        class={`flex flex-row items-center justify-center py-6 px-4 gap-16  w-1/3`}
      >
        {#each menuList as item}
          {#key item}
            <!-- {#if item.text === "Live" || item.text === "Playback" || item.text === "Settings"|| item.text === "Users" || item.text === ' Analytics'} -->
            <a
              href={item.href}
              on:click={() => {
                addUserLog(`user clicked on navbar link "${item.text}"`);
              }}
            >
              <span
                class={`${
                  $page.url.pathname === item.href.split("?")[0]
                    ? `text-[#07E1A4] font-bold text-lg cursor-pointer`
                    : " cursor-pointer text-white"
                }`}
              >
                {item.text}
              </span>
            </a>
            <!-- {:else}
            <button
            disabled
              on:click={() => {
                addUserLog(`user clicked on navbar link "${item.text}"`);
              }}
            >
             <span
                class={` cursor-not-allowed${
                  $page.url.pathname === item.href.split("?")[0]
                    ? `text-[#07E1A4] font-bold text-lg `
                    : " text-white"
                }`}
              >
                {item.text}
              </span>
            </button>
            {/if} -->
          {/key}
        {/each}
      </div>
      <div
        class="flex gap-3 pr-4 w-1/3 justify-end
            items-center"
      >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="flex items-center justify-center gap-3 cursor-pointer relative"
        >
          <DarkModeSwitch />
          <!-- <AddUserDialog> -->
          <span
            class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
            ><MessageCircleQuestion size={22} /></span
          >
          <!-- </AddUserDialog> -->
          <button
            on:click={() => (showNotifications = !showNotifications)}
            class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
            ><BellDot size={22} /></button
          >
          {#if showNotifications}
            <NotificationDropdown />
          {/if}
        </span>
        {#if user}
          <span class="flex items-center gap-2">
            <span
              class="rounded-md w-10 h-10 p-2 bg-[#3D81FC] flex items-center justify-center text-white"
            >
              <UserIcon size={18} />
            </span>
            <span class="flex flex-col gap-1">
              <p class="text-white font-medium capitalize">
                {user?.firstName}
                {user?.lastName}
              </p>
              <p class="text-white/[.6] text-sm">
                {user?.role}
              </p>
            </span>
            <button on:click={toggleOpen} class="text-white mb-auto mt-1">
              <ChevronDown size={22} />
            </button>
          </span>
        {/if}
        {#if isOpen}
          <div
            class="
                  absolute border right-6 top-14 -mr-0.5 mt-3 w-60 origin-top-right divide-y divide-gray-100 rounded-lg bg-background text-sm font-normal shadow-md ring-1 ring-slate-900/5 focus:outline-none sm:-mr-3.5 transform opacity-100 scale-100 z-[200]"
          >
            <span class="flex items-center px-2">
              <span
                class="rounded-md w-10 h-10 p-2 bg-[#3D81FC] flex items-center justify-center text-white"
              >
                <UserIcon size={18} />
              </span>
              <p class="truncate px-3.5 py-3 relative">
                <span class="block text-[#323232] font-medium capitalize">
                  {user?.firstName}
                  {user?.lastName}
                </span>
                <span class="mt-0.5 text-sm text-[#32323299]"
                  >{user?.email}</span
                >
                <a href="/account/{sessionId}" class="flex gap-1 items-center text-[#3D81FC] text-sm" >
                  <Settings size={16} />
                  Manage Account
                </a>
              </p>
            </span>

            <div
              class="px-6 py-3 bg-neutral-100 dark:hover:bg-gray-600 hover:cursor-pointer transition font-semibold relative z-[200]"
            >
              <a
                href="/logout"
                class="flex flex-row gap-2 items-center text-[#323232]"
              >
                <LogOut size={18} />
                Sign Out
              </a>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </nav>
</header>

<header
  class="flex sm:hidden fixed bottom-0 left-0 w-full z-40 backdrop-blur-lg"
  id="navMobile"
>
  <nav
    class="bg-[white] dark:bg-[#1e1f25] flex flex-row items-center justify-between px-4 w-full pb-2 rounded-t-xl"
  >
    {#each menuListMob as menu}
      <div
        class={$page.url.pathname === menu.href.split("?")[0]
          ? "-mt-6"
          : "-mt-2"}
      >
        <a href={menu.href}>
          <div class={`flex flex-col justify-center items-center pt-[8px] `}>
            <span
              class={`${
                $page.url.pathname === menu.href.split("?")[0]
                  ? "bg-white p-2 rounded-full"
                  : "bg-transparent"
              } `}
            >
              {#if menu.text === "Live"}
                <Radio
                  class={` h-[40px] w-[40px] p-2 ${
                    $page.url.pathname === menu.href.split("?")[0]
                      ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                      : "text-[#505050]"
                  }`}
                />
              {:else if menu.text === "Playback"}
                <PlayCircle
                  class={` h-[40px] w-[40px] p-2 ${
                    $page.url.pathname === menu.href.split("?")[0]
                      ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                      : "text-[#505050]"
                  }`}
                />
              {:else if menu.text === "Events"}
                <Calendar
                  class={` h-[40px] w-[40px] p-2 ${
                    $page.url.pathname === menu.href.split("?")[0]
                      ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                      : "text-[#505050]"
                  }`}
                />
              {:else if menu.text === "Gallery"}
                <Image
                  class={` h-[40px] w-[40px] p-2 ${
                    $page.url.pathname === menu.href.split("?")[0]
                      ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                      : "text-[#505050]"
                  }`}
                />
              {:else}
                <SettingsIcon
                  class={` h-[40px] w-[40px] p-2 ${
                    $page.url.pathname === menu.href.split("?")[0]
                      ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                      : "text-[#505050]"
                  }`}
                />
              {/if}
            </span>
            <span
              class={`text-[12px] font-medium ${
                $page.url.pathname === menu.href.split("?")[0]
                  ? "text-[#015a62]"
                  : "text-[#505050] dark:text-[rgba(255,255,255,.6)"
              }`}
            >
              {menu.text}
            </span>
          </div>
        </a>
      </div>
    {/each}
  </nav>
</header>
