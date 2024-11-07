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
  export let mToken: string | undefined;
  import { addUserLog } from "@/lib/addUserLog";
  import { onDestroy, onMount } from "svelte";
  import NotificationDropdown from "../dropdown/NotificationDropdown.svelte";
  import { io } from "socket.io-client";
  import { writable } from "svelte/store";
  import { toast } from "svelte-sonner";

  // $: console.log(user);

  // const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  const menuList =
    user.role === "Operators" || user.role === "adminNonPaid"
      ? [
          {
            text: "Live",
            href: `/session/${sessionId}`,
          },
          {
            text: "Playback",
            href: `/playback/${sessionId}`,
          },
          {
            text: "Settings",
            href: `/settings/${sessionId}`,
          },
        ]
      : [
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

  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);
  let allStores = [];
  const moksaUserId = user.moksaId;

  onMount(async () => {
    // console.log("mToken", mToken);
    const response = await fetch(
      "https://api.moksa.ai/store/getAllStoresForDropdown",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mToken}`,
          enableallstores: "true",
        },
      },
    );
    const res = await response.json();
    console.log("res", res);
    allStores = res?.data?.data;
    if (res?.data?.data?.length > 0) {
      setupSocketForAllStores();
    }
  });

  function setupSocketForAllStores() {
    allStores
      .filter((store: any) => store.id !== -1)
      .forEach((store: any) => {
        setupSocket(store.id);
      });
  }

  function setupSocket(storeId: number) {
    const userID = moksaUserId;
    if (sockets[storeId]) {
      sockets[storeId].disconnect();
    }

    sockets[storeId] = io("https://dev.api.moksa.ai/", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${mToken}`,
      },
      transports: ["websocket", "polling"],
    });

    const socket = sockets[storeId];

    socket.on("error", (err) => {
      console.log(`error for store ${storeId}:`, err);
    });

    socket.on("connect", () => {
      console.log(`connected for store theft in nav ${storeId}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`theft_store_${storeId}`, (data) => {
      console.log(`Received theft data for store ${storeId}:`, data);
      // toast(`Received theft data for store ${storeId}:`, {
      //   description: `Store: ${storeId}, Theft Probability: ${data?.theftProbability}, Camera: ${data?.camera_id}`,
      // });

      if ($liveData.length > 0) {
        liveData.update((currentData) => {
          return [...currentData, { ...data }];
        });
      } else {
        liveData.set(data);
      }

      // listtheft.update((currentData) => {
      //   const dataArray = Array.isArray(currentData) ? currentData : [];

      //   if (currentData && Array.isArray(currentData.data)) {
      //     return {
      //       ...currentData,
      //       data: [{ storeId, ...data, live: true }, ...currentData.data].slice(
      //         0,
      //         100,
      //       ),
      //     };
      //   }

      //   return [{ storeId, ...data, live: true }, ...dataArray].slice(0, 100);
      // });
      // return [storeId, ...dataArray].slice(0, 100);
    });

    socket.on("disconnect", () => {
      console.log(`disconnected for store ${storeId}`);
    });
  }

  onDestroy(() => {
    Object.values(sockets).forEach((socket) => {
      console.log("disconnecting socket");
      socket.disconnect();
    });
  });

  // const getSession = async () => {
  //   const updatedSession = await PB.collection("session").getFullList({
  //     filter: `id="${user.session}"`,
  //   });
  //   return updatedSession;
  // };

  // onMount(async () => {
  //   PB.collection("session").subscribe("*", async (e) => {
  //     const check = await getSession();
  //     session = check[0];
  //   });
  // });

  // onDestroy(() => {
  //   PB.collection("session").unsubscribe("*");
  // });

  let showNotifications: boolean = false;
  let notificationDropdownRef: HTMLElement;

  // $: console.log('user navbar',user)

  function handleClickOutside(event: MouseEvent) {
    if (
      showNotifications &&
      notificationDropdownRef &&
      !notificationDropdownRef.contains(event.target as Node)
    ) {
      showNotifications = false;
    }
  }

  onMount(() => {
    setTimeout(() => {
      document && document?.addEventListener("click", handleClickOutside);
    }, 2000);
  });

  onDestroy(() => {
    document?.removeEventListener("click", handleClickOutside);
  });

  function getProfilePicture(collectionId, recordId, fileName, size = "0x0") {
    return `http://${$page.url.hostname}:5555/api/files/_pb_users_auth_/${recordId}/${fileName}?thumb=${size}`;
  }

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
                isOpen = false;
                showNotifications = false;
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
          <a
            href="/tickets/{sessionId}"
            class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
            ><MessageCircleQuestion size={22} /></a
          >
          <!-- </AddUserDialog> -->
          <!-- on:click={() => (showNotifications = !showNotifications)} -->
          <button
            on:click|stopPropagation={() =>
              (showNotifications = !showNotifications)}
            class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
            ><BellDot size={22} /></button
          >
          <!-- {#if showNotifications}
            <NotificationDropdown />
          {/if} -->
          {#if showNotifications}
            <div bind:this={notificationDropdownRef}>
              <NotificationDropdown {liveData} />
            </div>
          {/if}
        </span>
        {#if user}
          <span class="flex items-center gap-2">
            {#if user?.avatar}
              <img
                src={getProfilePicture(user.collectionId, user.id, user.avatar)}
                alt="profile"
                class="w-10 h-10"
              />
            {:else}
              <span
                class="rounded-md w-10 h-10 p-2 bg-[#3D81FC] flex items-center justify-center text-white"
              >
                <UserIcon size={18} />
              </span>
            {/if}
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
              {#if user?.avatar}
                <img
                  src={getProfilePicture(
                    user.collectionId,
                    user.id,
                    user.avatar,
                  )}
                  alt="profile"
                  class="w-10 h-10"
                />
              {:else}
                <span
                  class="rounded-md w-10 h-10 p-2 bg-[#3D81FC] flex items-center justify-center text-white"
                >
                  <UserIcon size={18} />
                </span>
              {/if}
              <div class="truncate px-3.5 py-3 relative">
                <span
                  class="block text-[#323232] dark:text-white/[.7] font-medium capitalize"
                >
                  {user?.firstName}
                  {user?.lastName}
                </span>
                <span
                  class="mt-0.5 text-sm text-[#32323299] dark:text-white/[.7]"
                  >{user?.email}</span
                >
                <a
                  href="/account/{sessionId}"
                  class="flex gap-1 items-center text-[#3D81FC] text-sm"
                  on:click={() => {
                    isOpen = false;
                  }}
                >
                  <Settings size={16} />
                  Manage Account
                </a>
              </div>
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
