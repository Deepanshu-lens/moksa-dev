<script lang="ts">
  import { onMount } from "svelte";
  import type { Gallery } from "@/types";
  import pb from "@/lib/pb";
  import { gallery, totalFaceRegistered, user, isGalleryLoading } from "@/stores";

  const getInitialGallery = async () => {
    isGalleryLoading.set(true);
    try {
      const localGallery = await pb.collection("faceGallery").getFullList<Gallery>({
        filter: `session.id ?= "${$user?.session[0]}"`,
        sort: "-created",
      });

      gallery.set(localGallery);
      totalFaceRegistered.set(localGallery?.length || 0);
    } catch (error) {
      console.error("Error initializing Gallery Manager:", error);
    } finally {
      isGalleryLoading.set(false);
    }
  };

  $: if ($user) {
    getInitialGallery();
    pb.collection("faceGallery").unsubscribe("*");
    try {
      pb.collection("faceGallery").subscribe(
        "*",
        (e) => {
          console.log(
            "Camera collection updated!! ",
            e.action,
            e.record,
          );
          if (e.action === "create") {
            gallery.update((current) => [...current, e.record]);
          } else if (e.action === "update") {
            gallery.update((current) =>
              current.map((cam) =>
                    cam.id === e.record.id ? e.record : cam
                )
              );
          } else if (e.action === "delete") {
            gallery.update((current) =>
              current.filter((cam) => cam.id !== e.record.id)
            );
          }
        },
        {
          filter: `session.id?="${$user?.session[0]}"`,
        }
      );
    } catch (error) {
      console.error("Failed realtime camera");
    }
  }
</script>
