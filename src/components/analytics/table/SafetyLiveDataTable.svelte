<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown,Check,X, ChevronRight, Edit, Store, StoreIcon, Trash2, TrendingDown, TrendingUp } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { User } from "lucide-svelte";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  // Static data
  export let data;
  
$:console.log('livetabledata',data)

 $: dbData = data?.map((item: any) => ({
    employee: `Id: ${item.emp_id}`,
    masks: item.wearing_mask,
    gloves: item.wearing_gloves,
    hairnet: item.wearing_hair_net,
    uniform: item.wearing_uniform,
    apron: item.wearing_apron,
    videoLink: 'Link',
    videourl: item.img_link
  }))

  $: dataa = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = dataa.subscribe(set);
    return unsubscribe;
  });

    $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: 100 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string, value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

$: columns = table.createColumns([
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "masks",
      header: "Masks",
    }),
    table.column({
      accessor: "gloves",
      header: "Gloves",
    }),
    table.column({
      accessor: "hairnet",
      header: "Hairnet",
    }),
    table.column({
      accessor: "uniform",
      header: "Uniform",
    }),
    table.column({
      accessor: "apron",
      header: "Apron",
    }),
    table.column({
      accessor: "videoLink",
      header: "Image Link",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns));

</script>

<div class="m-0">
  <Table.Root {...$tableAttrs} class="w-full">
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row class="bg-transparent flex flex-row border-b items-center justify-between">
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                {#if cell.id === 'chevron'}
                <p class='w-1/5'></p>
                {:else}
                <Table.Head {...attrs} class="text-[#727272] whitespace-nowrap text-sm h-full flex items-start text-start justify-start py-2 w-[14.285%]">
                  <Button variant="ghost" on:click={props.sort.toggle} class="hover:bg-transparent text-[#727272] opacity-60 text-xs">
                    <Render of={cell.render()} />
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </Table.Head>
                {/if}
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
   <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs} class="border-b flex items-center w-full justify-between">
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs} class='flex items-center justify-center whitespace-nowrap flex-1 py-2 w-[14.285%] text-center'>
                  {#if cell.id === 'employee'}
                    <div class="flex items-center gap-2 text-center">
                      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-center">
                        <User class="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{row.original.employee}</span>
                    </div>
                  {:else if ['masks', 'gloves', 'hairnet', 'uniform', 'apron'].includes(cell.id)}
                    {#if row.original[cell.id]}
                      <Check class="w-5 h-5 text-blue-500" />
                    {:else}
                      <X class="w-5 h-5 text-red-500" />
                    {/if}
                  {:else if cell.id === 'videoLink'}
                    <Button variant="link" class="text-red-500">
                      {row.original.videoLink}
                    </Button>
                  {:else}
                    <Render of={cell.render()} />
                  {/if}
                </Table.Cell>
              </Subscribe>
            {/each}
           
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
