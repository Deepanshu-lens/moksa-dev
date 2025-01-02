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
      soundFilePath =
        localStorage.getItem("alertSound") || "/notification-alert.mp3";
    } else if (sound === "Public Beep") {
      soundFilePath = "/public-beep-sound.mp3";
    } else if (sound === "Short Beep") {
      soundFilePath = "/short-beep-tone.mp3";
    } else {
      soundFilePath = "/level-up.mp3";
    }
  });

  const getSoundsForSeverityAndType = (severity: string, type: string) => {
    let sound = JSON.parse(localStorage.getItem(type));

    // if sound accoring to type is not found, then get sound according to severity
    let localSeverity = JSON.parse(localStorage.getItem(severity));
    if (!!localSeverity) {
      sound = localSeverity;
    }

    if (sound === "Notification") {
      soundFilePath =
        localStorage.getItem("alertSound") || "/notification-alert.mp3";
    } else if (sound === "Public Beep") {
      soundFilePath = "/public-beep-sound.mp3";
    } else if (sound === "Short Beep") {
      soundFilePath = "/short-beep-tone.mp3";
    } else {
      soundFilePath = "/level-up.mp3";
    }
    audio = new Audio(
      `/notification-sounds/${localStorage.getItem("alertSound") || soundFilePath}`
    );
    audio.play(); // Play sound when critical event is detected
  };

  const subscribeToEvents = () => {
    try {
      if (!$selectedNode) return; // Only subscribe if $selectedNode is valid

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

              // getting event sounds for severity
              toast.warning(`Event detected: ${e?.record?.title}`);
              getSoundsForSeverityAndType(e?.record?.severity, e?.record?.type);
              return updated;
            });
          } else if (e.action === "update") {
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
