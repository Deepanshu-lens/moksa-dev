<script lang="ts">
  import pb from "@/lib/pb";
  import { selectedNode, nodes, user } from "@/stores";
  import type { Node } from "@/types";
  import { sleep } from "node_modules/bits-ui/dist/internal";

  async function fetchNodes() {
    // Fetch initial data
    const localNodes = await pb.collection("node").getFullList<Node>({
      fields: "id,name",
      filter: `session.id?="${pb.authStore.model?.session[0]}"`,
      sort: "-created",
    });
     localNodes.length > 0 ? nodes.set([{ id: "all", name: "All" }, ...localNodes]): nodes.set(localNodes)
    localNodes.length > 0 &&
      (localStorage.getItem("selectedNode") &&
      [{id:"all",name:"All"},...localNodes].filter((l) => l.id === localStorage.getItem("selectedNode"))
        .length > 0
        ? selectedNode.set(localStorage.getItem("selectedNode") ?? "")
        : selectedNode.set(localNodes[0].id));
  }

  (async () => {
    try {
      await fetchNodes();
    } catch (error) {
      console.error("Error initializing Node Manager:", error);
      await sleep(3000);
      await fetchNodes();
    }
  })();

  try {
    pb.collection("node").subscribe(
      "*",
      (e) => {
        console.log("Node collection updated", e.action, e.record);
        if (e.action === "create") {
          nodes.update((current) => [...current, e.record]);
        } else if (e.action === "update") {
          nodes.update((current) =>
            current.map((cam) => (cam.id === e.record.id ? e.record : cam))
          );
        } else if (e.action === "delete") {
          nodes.update((current) =>
            current.filter((cam) => cam.id !== e.record.id)
          );
          $nodes.length > 0 && selectedNode.set($nodes[0].id);
        }
      },
      {
        filter: `session.id?="${pb.authStore.model.session[0]}"`,
      }
    );
  } catch (error) {
    console.error("Failed realtime camera");
  }
</script>
