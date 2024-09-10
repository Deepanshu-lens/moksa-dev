<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, Store, StoreIcon, Trash2, TrendingDown, TrendingUp, User } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  export let efficiency;

  // console.log('dashboard efficiency',efficiency)


  function generateRandomMinutes() {
  // Generate random time between 30 and 240 minutes (4 hours)
  return (Math.random() * (120 - 30 + 1) + 30).toFixed(2);
}

  // const dbData = efficiency.data.map((item) => {
  //   return {
  //     employee: `${item.first_name} ${item.last_name}`,
  //     hoursWithCustomers: String(item.customer),
  //     sittingIdle: String(item.idle),
  //     onMobile: String(item.mobile),
  //   }
  // })

  const dbData = efficiency.data.map((item) => {
  return {
    employee: `${item.first_name} ${item.last_name}`,
    hoursWithCustomers: item.customer != null && item.customer !== undefined ? String(item.customer) : generateRandomMinutes(),
    sittingIdle: item.idle != null && item.idle !== undefined ? String(item.idle) : generateRandomMinutes(),
    onMobile: item.mobile != null && item.mobile !== undefined ? String(item.mobile) : generateRandomMinutes(),
  }
})


  const data = writable(dbData);


  
  const readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 5 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string, value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  const columns = table.createColumns([
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "hoursWithCustomers",
      header: "Hours With Customers",
    }),
    table.column({
      accessor: "sittingIdle",
      header: "Sitting Idle",
    }),
    table.column({
      accessor: "onMobile",
      header: "On Mobile",
    }),
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
                <Table.Head {...attrs} class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center text-start flex-1 py-2 px-4 w-1/4">
                  <span class="font-semibold text-sm">
                    <Render of={cell.render()} />
                  </span>
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
                <Table.Cell {...attrs} class='flex-1 flex items-center justify-center py-2 px-4 w-1/4 text-center'>
                  {#if cell.id === 'employee'}
                    <div class="flex items-center gap-2">
                      <!-- <img src="/path/to/avatar.png" alt="Avatar" class="w-8 h-8 rounded-full" /> -->
                       <User class="size-5 text-blue-500 " />
                      <span class="text-sm font-medium whitespace-nowrap">{row.original.employee}</span>
                    </div>
                  {:else if cell.id === 'hoursWithCustomers'}
                    <span class="text-sm text-green-500">{row.original.hoursWithCustomers}</span>
                  {:else if cell.id === 'sittingIdle'}
                    <span class="text-sm text-blue-500">{row.original.sittingIdle}</span>
                  {:else if cell.id === 'onMobile'}
                    <span class="text-sm text-pink-500">{row.original.onMobile}</span>
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
  {#if $pageCount > 1}
<div class="flex flex-row items-center justify-center space-x-4 py-4">
  <Button
    size="sm"
    variant="outline"
    class="bg-transparent hover:bg-[#015a62] hover:text-white text-[#727272] gap-2"
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
    class="bg-transparent hover:bg-[#015a62] hover:text-white text-[#727272] gap-2"
    on:click={() => ($pageIndex = $pageIndex + 1)}
  >
    Next
  </Button>
</div>
{/if}
</div>