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

  // remove console
  $:console.log($faceEvents, "face events");

  /**
   * {
    "id": "RECORD_ID",
    "collectionId": "644w4mf5ew5qqic",
    "collectionName": "faceGallery",
    "created": "2022-01-01 01:00:00.123Z",
    "updated": "2022-01-01 23:59:59.456Z",
    "features": "JSON",
    "name": "test",
    "images": "JSON",
    "template": "JSON",
    "lastSeen": "2022-01-01 10:00:00.123Z",
    "events": [
      "RELATION_RECORD_ID"
    ],
    "employee": true,
    "aadhar": "test",
    "department": "test",
    "mobile": 123,
    "email": "test@example.com",
    "shiftStartTime": "test",
    "shiftEndTime": "test",
    "blackList": true
  }
  */
</script>