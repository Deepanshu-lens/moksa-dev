<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, StoreIcon } from "lucide-svelte";
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

  export let aisleData: any;

  // Static data

  $: apiData = $aisleData;
  //         count: 40,
  //         timespent: null,
  //         percentage: 13.25,
  //       },
  //       re: {
  //         count: 20,
  //         timespent: null,
  //         percentage: 6.62,
  //       },
  //       veg: {
  //         count: 40,
  //         timespent: null,
  //         percentage: 13.25,
  //       },
  //       footwear: {
  //         count: 40,
  //         timespent: null,
  //         percentage: 13.25,
  //       },
  //       ornaments: {
  //         count: 162,
  //         timespent: "01hr 05m 02s",
  //         percentage: 53.64,
  //       },
  //     },
  //     total_people_count: "302",
  //     totalcount: "1",
  //   },
  // ];
  $: console.log(apiData);
  $: data = writable(apiData);

  $: readableData = readable(apiData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: 5 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  $: columns = table.createColumns([
    table.column({
      accessor: "store_name",
      header: "Name",
    }),
    table.column({
      accessor: "aisle",
      header: "Aisle",
    }),
    ...Object.keys(apiData[0].aisle_details).map((aisle) =>
      table.column({
        accessor: aisle,
        header: aisle.charAt(0).toUpperCase() + aisle.slice(1),
      }),
    ),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns));
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
                  class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-full"
                >
                  <Button
                    variant="ghost"
                    on:click={props.sort.toggle}
                    class="hover:bg-transparent text-[#727272] opacity-60 text-xs"
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
          <Table.Row
            {...rowAttrs}
            class="border-b flex items-center w-full justify-between"
          >
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell
                  {...attrs}
                  class="flex flex-col items-center justify-center whitespace-nowrap flex-1 p-0 w-full text-center"
                >
                  {#if cell.id === "store_name"}
                    <div class="flex items-center space-x-2">
                      <StoreIcon class="w-6 h-6 text-blue-500" />
                      <span>{row.original.store_name}</span>
                    </div>
                  {:else if cell.id === "aisle"}
                    <div class="flex flex-col items-center w-full h-full">
                      <span
                        class="text-[#00051D] w-full h-full font-medium text-xs bg-[#F9F9F9] border-[#eaecfo] border-2 p-2"
                      >
                        No. of People
                      </span>
                      <span
                        class="text-[#00051D] w-full h-full font-medium text-xs bg-[#F9F9F9] border-[#eaecfo] border-2 p-2"
                      >
                        Time Spent
                      </span>
                    </div>
                  {:else if row.original.aisle_details[cell.id]}
                    <div class="flex flex-col items-center w-full">
                      <div
                        class="flex justify-center item-center w-full gap-3 p-2"
                      >
                        <span class="font-bold">
                          {row.original.aisle_details[cell.id].count}
                        </span>
                        <span
                          class="bg-blue-500 text-white text-sm px-2 rounded"
                        >
                          {row.original.aisle_details[cell.id].percentage}%
                        </span>
                      </div>
                      <div class="flex justify-center w-full p-2">
                        <span
                          >{row.original.aisle_details[cell.id].timespent}</span
                        >
                      </div>
                    </div>
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
