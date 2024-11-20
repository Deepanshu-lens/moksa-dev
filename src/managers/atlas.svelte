<script lang="ts">
  import pb from "@/lib/pb";
    import { activePanel, panels,user } from "@/stores";
  
    (async () => {
      try {
        // Fetch initial data
        pb.autoCancellation(false);
        const localpanels = await pb.collection("atlas").getFullList<any>({
            expand:"users,doors",
            filter: `session = "${$user?.session[0]}"`
        });
        panels.set(localpanels);
        localpanels.length > 0 && activePanel.set(localpanels[0].id);
    } catch (error) {
      console.error("Error initializing Panel Manager:", error);
    }
  })();

  try {
      pb.autoCancellation(false);
      pb.collection("atlas").subscribe("*", (e) => {
        if (e.action === "create") {
          panels.update((current) => [...current, e.record]);
        } else if (e.action === "update") {
          panels.update((current) =>
            current.map((cam:any) => (cam.id === e.record.id ? e.record : cam))
          );
        } else if (e.action === "delete") {
          panels.update((current) =>
            current.filter((cam:any) => cam.id !== e.record.id)
          );
        }
      });
    } catch (error) {
    console.error("Failed realtime panel");
  }

</script>
