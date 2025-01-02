<script lang="ts">
  import * as Select from "@/components/ui/select/index.js";
  import { addUserLogs } from "@/lib/logs/userLogs";
  import { nodes, selectedNode, user } from "@/stores";

  export let allNodes:boolean = true;

  $: selectedValue = $nodes
    ? {
        value:selectedNode,
        label: $nodes.find((n) => n.id === $selectedNode)?.name,
      }
    : undefined;
  $: selectedValue && localStorage.setItem("$selectedNode", selectedValue.value);
</script>

{#if $nodes}
  <Select.Root
    items={$nodes.map((node) => ({ value: node.id, label: node.name }))}
    onSelectedChange={(e: any) => {
      addUserLogs(`User selected node ${e.label}`, $user?.email || "", $user?.id || "");
      $selectedNode.set(e.value);
    }}
    bind:selected={selectedValue}
  >
    <Select.Trigger class="lg:w-full w-[17rem]">
      <span class="text-muted-foreground">Node:</span>
      <Select.Value placeholder="Cameras" />
    </Select.Trigger>
    <Select.Content class="overflow-y-auto max-h-[calc(100vh-10rem)]">
      {#if allNodes}
        {#each $nodes as node}
          <Select.Item
            value={node.id}
            label={node.name}
            class="truncate max-w-xs inline-block"
          >
            {node.name}
          </Select.Item>
        {/each}
      {:else}
        {#each $nodes.slice(1) as node}
          <Select.Item
            value={node.id}
            label={node.name}
            class="truncate max-w-xs inline-block"
          >
            {node.name}
          </Select.Item>
        {/each}
      {/if}
    </Select.Content>
  </Select.Root>
{/if}
