<script lang="ts">
  //@ts-nocheck
  import pb from "@/lib/pb";
  import { personCount, selectedNode } from "@/stores";

  (async () => {
    try {
        // Fetch initial data
      pb.autoCancellation(false);
      const localpanels = await pb
        .collection("personCounter")
        .getFullList<any>();
      personCount.update(localpanels);
    } catch (error) {
      console.error("Error initializing Panel Manager:", error);
      }
    })();

  $: if ($selectedNode) {
    try {
      pb.collection("personCounter").subscribe(
        "*",
        (e) => {
          if (e.action === "create" || e.action === "update") {
            personCount.update((current) => {
              const index = current.findIndex(item => item.camera === e?.record?.camera);
              if (index !== -1) {
                // Replace the existing object
                current[index] = e?.record;
                return [...current];
              } else {
                // Add the new object
                return [...current, e?.record];
              }
            });
          } else if (e.action === "delete") {
            personCount.update((current) =>
                current.filter((count) => count?.id !== e?.record?.id)
            );
          }
        },
        {
          filter: `node?="${$selectedNode}"`,
        }
      );
    } catch (error) {
      console.error("Failed realtime camera");
    }
  }
</script>