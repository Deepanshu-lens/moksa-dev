<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import {
    ArrowUpDown,
    ChevronRight,
    Edit,
    Store,
    StoreIcon,
    Trash2,
    TrendingDown,
    TrendingUp,
  } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import * as Select from "@/components/ui/select";
  import { User, ChevronLeft } from "lucide-svelte";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  // const staticData = [
  //   {
  //     storeName: "Store 01",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 25, trend: "up" },
  //   },
  //   {
  //     storeName: "Store 02",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 25, trend: "up" },
  //   },
  //   {
  //     storeName: "Store 03",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 15, trend: "down" },
  //   },
  //   {
  //     storeName: "Store 04",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 25, trend: "up" },
  //   },
  //   {
  //     storeName: "Store 05",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 15, trend: "down" },
  //   },
  //   {
  //     storeName: "Store 06",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 25, trend: "up" },
  //   },
  //   {
  //     storeName: "Store 07",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 25, trend: "up" },
  //   },
  //   {
  //     storeName: "Store 08",
  //     customerCount: 20,
  //     busyHourProjections: "8:00 am - 9:00 pm",
  //     customerProjection: { value: 422, percentage: 15, trend: "down" },
  //   },
  // ];

  export let storeData;

  // console.log($storeData);

  $: dbData = $storeData.map((item: any) => {
    return {
      storeName: item.store,
      customerCount: item.noofcustomers,
      busyHourProjections: "Coming Soon",
      date: item.date,
    };
  });

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
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
      accessor: "storeName",
      header: "Store Name",
    }),
    table.column({
      accessor: "date",
      header: "Date",
    }),
    table.column({
      accessor: "customerCount",
      header: "Customer Count",
    }),
    table.column({
      accessor: "busyHourProjections",
      header: "Busy Hour Projections",
    }),
    // table.column({
    //   accessor: "customerProjection",
    //   header: "Customer Projection",
    // }),
    //   table.column({
    //   id: 'chevron',
    //   header: '',
    //   cell: () => '',
    // }),
  ]);

  const pageSizeOptions = [5, 10, 20, 50];

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));

  $: ({ pageIndex, hasNextPage, hasPreviousPage, pageSize } =
    pluginStates.page);

  function goToNextPage() {
    $pageIndex = $pageIndex + 1;
  }

  function goToPreviousPage() {
    $pageIndex = $pageIndex - 1;
  }

  function changePageSize(newSize: number) {
    $pageSize = newSize;
  }
</script>

<div class="m-0 flex flex-col">
  <span
    class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
  >
    <p class=" text-xl font-semibold flex items-center gap-2">
      {$storeData[0].store}
    </p>
    <div class="flex items-center gap-4">
      <!-- <div class="flex items-center space-x-2">
      <span class="text-sm text-gray-700 font-medium">Rows per page:</span>
       <Select.Root portal={null}>
          <Select.Trigger
            class="w-[50px] border text-xs px-1 border-none rounded-lg dark:bg-transparent font-medium"
          >
            <Select.Value placeholder={$pageSize} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
           {#each pageSizeOptions as option}
                <Select.Item on:click={() => changePageSize(Number(option))}
                  class="px-1"
                  value={option}
                  label={option}>{option}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
    </div> -->

      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-700"
          >{$pageIndex + 1}-{Math.min(
            ($pageIndex + 1) * $pageSize,
            $data.length,
          )} of {$data.length}</span
        >
        <div class="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            on:click={goToPreviousPage}
            disabled={!$hasPreviousPage}
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            on:click={goToNextPage}
            disabled={!$hasNextPage}
          >
            <ChevronRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </span>
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
                {#if cell.id === "chevron"}
                  <p class="w-1/5"></p>
                {:else}
                  <Table.Head
                    {...attrs}
                    class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-1/4"
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
          <Table.Row
            {...rowAttrs}
            class="border-b flex items-center w-full justify-between"
          >
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell
                  {...attrs}
                  class="flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/4"
                >
                  {#if cell.id === "storeName"}
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded text-start bg-blue-900 flex items-center justify-center"
                      >
                        <Store class="w-4 h-4 text-white" />
                      </div>
                      <span>{row.original.storeName}</span>
                    </div>
                  {:else if cell.id === "customerProjection"}
                    <div class="flex items-center gap-2">
                      <span class="text-gray-600"
                        >{row.original.customerProjection.value}</span
                      >
                      <div
                        class={`px-2 py-1 rounded ${row.original.customerProjection.trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                      >
                        {#if row.original.customerProjection.trend === "up"}
                          <TrendingUp class="w-4 h-4 inline mr-1" />
                        {:else}
                          <TrendingDown class="w-4 h-4 inline mr-1" />
                        {/if}
                        {row.original.customerProjection.percentage}%
                      </div>
                    </div>
                  {:else if cell.id === "chevron"}
                    <ChevronRight class="w-5 h-5 text-gray-400" />
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

<!-- 
<div class="flex items-center justify-between mt-4 px-6">
    
  </div> -->
