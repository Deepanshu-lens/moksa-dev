<script lang="ts">
  import AddNode from "@/components/node/AddNode.svelte";
  import type { Node, Camera, Event } from "@/types.d.ts";
  import StreamView from "@/components/stream/StreamView.svelte";
  import PocketBase from "pocketbase";
  import { selectedNode, events } from "@/lib/stores";
  import { onDestroy, onMount } from "svelte";
  import AddNodeMob from "@/components/node/mobile/AddNodeMob.svelte";
  import type { PageServerData } from "./$types";
  import { page } from "$app/stores";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import { io } from "socket.io-client";
  import { writable } from "svelte/store";
  import { toast } from "svelte-sonner";
  // import { browser } from "$app/environment";

  export let data: PageServerData;
  console.log("data", data);
  const { session } = data;
  const { user } = data;
  const moksaUserId = data.user.moksaId;
  const allStores = data.stores === [] ? [] : data.stores?.data?.data;
  const moksaEvents = data.moksaEvents;
  let nodes: Node[] = [];
  let batchedEvents: Event[] = [];
  let searching: boolean = true;

  let sockets: { [key: number]: any } = {};
  let liveData = writable([]);
  // $: console.log("data", data);

  const PB = new PocketBase(`https://server.moksa.ai`);

  // $: if (browser) {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   const message = urlParams.get("message");
  //   console.log('message',message)
  //   if (message) {
  //     toast.error(`${message}`);
  //     setTimeout(() => {
  //       const newUrl = window.location.pathname;
  //       window.history.pushState({ path: newUrl }, "", newUrl);
  //     }, 2000);
  //   }
  // }

  const token = data.token;

  function setupSocket(userId: number) {
    if (sockets[userId]) {
      sockets[userId].disconnect();
    }
    // console.log(token)
    sockets[userId] = io("https://api.moksa.ai", {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    const socket = sockets[userId];

    socket.on("error", (err) => {
      console.log(`error for user ${userId}:`, err);
    });

    socket.on("connect", () => {
      console.log(`connected for user ${userId}`);
      socket.emit("joinUser", userId);
    });

    socket.on(`notification_${userId}`, (data) => {
      console.log(`Received notification for user ${userId}:`, data);
      toast.info(`Recieved notification for user! `);
    });

    socket.on("disconnect", () => {
      console.log(`disconnected for store ${userId}`);
    });
  }

  onMount(() => {
    setTimeout(() => {
      if (data.token !== undefined) {
        const userId = moksaUserId;
        setupSocket(userId);
      }
    }, 500);
  });

  onDestroy(() => {
    Object.values(sockets).forEach((socket) => {
      console.log("disconnecting socket");
      socket.disconnect();
    });
  });

  async function getNodes(): Promise<Node[]> {
    if (session?.node.length > 0) {
      try {
        const response = await fetch(
          `/api/node/getNodes?sessionId=${session.id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch nodes");
        }
        const nodes = await response.json();
        console.log("nodes", nodes);
        return nodes;
      } catch (error) {
        console.error("Error fetching nodes:", error);
        return [];
      }
    }
    return [];
  }

  function updateEvents() {
    events.update((currentEvents) => {
      if (batchedEvents.length !== currentEvents.length) {
        const updatedEvents = [...batchedEvents, ...currentEvents].slice(
          0,
          200,
        );
        batchedEvents = [];
        return updatedEvents;
      }
      return currentEvents;
    });
    setTimeout(updateEvents, 1000);
  }

  onMount(async () => {
    PB.autoCancellation(false);
    nodes = await getNodes();
    console.log(nodes);
    const s = nodes.find((n) => n.id === session.activeNode);
    if (s) {
      selectedNode.set(s);
    } else {
      selectedNode.set(nodes[0]);
    }
    searching = false;
    events.set(data.moksaEvents);

    // PB.collection("events").subscribe("*", function (e) {
    //   console.log("event subscription", e.action, e.record);
    //   // console.log('detetc event created', e.record)
    //   batchedEvents.push({
    //     ...e.record,
    //     created: new Date(e.record.created),
    //   } as unknown as Event);
    // });
    PB.collection("moksa_Events").subscribe("*", function (e) {
      console.log("moksa event ", e.action, e.record);

      batchedEvents.push({
        ...e.record,
        created: new Date(e.record.created),
      } as unknown as Event);
    });

    PB.collection("session").subscribe("*", function (e) {
      console.log("session subscription", e.action, e.record);
      session.activeNode = e.record.activeNode;
    });

    PB.collection("camera").subscribe("*", async (e) => {
      console.log("complete event", e);
      nodes = await getNodes();
      const selected = nodes.find((n) => n.id === session.activeNode);
      console.log("selected node", selected);
      if (selected) {
        selectedNode.set(selected);
      } else {
        selectedNode.set(nodes[0]);
      }
    });

    PB.collection("node").subscribe("*", async (e) => {
      nodes = await getNodes();
      console.log("change e nodes", e.record);
      const selected = nodes.find((n) => n.id === session.activeNode);
      console.log("selected node", selected);
      if (selected) {
        selectedNode.set(selected);
      } else {
        selectedNode.set(nodes[0]);
      }
    });

    PB.collection("ai_inference").subscribe("*", async (e) => {
      nodes = await getNodes();
      const selected = nodes.find((n) => n.id === session.activeNode);
      if (selected) {
        selectedNode.set(selected);
      } else {
        selectedNode.set(nodes[0]);
      }
    });

    setTimeout(updateEvents, 1000);
  });

  onDestroy(() => {
    PB.autoCancellation(false);
    PB.collection("node").unsubscribe("*");
    // PB.collection("events").unsubscribe("*");
    PB.collection("moksa_Events").unsubscribe("*");
    PB.collection("ai_inference").unsubscribe("*");
    PB.collection("camera").unsubscribe("*");
    PB.collection("session").unsubscribe("*");
  });

  //   function setupSocketForAllStores() {
  //     // console.log('allstores',allStores)
  //   // allStores?.forEach((store: any) => {
  //   console.log($selectedNode.moksaId)
  //     setupTheftSockets($selectedNode.moksaId);
  //   // });
  // }

  // function setupTheftSockets(storeId: number) {
  //   const userID = moksaUserId;
  //   if (sockets[storeId]) {
  //     sockets[storeId].disconnect();
  //   }

  //   sockets[storeId] = io("https://api.moksa.ai", {
  //     withCredentials: true,
  //     extraHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //     transports: ["websocket", "polling"],
  //   });

  //   const socket = sockets[storeId];

  //   socket.on("error", (err) => {
  //     console.log(`error for store ${storeId}:`, err);
  //   });

  //   socket.on("connect", () => {
  //     console.log(`connected for store ${storeId}`);
  //     socket.emit("joinUser", userID);
  //     socket.emit("joinStore", storeId);
  //   });

  //   socket.on(`theft_store_${storeId}`, (data) => {
  //     console.log(`Received theft data for store ${storeId}:`, data);
  //     toast(`Received theft data for store ${storeId}:`, {
  //       description: `Store: ${storeId}, Theft Probability: ${data?.theftProbability}, Camera: ${data?.camera_id}`,
  //     });
  //   });

  //   socket.on("disconnect", () => {
  //     console.log(`disconnected for store ${storeId}`);
  //   });
  // }

  // onMount(() => {
  //   setTimeout(() => {
  //     setupSocketForAllStores();
  //   }, 500);
  // });

  // $: if ($selectedNode?.moksaId) {
  //   setTimeout(() => {
  //     setupTheftSockets($selectedNode?.moksaId);
  //   }, 500);
  // }

  // $: console.log($liveData)

  // onDestroy(() => {
  //   Object.values(sockets).forEach((socket) => {
  //     console.log("disconnecting socket");
  //     socket.disconnect();
  //   });
  // });

  // $: console.log("strem user", user);
</script>

{#if searching}
  <div class="flex items-center justify-center h-full">
    <Spinner />
  </div>
{:else if $selectedNode}
  <StreamView {data} url={data.url ?? "/"} features={data?.user?.features} />
{:else}
  <!-- {#if user.role === 'admin'}
<p class='text-xl'>Ask SuperAdmin for store access</p>
{:else} -->
  <div class="hidden sm:flex">
    <AddNode />
  </div>
  <div class="sm:hidden block">
    <AddNodeMob />
  </div>
{/if}
<!-- {/if} -->
