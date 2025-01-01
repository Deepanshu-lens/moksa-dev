<script lang="ts">
  import pb from "@/lib/pb";
  import { liveEvents, selectedNode } from "@/stores";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  let subscription: any;
  const maxEvents = 90; // Maximum number of events to keep
  const trimSize = 20; // Number of events to remove when trimming
  let audio: any;
  let soundFilePath = "/level-up.mp3";

  onMount(() => {
    let sound = window.localStorage.getItem("alertSound") || "Short Beep";
    if (sound === "Notification") {
      soundFilePath = "/notification-alert.mp3";
    } else if (sound === "Public Beep") {
      soundFilePath = "/public-beep-sound.mp3";
    } else if (sound === "Short Beep") {
      soundFilePath = "/short-beep-tone.mp3";
    } else {
      soundFilePath = "/level-up.mp3";
    }
  });

  const subscribeToEvents = () => {
    try {
      if (!selectedNode) return; // Only subscribe if selectedNode is valid

      subscription = pb.collection("events").subscribe(
        "*",
        (e: any) => {
          if (e.action === "create") {
            liveEvents.update((current: any) => {
              const updated = [e.record, ...current];

              // Trim the array to keep it at or below maxEvents
              if (updated.length > maxEvents) {
                updated.splice(0, trimSize); // Remove the first 20 events
              }

              // playing sound upon critical event
              if (e?.record?.severity === "critical") {
                toast.warning(`Critical event detected: ${e?.record?.title}`);
                audio = new Audio(`/notification-sounds/${soundFilePath}`);
                audio.play(); // Play sound when critical event is detected
              }

              return updated;
            });
          } else if (e.action === "update") {
            audio.play(); // Play sound when critical event is detected
            liveEvents.update((current: any) =>
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
