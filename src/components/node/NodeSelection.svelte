<script lang="ts">
  import * as Select from "@/components/ui/select/index.js";
  import { nodes, selectedNode } from "@/stores";
  $: selectedValue = $nodes
    ? {
        value: $selectedNode,
        label: $nodes.find((n) => n.id === $selectedNode)?.name,
      }
    : undefined;
  $: selectedValue && localStorage.setItem("selectedNode", selectedValue.value);
</script>

{#if $nodes}
  <Select.Root
    items={$nodes.map((node) => ({ value: node.id, label: node.name }))}
    onSelectedChange={(e: any) => {
      selectedNode.set(e.value);
    }}
    bind:selected={selectedValue}
  >
    <Select.Trigger class="lg:w-full w-[17rem]">
      <span class="text-muted-foreground">Node:</span>
      <Select.Value placeholder="Cameras" />
    </Select.Trigger>
    <Select.Content class="overflow-y-auto max-h-[calc(100vh-10rem)]">
      {#each $nodes as node}
        <Select.Item
          value={node.id}
          label={node.name}
          class="truncate max-w-xs inline-block"
        >
          {node.name}
        </Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
{/if}
