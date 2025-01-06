<script lang="ts">
  import { onMount } from "svelte";
  import ConfigPanel from "../configuration/ConfigPanel.svelte";
  import type { Node } from "@/types";
  import { selectedNode } from "@/stores";
  import pb from "@/lib/pb";
  export let moksa;
  export let data;
  const { session } = moksa?.user;
  let nodes: Node[] = [];

  async function getNodes() {
    if (session?.node?.length > 0) {
      pb.autoCancellation(false);
      const nodes = await pb.collection("node").getFullList(200, {
        sort: "created",
        filter: `session~"${session.id}"`,
      });

      for (const node of nodes) {
        const cameras = await pb.collection("camera").getFullList({
          filter: `node~"${node.id}"`,
          sort: "-created",
        });
        node.camera = cameras.map((cam) => ({
          ...cam,
        }));
      }

      return nodes.map((node) => ({
        ...node,
        session: session.id,
      }));
    }
    return [];
  }

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
    user={moksa?.user}
    records={data?.records}
    logs={data?.logs}
    sessionId={data?.session?.id}
    {data}
    {nodes}
  />
</main>
