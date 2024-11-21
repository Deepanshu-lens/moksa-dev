<script>
  import { ChevronLeft, Loader2 } from "lucide-svelte";
  import GalleryView from "../components/gallery/mobile/GalleryView.svelte";
  import GalleryPanel from "../components/gallery/GalleryPanel.svelte";
  import { gallery, isGalleryLoading } from "@/stores/gallery";
  import PageBarMobile2 from "@/components/bars/PageBarMobile2.svelte";
</script>

<!-- desk -->
<div class="h-[calc(100vh-76px)] hidden sm:block w-full">
  {#if !$isGalleryLoading}
    <GalleryPanel gallery={$gallery} />
  {:else}
    <div class="w-full flex justify-center items-center h-full gap-2">
      <Loader2 class="animate-spin" />
      Fetching Gallery data ...
    </div>
  {/if}
</div>

<!-- mob -->
<div class="block sm:hidden">
  <PageBarMobile2 location="top"/>
  <div class="flex flex-col w-full bg-[#f5f6f7] z-10 relative h-[100vh]">
    <div class="top-config w-full">
      <button class="flex items-center justify-start text-black/[.7] pt-4">
        <ChevronLeft class="h-[30px] w-[30px]" />
        <p class="text-lg font-semibold">Gallery</p>
      </button>
    </div>
    <GalleryView data={$gallery} />
  </div>
</div>
