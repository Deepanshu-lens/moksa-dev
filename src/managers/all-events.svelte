<script lang="ts">
  import pb from "@/lib/pb";
  import { allEvents, selectedNode, totalAllEvent } from "@/stores";
  import { type Event } from "@/types";

  const getInitialEvents = async () => {
    try {
      pb.autoCancellation(false);
      const localEvents = await pb
        .collection("events")
        .getList<Event[]>(1, 10, {
          sort: "-created",
          filter: `node?="${$selectedNode}"`,
        });

      allEvents.set(localEvents.items);
      totalAllEvent.set(localEvents.totalItems);
    } catch (error) {
      console.error("Error initializing Panel Manager:", error);
    }
  };

  $: if ($selectedNode) getInitialEvents();
  $: if ($selectedNode) {
    try {
      pb.collection("events").subscribe(
        "*",
        (e: any) => {
          if (e.action === "create") {
            allEvents.update((current: any) => [e.record, ...current]);
          } else if (e.action === "update") {
            allEvents.update((current: any) =>
              current.map((cam: any) =>
                cam.id === e.record.id ? e.record : cam
              )
            );
          }
        },
        {
          filter: `node?="${$selectedNode}"`,
        }
      );
    } catch (error) {
      console.error("Failed realtime events");
    }
  }
</script>
