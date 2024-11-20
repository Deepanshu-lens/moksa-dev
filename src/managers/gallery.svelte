<script lang="ts">
  import { onMount } from "svelte";
  import type { Gallery } from "@/types";
  import pb from "@/lib/pb";
  import { gallery, totalFaceRegistered } from "@/stores/gallery";

  async function getData(): Promise<Gallery[]> {
    pb.autoCancellation(false);
    const data = await pb.collection("faceGallery").getFullList();

    const galleryData = data.map(
      (v) =>
        ({
          name: v.name,
          images: v.images,
          created: new Date(v.created),
          updated: new Date(v.updated),
          lastSeen: new Date(v.lastSeen),
        }) as Gallery
    );

    gallery.set(galleryData);
    totalFaceRegistered.set(galleryData?.length || 0);
  }
  onMount(async () => {
    galleryData = await getData();
  });
</script>
