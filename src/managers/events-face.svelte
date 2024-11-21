<script lang="ts">
  import pb from "@/lib/pb";
  import { faceEvents, selectedNode } from "@/stores";


$: if ($selectedNode) {
    try {
      pb.collection("faceGallery").subscribe(
        "*",
        (e: any) => {
          if (e.action === "create") {
            faceEvents.update((current: any) => [...current, e.record]);
            // toast.success("New event created", {
            //   description: `${e.record.description} on ${e.record.deviceName}`,
            // });
          } else if (e.action === "update") {
            faceEvents.update((current: any) =>
              current.map((cam: any) =>
                cam.id === e.record.id ? e.record : cam
              )
            );
          } else if (e.action === "delete") {
            faceEvents.update((current: any) =>
              current.filter((cam: any) => cam.id !== e.record.id)
            );
          }
        },
        {
          filter: `node.id?="${$selectedNode}"`,
        }
      );
    } catch (error) {
      console.error("Failed realtime events");
    }
  }
</script>