<script lang="ts">
  import { addUserLogs } from "@/lib/logs/userLogs";
  import { cn } from "@/lib/utils";
  import { user } from "@/stores";
  import Icon from "@iconify/svelte";
  import { BellDot, MessageCircleQuestion } from "lucide-svelte";
  import * as Popover from "@/components/ui/popover/index.js";
  import Button from "../ui/button/button.svelte";
  import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import NotificationCard from "../cards/NotificationCard.svelte";
  export let moksa;
  let currentPath = window.location.pathname;
  if (window.api) {
    const pathSegments = currentPath.split("/");
    const fileName = pathSegments[pathSegments.length - 1];

    // Remove the ".html" extension if it exists
    currentPath = "/" + fileName.replace(".html", "");
    if (currentPath === "/index") currentPath = "/";
  }

  // Function to check if the link is active
  let isActive: (href: string) => boolean;
  $: isActive = (href: string) => {
    return currentPath === href;
  };

  let data = [
    { name: "Live", link: "/", icon: "live-icon" },
    { name: "Analytics", link: "/analytics", icon: "playback-icon" },
    { name: "Users", link: "/users", icon: "playback-icon" },
    {
      name: "Settings",
      link: "/settings?section=Camera",
      icon: "playback-icon",
    },
  ];

  const disabledPaths: string[] = [];
  export let isVertical = false;
  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);
  let allStores = [];
  const moksaUserId = moksa?.user?.moksaId;

  const getTheftNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/notification/getAllUnreadNotificationsByUserId/${moksaUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${moksa?.token}`,
          },
        }
      );
      const data = await response.json();
      if (!!data?.data) {
        liveData.set(data?.data);
      } else {
        liveData.set([]);
      }
    } catch (error) {
      console.log(error, "error");
      toast.error("Error fetching theft notifications");
    }
  };

  onMount(async () => {
    // console.log("moksa?.token", moksa?.token);
    const response = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/store/getAllStoresForDropdown`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${moksa?.token}`,
          enableallstores: "true",
        },
      }
    );
    const res = await response.json();
    console.log("res", res);
    allStores = res?.data?.data;
    if (res?.data?.data?.length > 0) {
      setupSocketForAllStores();
    }

    getTheftNotifications();
  });

  function setupSocketForAllStores() {
    allStores.forEach((store: any) => {
      setupSocket(store.id);
    });
  }

  function setupSocket(storeId: number) {
    let userID = moksaUserId;
    if (user?.role === "superAdmin") {
      userID = -1;
    }

    if (sockets[storeId]) {
      sockets[storeId].disconnect();
    }

    sockets[storeId] = io(`${import.meta.env.PUBLIC_MOKSA_BASE_URL}/`, {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${moksa?.token}`,
      },
      transports: ["websocket", "polling"],
    });

    const socket = sockets[storeId];

    socket.on("error", (err) => {
      console.log(`error for store ${storeId}:`, err);
    });

    socket.on("connect", () => {
      console.log(`connected for notification in pagebar (navbar) ${userID}`);
      socket.emit("joinUser", userID);
      socket.emit("joinStore", storeId);
    });

    socket.on(`notification_${userID}`, (data) => {
      console.log(`Received notification data for store ${userID}:`, data);

      if ($liveData?.length > 0) {
        liveData.update((currentData) => {
          let istheftId = currentData.some(
            (item: any) => item.theft_id === data?.theft_id
          );
          if (!istheftId) {
            toast.warning("theft detected!");
            let newData = [...currentData];
            newData.unshift(data);
            return newData;
          } else {
            return currentData;
          }
        });
      } else {
        liveData.set([data]);
      }
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

</script>

<div
  class={isVertical
    ? "flex flex-col items-center space-y-12 "
    : "flex justify-center space-x-6 w-full relative"}
>
  <nav class="hidden md:flex space-x-4">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    {#each data as link}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_missing_attribute -->
      <a
        on:click={async (e) => {
          if (disabledPaths.includes(link.link)) {
            e.preventDefault();
            return;
          }
          await addUserLogs(
            `User visited ${link?.name} page`,
            $user?.email || "",
            $user?.id || ""
          );
          currentPath = link.link;
          if (window.api) {
            if (link.link === "/") {
              window.api.navigate("/index");
            } else {
              window.api.navigate(link.link);
            }
          } else {
            window.location.href = link.link;
          }
        }}
        class={cn(
          "text-sm transition-all px-3 py-2 rounded-md cursor-pointer",
          isActive(link.link)
            ? "font-medium bg-gray-200 text-black"
            : "font-normal hover:bg-gray-100 hover:text-black text-white",
          disabledPaths.includes(link.link) && "cursor-not-allowed opacity-50"
        )}
      >
        <Icon icon={link.icon} width="24" height="24" />
        <span>{link.name}</span>
      </a>
    {/each}

    <div class="absolute right-5 flex items-center gap-x-4">
      <!-- Raise Question -->
      <span>
        <a
          href={`/tickets`}
          class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
          ><MessageCircleQuestion size={22} /></a
        >
      </span>
      <!-- notification dropdown -->
      <Popover.Root>
        <Popover.Trigger asChild let:builder>
          <Button
            builders={[builder]}
            variant="outline"
            class="bg-[#061149] size-[40px] grid place-items-center rounded-md p-1 border border-white/[.08] text-white hover:bg-white hover:text-black hover:dark:text-white hover:dark:bg-[#272727]"
            ><BellDot size={22} /></Button
          >
        </Popover.Trigger>
        <Popover.Content class="w-auto px-2 py-3">
          <article
            class="gap-2 bg-white rounded-lg dropdown-shadow w-[340px] flex flex-col max-h-[450px] overflow-y-auto overflow-h-auto"
          >
            {#if $liveData.length === 0}
              <p class="text-center text-gray-500">No notifications yet</p>
            {:else}
              {#each $liveData as notification}
                <NotificationCard {notification} />
              {/each}
            {/if}
          </article>
        </Popover.Content>
      </Popover.Root>
    </div>
  </nav>
</div>
