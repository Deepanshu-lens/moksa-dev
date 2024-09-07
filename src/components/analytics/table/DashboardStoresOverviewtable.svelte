<script lang="ts">
  export let aisleData;
  console.log('aisledata',aisleData)
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, Store, StoreIcon, Trash2, TrendingDown, TrendingUp } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();

 const aisleNames = ['Liqour', 'Grocery', 'Clothing', 'Electronics'];

  const dbdata = aisleData.map((item: any) => {
    return {
      storeName: item.name,
      customers: item.count != null || item.count === undefined ? String(item.count) : String(Math.floor(Math.random() * 1000)),
      busyHours: item.busy_hours != null || item.busy_hours === undefined ? String(item.busy_hours)  : `${Math.floor(Math.random() * 12 + 9)}:00 - ${Math.floor(Math.random() * 12 + 9)}:00`,
      mostVisitedAisle: item.aisle_name != null || item.aisle_name === undefined ? String(item.aisle_name) : aisleNames[Math.floor(Math.random() * aisleNames.length)],
    }
  })


  function getAisleColor(aisle: string): string {
    const colors: { [key: string]: string } = {
      'Liqour': '#e6f7f5',
      'Grocery': '#e6f0ff',
      'Clothing': '#fff9e6',
      'Electronics': '#ffe6f0',
      'null': '#95ffe1',
    };
    return colors[aisle] || '#e6e6e6';
  }

  const data = writable(dbdata);

  const readableData = readable(dbdata, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
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
      accessor: "customers",
      header: "Customers",
    }),
    table.column({
      accessor: "busyHours",
      header: "Busy Hours",
    }),
    table.column({
      accessor: "mostVisitedAisle",
      header: "Most Visited Aisle",
    }),
    // table.column({
    //   accessor: "futurePrediction",
    //   header: "Future Prediction",
    // }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
</script>

<div class="m-0">
  <Table.Root {...$tableAttrs} class="w-full">
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row
            class="bg-transparent flex flex-row border-b items-center justify-between"
          >
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe
                attrs={cell.attrs()}
                let:attrs
                props={cell.props()}
                let:props
              >
                <Table.Head
                  {...attrs}
                  class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center flex-1 w-1/4"
                >
                  <Button
                    variant="ghost"
                    on:click={props.sort.toggle}
                    class="hover:bg-transparent text-[#727272] opacity-60"
                  >
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
                <Table.Cell {...attrs} class='w-1/4 flex items-center justify-center whitespace-nowrap'>
                  {#if cell.id === 'storeName'}
                    <div class="flex items-center justify-center gap-2 text-sm text-center ">
                        <Store size={16} class='flex-shrink-0'/>
                        <span class='text-sm'>{row.original.storeName}</span>
                    </div>
                  {:else if cell.id === 'mostVisitedAisle'}
                    <span class="px-2 py-1 rounded-full text-xs dark:text-black" style="background-color: {getAisleColor(row.original.mostVisitedAisle)};">
                      {row.original.mostVisitedAisle}
                    </span>
                  {:else if cell.id === 'futurePrediction'}
                    <span class="flex items-center justify-center text-center">
                      {#if row.original.futurePrediction === "uptrend"}
                        <TrendingUp />
                      {:else}
                        <TrendingDown />
                      {/if}
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
