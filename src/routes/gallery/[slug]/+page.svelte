<script lang="ts">
  import DataTable from "@/components/tables/GalleryTable.svelte";
  import { onMount } from "svelte";
  import type { Gallery } from "@/types";
  import PocketBase from "pocketbase";
  import RegisterDialog from "@/components/dialogs/RegisterDialog.svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import { ChevronLeft, ScanFace } from "lucide-svelte";
  import GalleryView from "@/components/gallery/mobile/GalleryView.svelte";
  import { selectedNode } from "@/lib/stores";
  import GalleryPanel from "@/components/gallery/GalleryPanel.svelte";
  import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
  import { page } from "$app/stores";

  let gallery: Gallery[] = [];

  // const PB = new PocketBase(PUBLIC_POCKETBASE_URL);
  const PB = new PocketBase(`https://server.moksa.ai`);

  async function getData(): Promise<Gallery[]> {
    const data = await PB.collection("faceGallery").getFullList();

    return data.map(
      (v) =>
        ({
          name: v.name,
          images: v.images,
          created: new Date(v.created),
          updated: new Date(v.updated),
          lastSeen: new Date(v.lastSeen),
        }) as Gallery,
    );
  }
  onMount(async () => {
    gallery = await getData();
  });
</script>

<!-- desk -->
<div class="h-[calc(100vh-76px)] hidden sm:block w-full">
  {#if gallery}
    <GalleryPanel {gallery} />
  {/if}
</div>

<!-- mob -->
<div class="block sm:hidden">
  <div class="flex flex-col w-full bg-[#f5f6f7] z-10 relative">
    <div class="top-config w-full">
      <button
        class="flex items-center justify-start text-black/[.7] pt-4"
        on:click={() => {
          window.location.href = `/session/${$selectedNode?.session}`;
        }}
      >
        <ChevronLeft class="h-[30px] w-[30px]" />
        <p class="text-lg font-semibold">Gallery</p>
      </button>
    </div>
    <GalleryView data={gallery} />
  </div>
</div>
