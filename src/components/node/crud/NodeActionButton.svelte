<script lang="ts">
  import { Button } from "@/components/ui/button";
  import NodeActionModal from "./NodeActionModal.svelte";

  export let action: "add" | "edit" | "delete";

</script>

<NodeActionModal {action}>
  <Button variant="outline" size="sm" class={`text-xs`}
    >{action.charAt(0).toUpperCase() + action.slice(1)}</Button
  >
</NodeActionModal>
