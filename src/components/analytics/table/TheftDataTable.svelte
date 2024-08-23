<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, Play, Store, StoreIcon, Trash2, TrendingDown, TrendingUp, User } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();
  export let theftData;

  $: console.log('Table data updated:', $theftData);

  const dbData = $theftData.data.map(item => {

  const createdDate = item?.createdAt ? new Date(item?.createdAt) : null;
  const formattedDate = createdDate ? createdDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }): 'N/A';
  const formattedTime = createdDate ? createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : 'N/A';

  return {
    storeName: item.name || 'N/A',
    employee: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'N/A',
    date: formattedDate,
    videoLink: "Watch Video",
    videoUri: item.video_uri,
    time: formattedTime,
    theftProbability: item.theftProbability,
  };
});
 
  const data = writable(dbData);

  const readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 7 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string, value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  const columns = table.createColumns([
    table.column({
      accessor: "storeName",
      header: "Store Name",
    }),
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "date",
      header: "Date",
    }),
    table.column({
      accessor: "videoLink",
      header: "Video Link",
    }),
    table.column({
      accessor: "time",
      header: "Time",
    }),
    // table.column({
    //   accessor: "callHistory",
    //   header: "Call History",
    // }),
    // table.column({
    //   accessor: "duration",
    //   header: "Duration",
    // }),
  ]);


      const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);

  const { hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page;
  const { selectedDataIds } = pluginStates.select;

  function handleRowClick(rowData) {
    dispatch("rowClick", rowData);
  }
</script>

<div class="m-0">
 <Table.Root {...$tableAttrs} class="w-full">
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row class="bg-transparent flex flex-row border-b items-center">
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                <Table.Head {...attrs} class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center flex-1 w-[14.285%]">
                  <Button variant="ghost" on:click={props.sort.toggle} class="hover:bg-transparent text-[#727272] opacity-60">
                    <Render of={cell.render()} />
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <Table.Body {...$tableBodyAttrs}>
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row {...rowAttrs} class="border-b flex items-center w-full">
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs} class='flex w-[14.285%] items-center justify-center flex-1 whitespace-nowrap py-2'>
                  {#if cell.id === 'storeName'}
                    <div class="flex items-center gap-2 text-sm">
                      <Store class="text-blue-600" />
                      <span>{row.original.storeName}</span>
                    </div>
                  {:else if cell.id === 'employee'}
                    <div class="flex items-center gap-2">
                      <!-- <img src="/path-to-employee-image.jpg" alt={row.original.employee} class="w-8 h-8 rounded-full" /> -->
                       <User size=20/>
                      <span>{row.original.employee}</span>
                    </div>
                  {:else if cell.id === 'videoLink'}
                    <Button variant="link" class="text-red-500 p-0 flex items-center gap-2">
                        <Play size={16}/>
                      {row.original.videoLink}
                    </Button>
                  {:else if cell.id === 'callHistory'}
                    <span class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      {row.original.callHistory}
                    </span>
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
<!-- <div class="flex flex-row items-center justify-center space-x-4 py-4">
  <Button
    size="sm"
    variant="outline"
    class="bg-transparent hover:bg-transparent text-[#727272] gap-2"
    on:click={() => ($pageIndex = $pageIndex - 1)}
    disabled={!$hasPreviousPage}
  >
    Previous
  </Button>
  <div class="flex flex-row gap-2 items-center text-sm text-muted-foreground">
    <span class="p-2 rounded-md aspect-square bg-[#015a62] bg-opacity-10">
      {$pageIndex + 1 < 10 ? "0" + ($pageIndex + 1) : $pageIndex + 1}
    </span>
    of
    <span class="p-2 rounded-md aspect-square bg-[#015a62] bg-opacity-20">
      {$pageCount < 10 ? "0" + $pageCount : $pageCount}
    </span> Page.
  </div>
  <Button
    size="sm"
    variant="outline"
    disabled={!$hasNextPage}
    class="bg-transparent hover:bg-transparent text-[#727272] gap-2"
    on:click={() => ($pageIndex = $pageIndex + 1)}
  >
    Next
  </Button>
</div> -->
