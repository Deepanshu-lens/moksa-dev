<script>
	import RecursiveNode from './RecursiveNode.svelte';
  import { ChevronRight } from "lucide-svelte";
  import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-svelte";

  export let node;
  export let handleNodeSelect;

  const hasChildren = node?.nodes?.[0]?.nodes !== undefined;

  // $: console.log(node)
</script>

<DropdownItem
  class="flex items-center justify-between z-40 text-[#2c2c2c] dark:text-white/[.7] font-medium text-sm"
  on:click={() => {
    if (!hasChildren) {
      handleNodeSelect({ target: { value: node.id } });
    }
  }}
>
  {node.name.includes("_")
    ? node.name.substring(node.name.lastIndexOf("_") + 1)
    : node.name.length > 20
      ? node.name.substring(0, 20) + "..."
      : node.name}
  {#if hasChildren}
    <ChevronRight class="w-6 h-6 ms-2 text-primary-700 dark:text-white" />
  {/if}
</DropdownItem>
<!-- <DropdownDivider /> -->
{#if hasChildren}
<Dropdown placement="bottom-end" class="z-[99999999] dark:text-slate-200 dark:bg-black border dark:border-slate-300 dark:border-opacity-35 rounded-sm min-w-[10rem]">
    {#each node.nodes as subnode}
      <RecursiveNode node={subnode} {handleNodeSelect} />
    {/each}
  </Dropdown>
{/if}