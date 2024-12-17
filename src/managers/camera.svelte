<script lang="ts">
  import pb from "@/lib/pb";
  import {
    cameras,
    selectedNode,
    totalCameras,
    user,
  } from "@/stores";
  import { validateCamera, type Camera } from "@/types";

  const getInitialCameras = async (nodeId: string) => {
    let filter;
    if(nodeId === "all")
    filter = `session ?= "${$user?.session}"`
     else
    filter = `node.id ?= "${nodeId}"`

    try {
      const localCameras = await pb
        .collection("camera")
        .getFullList<Camera>({
          fields: "id,name,url,subUrl,save,created,node",
          filter,
          sort: "created",
        });

      cameras.set(localCameras);
      totalCameras.set(localCameras.length);
    } catch (error) {
      console.error("Error initializing Camera Manager:", error);
    }
  };

  $: if ($selectedNode) {
    getInitialCameras($selectedNode);
    pb.collection("camera").unsubscribe("*");
    let filter;
    if($selectedNode === "all")
    filter = `session ?= "${$user?.session}"`
     else
    filter = `node.id ?= "${$selectedNode}"`

    try {
      pb.collection("camera").subscribe(
        "*",
        (e) => {
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
          filter,
        }
      );
    } catch (error) {
      console.error("Failed realtime camera");
    }
  }
</script>
