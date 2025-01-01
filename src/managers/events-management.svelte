<script lang="ts">
  import pb from "@/lib/pb";
  import { eventsManager, loadingEvents } from "@/stores";

  (async () => {
    loadingEvents.set(true);
    try {
      // Fetch initial data
      pb.autoCancellation(false);
      const events = await pb.collection("event_management").getFullList<any>();
      eventsManager.set(events);
    } catch (error) {
      console.error("Error initializing Event Manager:", error);
    } finally {
      loadingEvents.set(false);
    }
  })();

  try {
    pb.autoCancellation(false);
    pb.collection("event_management").subscribe("*", (e) => {
      if (e.action === "create") {
        eventsManager.update((current) => [...current, e.record]);
      } else if (e.action === "update") {
        eventsManager.update((current) =>
          current.map((cam: any) => (cam.id === e.record.id ? e.record : cam))
        );
      } else if (e.action === "delete") {
        eventsManager.update((current) =>
          current.filter((cam: any) => cam.id !== e.record.id)
        );
      }
    });
  } catch (error) {
    console.error("Failed realtime Events Manager");
  }
</script>
