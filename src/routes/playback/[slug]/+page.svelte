<script lang="ts">
  import { page } from "$app/stores";
  import PlaybackPanel from "@/components/playback/PlaybackPanel.svelte";
  import { selectedNode } from "@/lib/stores";
  import PocketBase from "pocketbase";
  import type { PageServerData } from "./$types";
  import { onMount } from "svelte";
  import type { Node, Camera, Event } from "@/types.d.ts";

  // const PB = new PocketBase(PUBLIC_POCKETBASE_URL);
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  export let data: PageServerData;
  const session = data.session;
  let nodes: Node[] = [];

  async function getNodes(): Promise<Node[]> {
    if (session.node.length > 0) {
      const nodes = await PB.collection("node").getFullList(200, {
        sort: "created",
        expand: "camera",
        filter: `session~"${session.id}"`,
      });
      return nodes.map(
        (node) =>
          ({
            ...node,
            session: session.id,
            camera:
              node?.camera?.length > 0
                ? (node?.expand?.camera?.reverse().map((cam: Camera) => ({
                    name: cam.name,
                    id: cam.id,
                    url: cam.url,
                  })) as Camera[])
                : [],
          }) as unknown as Node,
      );
    }
    return [];
  }

  onMount(async () => {
    PB.autoCancellation(false);
    nodes = await getNodes();
    const s = nodes.find((n) => n.id === session.activeNode);
    if (s) {
      selectedNode.set(s);
    } else {
      selectedNode.set(nodes[0]);
    }
  });
</script>

<!-- desk -->
<main class="hidden sm:block w-full h-screen">
  {#if $selectedNode}
    <PlaybackPanel {data} />
  {/if}
</main>

<!-- mob
<main class="block sm:hidden">
  <div class="flex flex-col w-full bg-[#f5f6f7] z-10 relative">
    <div class="top-config w-full">
      <button
        class="flex items-center justify-start text-black/[.7] pt-4"
        on:click={() => {
          window.location.href = `/session/${$selectedNode.session}`;
        }}
      >
        <ChevronLeft class="h-[30px] w-[30px]" />
        <p class="text-lg font-semibold">Playback</p>
      </button>
    </div>
    <PlaybackView webmFiles={data?.webmFiles} />
  </div>
</main> -->
