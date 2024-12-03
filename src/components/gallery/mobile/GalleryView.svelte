<script lang="ts">
  import GalleryInfoCard from "@/components/cards/mobile/GalleryInfoCard.svelte";
  import RegisterMobileDialog from "@/components/dialogs/mobile/RegisterMobileDialog.svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import { ScanFace } from "lucide-svelte";

  export let data;
</script>

<div>
  <div class="flex items-center justify-between p-4">
    <h3 class="text-lg font-semibold">Add new Person to Gallery:</h3>
    <RegisterMobileDialog>
      <button
        class="flex items-center justify-center gap-2 cursor-pointer relative hover:text-primary text-xl"
        on:click={() =>
          addUserLog("user clicked on Register button, gallery panel")}
      >
        <ScanFace size={18} />
        Register
      </button>
    </RegisterMobileDialog>
  </div>
  <h3 class="px-4 pb-4 text-2xl font-medium">People:</h3>
  <div
    class="flex flex-col gap-y-2 items-center w-full max-h-[calc(100vh-155px)] pb-20 overflow-y-scroll"
  >
    {#each data as person, index}
      <GalleryInfoCard {person} />
    {/each}
  </div>
</div>
