<script lang="ts">
  import pb from "@/lib/pb";
  import { events } from "@/stores";
  import { toast } from "svelte-sonner";
  import { activePanel } from "@/stores";

  (async () => {
    try {
      // Fetch initial data
      pb.autoCancellation(false);
      const localEvents = await pb.collection("atlas_events").getFullList<any>({
        filter: `pannels="${$activePanel}"`,
        sort: "-created",
        expand: "user",
      });
      events.set(localEvents);
      localEvents.length > 0;
    } catch (error) {
      console.error("Error initializing Panel Manager:", error);
    }
  })();

  try {
    pb.collection("atlas_events").subscribe("*", (e: any) => {
      if (e.action === "create") {
        events.update((current: any) => [...current, e.record]);
        toast.success("New event created", {
          description: `${e.record.description} on ${e.record.deviceName}`,
        });
      } else if (e.action === "update") {
        events.update((current: any) =>
          current.map((cam: any) => (cam.id === e.record.id ? e.record : cam))
        );
      } else if (e.action === "delete") {
        events.update((current: any) =>
          current.filter((cam: any) => cam.id !== e.record.id)
        );
      }
    });
  } catch (error) {
    console.error("Failed realtime events");
  }

  //todo: find something better than this
  $: if ($activePanel) {
    (async () => {
      try {
        // Fetch initial data
        pb.autoCancellation(false);
        const localEvents = await pb
          .collection("atlas_events")
          .getFullList<any>({
            filter: `pannels="${$activePanel}"`,
            sort: "-created",
            expand: "user",
          });
        events.set(localEvents);
        localEvents.length > 0;
      } catch (error) {
        console.error("Error initializing Panel Manager:", error);
      }
    })();
  }
</script>
