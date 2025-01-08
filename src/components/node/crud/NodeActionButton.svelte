<script lang="ts">
  import { Button } from "@/components/ui/button";
  import NodeActionModal from "./NodeActionModal.svelte";
  import { HousePlus, Pencil, Settings, Trash } from "lucide-svelte";

  export let action: "add" | "edit" | "delete";
  type Props =
    | { action: "add"; icon?: boolean; camera?: undefined }
    | {
        action: "edit" | "settings" | "delete" | "ptz";
        icon?: boolean;
      };
  export let icon: Props["icon"] = false;
  export let moksa;
</script>

<!-- <NodeActionModal {action} {moksa}>
  <Button variant="outline" size="sm" class={`text-xs`}
    >{action.charAt(0).toUpperCase() + action.slice(1)}</Button
  >
</NodeActionModal> -->

<NodeActionModal {action} {moksa}>
  {#if icon}
    <Button variant="outline" size="sm" class={`text-xs`}>
      {#if action === "edit"}
        <Pencil size={12} />
      {:else if action === "add"}
        <HousePlus size={12} />
      {:else}
        <Trash size={13} />
      {/if}
    </Button>
  {:else}
    <Button variant="outline" size="sm" class={`text-xs`}
      >{action.charAt(0).toUpperCase() + action.slice(1)}</Button
    >
  {/if}
</NodeActionModal>
