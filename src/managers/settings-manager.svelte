<script>
  import pb from "@/lib/pb";
  import { settings } from "@/stores";
  import { onMount } from "svelte";
  export let moksa;

  export const getSettingsData = async () => {
    try {
      pb.autoCancellation(false);
      const nodeData = await pb?.collection("node").getFullList({
        filter: `session~"${moksa?.user?.session}"`,
      });

      if (nodeData?.length > 0) {
        settings.set(nodeData);
      }

      if (nodeData) {
        for (let node of nodeData) {
          if (node.camera && Array.isArray(node.camera)) {
            let cameraData = [];
            for (let cameraId of node.camera) {
              let cameraDetails = await pb?.collection("camera").getFullList({
                filter: `id="${cameraId}"`,
                expand: "inference",
              });
              if (cameraDetails) {
                cameraData.push(cameraDetails);
              }
            }
            node["cameraData"] = cameraData;
          }
        }
      }
    } catch (error) {}
  };

  onMount(() => {
    getSettingsData();
  });
</script>
