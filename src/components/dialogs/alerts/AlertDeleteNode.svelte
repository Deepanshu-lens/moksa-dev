<script lang="ts">
  import * as AlertDialog from "@/components/ui/alert-dialog";
  import { Button, buttonVariants } from "@/components/ui/button";
  export let onDelete: () => void;
</script>

<AlertDialog.Root>
  <AlertDialog.Trigger>
    <slot />
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
      <AlertDialog.Description class="py-2">
        This action is irreversible.<br />
        <span class="font-medium"
          >It will permanently delete your node along with all associated
          cameras and data.</span
        >
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({ variant: "destructive" })}
        on:click={onDelete}>Continue</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
