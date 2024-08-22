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

  const staticData = [
    {
      name:'Store name 1',
      vegetables: { value: 45, percentage: 45, timeSpent: '1h 30m' },
      fruits: { value: 35, percentage: 30, timeSpent: '1h 15m' },
      toys: { value: 48, percentage: 48, timeSpent: '2h 15m' },
      books: { value: 25, percentage: 20, timeSpent: '1h' },
      liquor: { value: 49, percentage: 49, timeSpent: '2h 30m' },
      bread: { value: 42, percentage: 42, timeSpent: '2h' },
      washing: { value: 38, percentage: 38, timeSpent: '1h 45m' }
    },
    {
      name:'Store name 2',
      vegetables: { value: 52, percentage: 52, timeSpent: '2h 15m' },
      fruits: { value: 40, percentage: 40, timeSpent: '1h 45m' },
      toys: { value: 30, percentage: 30, timeSpent: '1h 30m' },
      books: { value: 35, percentage: 35, timeSpent: '1h 30m' },
      liquor: { value: 55, percentage: 55, timeSpent: '2h 45m' },
      bread: { value: 48, percentage: 48, timeSpent: '2h 15m' },
      washing: { value: 42, percentage: 42, timeSpent: '2h' }
    },
    {
      name:'Store name 3',
      vegetables: { value: 38, percentage: 38, timeSpent: '1h 45m' },
      fruits: { value: 45, percentage: 45, timeSpent: '2h' },
      toys: { value: 52, percentage: 52, timeSpent: '2h 30m' },
      books: { value: 30, percentage: 30, timeSpent: '1h 15m' },
      liquor: { value: 42, percentage: 42, timeSpent: '2h' },
      bread: { value: 35, percentage: 35, timeSpent: '1h 30m' },
      washing: { value: 48, percentage: 48, timeSpent: '2h 15m' }
    },
    {
      name:'Store name 4',
      vegetables: { value: 50, percentage: 50, timeSpent: '2h 30m' },
      fruits: { value: 42, percentage: 42, timeSpent: '2h' },
      toys: { value: 35, percentage: 35, timeSpent: '1h 45m' },
      books: { value: 40, percentage: 40, timeSpent: '1h 45m' },
      liquor: { value: 45, percentage: 45, timeSpent: '2h 15m' },
      bread: { value: 52, percentage: 52, timeSpent: '2h 30m' },
      washing: { value: 30, percentage: 30, timeSpent: '1h 30m' }
    },
    {
      name:'Store name 5',
      vegetables: { value: 42, percentage: 42, timeSpent: '2h' },
      fruits: { value: 48, percentage: 48, timeSpent: '2h 15m' },
      toys: { value: 40, percentage: 40, timeSpent: '2h' },
      books: { value: 45, percentage: 45, timeSpent: '2h' },
      liquor: { value: 35, percentage: 35, timeSpent: '1h 45m' },
      bread: { value: 30, percentage: 30, timeSpent: '1h 30m' },
      washing: { value: 52, percentage: 52, timeSpent: '2h 30m' }
    },
]


  const data = writable(staticData);

  const readableData = readable(staticData, (set) => {
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
    accessor: "name",
    header: "Name",
  }),
  table.column({
    accessor: "aisle",
    header: "Aisle",
  }),
  table.column({
    accessor: "vegetables",
    header: "Vegetables",
  }),
  table.column({
    accessor: "fruits",
    header: "Fruits",
  }),
  table.column({
    accessor: "toys",
    header: "Toys",
  }),
  table.column({
    accessor: "books",
    header: "Books",
  }),
  table.column({
    accessor: "liquor",
    header: "Liquor",
  }),
  table.column({
    accessor: "bread",
    header: "Bread",
  }),
  table.column({
    accessor: "washing",
    header: "Washing",
  }),
]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
</script>

<div class="m-0">
 <Table.Root {...$tableAttrs} class="w-full">
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row class="bg-transparent flex flex-row border-b items-center justify-between">
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                <Table.Head {...attrs} class="text-[#727272] whitespace-nowrap text-sm h-full flex items-start text-start justify-start py-2 w-[14.285%]">
                  <Button variant="ghost" on:click={props.sort.toggle} class="hover:bg-transparent text-[#727272] opacity-60 text-xs">
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
          <Table.Row {...rowAttrs} class="border-b flex items-center w-full justify-between">
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs} class='flex flex-col items-center justify-center whitespace-nowrap flex-1 p-0 w-[14.285%] text-center'>
                  {#if cell.id === 'name'}
                    <div class="flex items-center space-x-2">
                      <StoreIcon class="w-6 h-6 text-blue-500" />
                      <span>{row.original.name}</span>
                    </div>
                  {:else if ['vegetables', 'fruits', 'toys', 'books', 'liquor', 'bread', 'washing','aisle'].includes(cell.id)}
                  {#if cell.id === 'aisle'}
                  <div class="flex flex-col items-center w-full h-full">
                    <span class='text-[#00051D] w-full h-full font-medium text-xs bg-[#F9F9F9] border-[#eaecfo] border-2 p-2'>No.of People</span>
                    <span class='text-[#00051D] w-full h-full font-medium text-xs bg-[#F9F9F9] border-[#eaecfo] border-2 p-2'>Time Spent</span>
                  </div>
                  {:else}
                    <div class="flex flex-col items-center w-full">
                      <div class="flex justify-center item-center w-full gap-3 p-2">
                          <span class="font-bold">{row.original[cell.id].value}</span>
                        <span class="bg-blue-500 text-white text-sm px-2 rounded">{row.original[cell.id].percentage}%</span>
                      </div>
                      <div class="flex justify-center w-full p-2">
                        <span>{row.original[cell.id].timeSpent}</span>
                      </div>
                    </div>
                  {/if}
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
