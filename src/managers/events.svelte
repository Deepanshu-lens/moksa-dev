<script lang="ts">
  import pb from "@/lib/pb";
  import { liveEvents, selectedNode } from "@/stores";

  let subscription: any;
  const maxEvents = 90; // Maximum number of events to keep
  const trimSize = 20; // Number of events to remove when trimming

  const subscribeToEvents = () => {
    try {
      if (!selectedNode) return; // Only subscribe if selectedNode is valid

      subscription = pb.collection("events").subscribe(
        "*",
        (e: any) => {
          if (e.action === "create") {
            liveEvents.update((current: any) => {
              const updated = [e.record,...current];

              // Trim the array to keep it at or below maxEvents
              if (updated.length > maxEvents) {
                updated.splice(0, trimSize); // Remove the first 20 events
              }

              return updated;
            });
          } else if (e.action === "update") {
            liveEvents.update((current: any) =>
              current.map((cam: any) =>
                cam.id === e.record.id ? e.record : cam
              )
            );
          } else if (e.action === "delete") {
            liveEvents.update((current: any) =>
              current.filter((cam: any) => cam.id !== e.record.id)
            );
          }
        },
        {
          filter: `node?="${$selectedNode}"`,
        }
      );
    } catch (error) {
      console.error("Failed to subscribe to real-time events:", error);
    }
  };

  $: if ($selectedNode) {
    try {
      // Unsubscribe from any existing subscription
      if (subscription) {
        pb.collection("events").unsubscribe("*");
      }
      subscribeToEvents(); // Subscribe to the current selected node
    } catch (error) {
      console.error("Error while managing subscriptions:", error);
    }
  }
</script>
