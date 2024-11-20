<script lang="ts">
  import GalleryInfoCard from "@/components/cards/mobile/GalleryInfoCard.svelte";
  import RegisterMobileDialog from "@/components/live/faceRegister/register-mobile-dialog.svelte";
  import { ScanFace } from "lucide-svelte";
  import { Loader2 } from "lucide-svelte";
  export let data: [];
</script>

<div>
  <div class="flex items-center justify-between p-4">
    <h3 class="text-lg font-semibold">Add new Person to Gallery:</h3>
    <RegisterMobileDialog>
      <button
        class="flex items-center justify-center gap-2 cursor-pointer relative hover:text-primary text-xl"
      >
        <ScanFace size={18} />
        Register
      </button>
    </RegisterMobileDialog>
  </div>
  <h3 class="px-4 pb-4 text-2xl font-medium">People:</h3>

  {#if data?.length > 0}
    <div
      class="flex flex-col gap-y-2 items-center w-full max-h-[calc(100vh-155px)] pb-[25vh] overflow-y-scroll"
    >
      {#each data as person, index}
        <GalleryInfoCard {person} />
      {/each}
    </div>
  {:else}
    <div class="w-full flex justify-center items-center h-full gap-2">
      <Loader2 class="animate-spin" />
      Fetching Gallery data ...
    </div>
  {/if}
</div>
