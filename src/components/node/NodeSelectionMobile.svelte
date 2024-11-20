<script lang="ts">
  import * as Select from "@/components/ui/select/index.js";
  import { nodes, selectedNode } from "@/stores";
  let selectedValue = {
    value: $selectedNode,
    label: $nodes.find((n) => n.id === $selectedNode)?.name,
  };
  $: selectedValue = {
    value: $selectedNode,
    label: $nodes.find((n) => n.id === $selectedNode)?.name,
  };

  $: console.log($nodes, "nodes here");
</script>

<select
  id="Nodes"
  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
>
  <option selected>Select a Node</option>
  {#each $nodes as node}
    <option value={node?.id}>{node?.name}</option>
    <!-- <Select.Item
    value={node.id}
    label={node.name}
    class="truncate max-w-xs inline-block"
  >
    {node.name}
  </Select.Item> -->
  {/each}
  <!-- <option value="US">United States</option>
  <option value="CA">Canada</option>
  <option value="FR">France</option>
  <option value="DE">Germany</option> -->
</select>
