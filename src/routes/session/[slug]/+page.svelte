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

  export let data: PageServerData;
  const { session } = data;
  const moksaUserId = data.user.moksaId
  const allStores = data?.stores?.data.data
  console.log('allstores',allStores)
  let nodes: Node[] = [];
  let batchedEvents: Event[] = [];
  let searching : boolean = true;

let sockets: { [key: number]: any } = {};
let liveData = writable([]);
  $: console.log("data", data);

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);




const token = data.token

function setupSocket(userId: number) {
  if (sockets[userId]) {
    sockets[userId].disconnect();
  }
console.log(token)
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
  
  });

  socket.on("disconnect", () => {
    console.log(`disconnected for store ${userId}`);
  });
}

onMount(() => {
  setTimeout(() => {
  if (data.token !== undefined) {
    const userId = moksaUserId
    setupSocket(userId);
  }
  }, 500);
});

$: console.log($liveData)

onDestroy(() => {
  Object.values(sockets).forEach((socket) => {
    console.log('disconnecting socket')
    socket.disconnect();
  });
});


  async function getNodes(): Promise<Node[]> {
    if (session?.node.length > 0) {
      PB.autoCancellation(false);
    const nodes = await PB.collection("node").getFullList(200, {
      sort: "-created",
      filter: `session~"${session.id}"`,
    });
 const allCameraNumbers: { [nodeId: string]: number[] } = {};

    for (const node of nodes) {
      const cameras = await PB.collection("camera").getFullList({
        filter: `node~"${node.id}"`,
        sort: "-created",
        expand: 'personCounter,inference'
      });
      // console.log('cameras',cameras)
      node.camera = cameras.map((cam: Camera) => ({
        ...cam,
        personCounter: cam?.expand?.personCounter?.count,
      }));
        allCameraNumbers[node.id] = cameras.map(cam => cam.cameraNo);
    }

    return nodes.map((node) => ({
      ...node,
      session: session.id,
        allCameraNumbers: allCameraNumbers[node.id],
    }) as Node);
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
    console.log(nodes)
    const s = nodes.find((n) => n.id === session.activeNode);
          if(s) {
        selectedNode.set(s)
      } else {
        selectedNode.set(nodes[0])
      }
    searching = false
    events.set(data.events);

    PB.collection("events").subscribe("*", function (e) {
      console.log("event subscription", e.action, e.record);
      // console.log('detetc event created', e.record)
      batchedEvents.push({
        ...e.record,
        created: new Date(e.record.created),
      } as unknown as Event);
    });

    PB.collection("session").subscribe("*", function (e) {
      console.log("session subscription", e.action, e.record);
      session.activeNode = e.record.activeNode
    });

    PB.collection("camera").subscribe("*", async (e) => {
      console.log('complete event',e)
      nodes = await getNodes();
      const selected = nodes.find((n) => n.id === session.activeNode);
      console.log("selected node", selected);
      if(selected) {
        selectedNode.set(selected)
      } else {
        selectedNode.set(nodes[0])
      }
    });

    PB.collection("node").subscribe("*", async (e) => {
      nodes = await getNodes();
      console.log("change e nodes", e.record)
      const selected = nodes.find((n) => n.id === session.activeNode);
      console.log("selected node", selected);
      if(selected) {
        selectedNode.set(selected)
      } else {
        selectedNode.set(nodes[0])
      }
    });

     PB.collection("ai_inference").subscribe("*", async (e) => {
      nodes = await getNodes();
      const selected = nodes.find((n) => n.id === session.activeNode);
      if(selected) {
        selectedNode.set(selected)
      } else {
        selectedNode.set(nodes[0])
      }
    });

    setTimeout(updateEvents, 1000);
  });



  onDestroy(() => {
    PB.autoCancellation(false);
    PB.collection("node").unsubscribe("*");
    PB.collection("events").unsubscribe("*");
    PB.collection("ai_inference").unsubscribe("*");
    PB.collection("camera").unsubscribe("*");
    PB.collection("session").unsubscribe("*");
  });


  function setupSocketForAllStores() {
  allStores.forEach((store: any) => {
    setupTheftSockets(store.id);
  });
}

function setupTheftSockets(storeId: number) {
  const userID = moksaUserId
  if (sockets[storeId]) {
    sockets[storeId].disconnect();
  }

  sockets[storeId] = io("https://api.moksa.ai", {
    withCredentials: true,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
  });

  const socket = sockets[storeId];

  socket.on("error", (err) => {
    console.log(`error for store ${storeId}:`, err);
  });

  socket.on("connect", () => {
    console.log(`connected for store ${storeId}`);
    socket.emit("joinUser", userID);
    socket.emit("joinStore", storeId);
  });

  socket.on(`theft_store_${storeId}`, (data) => {
    console.log(`Received theft data for store ${storeId}:`, data);
    toast(`Received theft data for store ${storeId}:`, {
      description: `Store: ${storeId}, Theft Probability: ${data?.theftProbability}, Camera: ${data?.camera_id}`
    });
  });

  socket.on("disconnect", () => {
    console.log(`disconnected for store ${storeId}`);
  });
}

onMount(() => {
  setTimeout(() => {
    setupSocketForAllStores();
  }, 500);
});

// $: console.log($liveData)

onDestroy(() => {
  Object.values(sockets).forEach((socket) => {
    console.log('disconnecting socket')
    socket.disconnect();
  });
});


</script>


{#if searching}
<div class="flex items-center justify-center h-full">
  <Spinner  />
</div>
{:else}
{#if $selectedNode}
  <StreamView {data} url={data.url ?? "/"} features={data?.user?.features} />
{:else}
  <div class="hidden sm:flex">
    <AddNode />
  </div>
  <div class="sm:hidden block">
    <AddNodeMob />
  </div>
{/if}
{/if}