<script lang="ts">
  import { onMount } from "svelte";
  import pb from "@/lib/pb";
  import { cameras, selectedNode, totalCameras } from "@/stores";
  import { validateCamera, type Camera } from "@/types";

  const getInitialCameras = async (nodeId: string) => {
    try {
      const localCameras = await pb.collection("camera").getList<Camera>(1, 9, {
        fields: "id,name,url,subUrl,save,created",
        filter: `node.id ?= "${nodeId}"`,
        sort: "-created",
      });

      cameras.set(localCameras.items);
      totalCameras.set(localCameras.totalItems);
    } catch (error) {
      console.error("Error initializing Camera Manager:", error);
    }
  };

  $: if ($selectedNode) {
    getInitialCameras($selectedNode);
    pb.collection("camera").unsubscribe("*");
    try {
      pb.collection("camera").subscribe(
        "*",
        (e) => {
          console.log(
            "Camera collection updated!! ",
            e.action,
            e.record,
            $selectedNode
          );
          if (e.action === "create") {
            const validated = validateCamera(e.record);
            if (validated) cameras.update((current) => [...current, validated]);
          } else if (e.action === "update") {
            const validated = validateCamera(e.record);
            if (validated)
              cameras.update((current) =>
                current.map((cam) =>
                  cam.id === validated.id ? validated : cam
                )
              );
          } else if (e.action === "delete") {
            cameras.update((current) =>
              current.filter((cam) => cam.id !== e.record.id)
            );
          }
        },
        {
          filter: `node.id?="${$selectedNode}"`,
        }
      );
    } catch (error) {
      console.error("Failed realtime camera");
    }
  }
</script>
