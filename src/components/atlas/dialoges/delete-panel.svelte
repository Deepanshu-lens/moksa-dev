<script lang="ts">
  //imports
  import * as Dialog from "../../../components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Button } from "../../../components/ui/button";
  import { panels, activePanel } from "@/stores";
  import pb from "@/lib/pb";
  import { onMount } from "svelte";

  //variables
  let panel: any;
  let isLoading: boolean = false;

  //states
  let dialogOpen: boolean = false;

  const handleDelete = async () => {
    if (panel) {
      isLoading = true;
      if (panel.users.length > 0) {
        await Promise.all(
          panel.users.map((userId: string) =>
            pb.collection("atlas_users").delete(userId)
          )
        );
      }
      await pb.collection("atlas").delete(panel.id);
      toast.success("Panel deleted successfully.");
    } else {
      toast.error(
        "Error deleting panel. Please try again by selecting a panel."
      );
    }
    dialogOpen = false;
    isLoading = false;
  };

  $: if($activePanel) panel = $panels.find((panel: any) => panel.id === $activePanel);
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    {#if panel}
      <Dialog.Header>
        <Dialog.Title
          >Delete Panel : <span
            class="font-semibold text-brand-foreground dark:text-brand capitalize"
            >{panel?.name}</span
          ></Dialog.Title
        >
      </Dialog.Header>
      <div class="grid grid-cols-2">
        <div class="col-span-2">
          Are you sure you would like to delete Panel :
          <span
            class="font-semibold text-brand-foreground dark:text-brand capitalize"
            >{panel?.name}</span
          >
        </div>
      </div>
      <Dialog.Footer>
        <span class="flex items-center gap-4">
          <Button
            on:click={() => {
              dialogOpen = false;
            }}
            variant="secondary">Cancel</Button
          >
          <Button variant="destructive" on:click={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </span>
      </Dialog.Footer>
    {:else}
      <div class="p-4 text-center">
        <p class="text-lg font-medium text-brand-foreground dark:text-brand">
          Please select a panel to delete first.
        </p>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
