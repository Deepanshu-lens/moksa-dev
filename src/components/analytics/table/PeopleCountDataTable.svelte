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

  export let selectedStore;
  export let storeData;
  export let token;
  export let dateRange;
  export let value;

  $: console.log("people count data", $storeData);

  $: dbData =
    $selectedStore.value !== -1
      ? $storeData.map((item: any) => {
          return {
            storeName: item.store,
            customerCount: item.noofcustomers,
            date:
              item.date && item.hour
                ? `${item.date}, ${item.hour}`
                : item.date
                  ? item.date
                  : "N/A",
            busyHourProjections: "Coming Soon",
          };
        })
      : $storeData.map((item: any) => {
          return {
            storeName: item.store,
            customerCount: item.noofcustomers,
            busyHourProjections: item.busyhour,
            customerProjection: item.predicted_percentage,
            predictedMean: item.predictedmean,
            store_id: item.store_id,
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

  $: columns =
    $selectedStore.value !== -1
      ? table.createColumns([
          table.column({
            accessor: "storeName",
            header: "Store Name",
          }),
          table.column({
            accessor: "date",
            header: "Date, Hours",
          }),
          table.column({
            accessor: "customerCount",
            header: "Coming In",
          }),
          table.column({
            accessor: "busyHourProjections",
            header: "Busy Hour Projections",
          }),
        ])
      : table.createColumns([
          table.column({
            accessor: "storeName",
            header: "Store Name",
          }),
          table.column({
            accessor: "customerCount",
            header: "Coming In",
          }),
          table.column({
            accessor: "busyHourProjections",
            header: "Busy Hour Projections",
          }),
          table.column({
            accessor: "customerProjection",
            header: "Customer Projections",
          }),
          table.column({
            accessor: "chevron",
            header: "Chevron",
          }),
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

  let expandedRows = new Set();
  let expandedData = {};

  async function fetchExpandedData(storeId) {
    const today = new Date();
    let startDate = new Date(today);

    switch ($dateRange) {
      case "7":
        startDate.setDate(today.getDate() - 7);
        break;
      case "30":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    console.log(formatDate(startDate));
    console.log(formatDate(today));
    console.log($dateRange);
    console.log(storeId);
    console.log(token);
    try {
      // Call the three APIs
      const d = await fetch(
        `https://api.moksa.ai/people/getPeopleCount/${storeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            datetype: $dateRange,
            pagenumber: 1,
            pagepersize: 100,
          },
        },
      );
      const peopleCount = await d.json();
      console.log(peopleCount);
      return peopleCount;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function toggleRow(storeId) {
    if (expandedRows.has(storeId)) {
      expandedRows.delete(storeId);
      expandedData = { ...expandedData, [storeId]: null };
    } else {
      expandedRows.add(storeId);
      expandedData = { ...expandedData, [storeId]: null };
      if (!expandedData[storeId]) {
        fetchExpandedData(storeId).then((data) => {
          console.log(data);
          expandedData[storeId] = data?.data?.data;
          expandedData = expandedData;
        });
      }
    }
    expandedRows = expandedRows;
  }

  // $: console.log(expandedRows.size);
  // $: console.log(expandedData);
  // $: if ($dateRange && expandedRows.size > 0) {
  //   console.log("clearing");
  //   expandedRows.clear();
  //   expandedData = {};
  // }
  // $: console.log(expandedData);
</script>

<div class="m-0 flex flex-col">
  <span
    class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
  >
    <p class=" text-xl font-semibold flex items-center gap-2">
      {$selectedStore.label}
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
                    class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-1/5"
                  >
                    <Button
                      variant="ghost"
                      on:click={props.sort.toggle}
                      class={cell.id === "storeName"
                        ? "hover:bg-transparent text-[#727272] opacity-60 text-xs min-w-[200px] flex justify-start"
                        : "hover:bg-transparent text-[#727272] opacity-60 text-xs"}
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
    {#if $storeData.length > 0}
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
                    class="flex items-center justify-center whitespace-nowrap flex-1 py-2 w-full"
                  >
                    {#if cell.id === "storeName"}
                      <div
                        class="flex items-center gap-2 min-w-[200px] justify-start"
                      >
                        <div
                          class="w-8 h-8 rounded text-start bg-blue-900 flex items-center justify-center flex-shrink-0"
                        >
                          <Store class="w-4 h-4 text-white" />
                        </div>
                        <span>{row.original.storeName}</span>
                      </div>
                    {:else if cell.id === "customerProjection"}
                      <div class="flex items-center gap-2">
                        <span class="text-gray-600"
                          >{row.original.predictedMean}</span
                        >
                        <div
                          class={`px-2 py-1 rounded ${row.original.customerProjection < 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                        >
                          {#if row.original.customerProjection > 0}
                            <TrendingUp class="w-4 h-4 inline mr-1" />
                          {:else}
                            <TrendingDown class="w-4 h-4 inline mr-1" />
                          {/if}
                          {row.original.customerProjection}%
                        </div>
                      </div>
                    {:else if cell.id === "chevron"}
                      <!-- <ChevronRight class="w-5 h-5 text-gray-400" /> -->
                      <Button
                        variant="ghost"
                        size="icon"
                        on:click={() => toggleRow(row.original.store_id)}
                      >
                        <ChevronRight
                          class={`w-5 h-5 text-gray-400 ${
                            expandedRows.has(row.original.store_id)
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      </Button>
                    {:else}
                      <Render of={cell.render()} />
                    {/if}
                  </Table.Cell>
                </Subscribe>
              {/each}
            </Table.Row>
            {#if expandedRows.has(row.original.store_id)}
              <Table.Row class="bg-gray-50 w-full">
                <Table.Cell colspan={columns.length} class="w-full">
                  {#if expandedRows.has(row.original.store_id)}
                    <Table.Row class="bg-gray-50 w-full">
                      <!-- <Table.Cell
                        colspan={columns.length}
                        class="w-full bg-pink-900"
                      > -->
                      {#if expandedData[row.original.store_id]}
                        <div class="p-4 w-[85vw] max-h-[150px] overflow-y-auto">
                          <h3 class="font-bold mb-2">Detailed Information</h3>
                          <table class="w-full border-collapse">
                            <thead class="w-full">
                              <tr
                                class="w-full flex flex-row items-center justify-between"
                              >
                                <th class=" p-2 w-full">Date</th>
                                <th class=" p-2 w-full">Hour</th>
                                <th class=" p-2 w-full">Customer Count</th>
                                <th class=" p-2 w-full">Going Out Count</th>
                              </tr>
                            </thead>
                            <tbody class="w-full">
                              {#each expandedData[row.original.store_id] as item}
                                <tr
                                  class="w-full flex flex-row items-center justify-between"
                                >
                                  <td class=" p-2 w-full text-center"
                                    >{item.date}</td
                                  >
                                  <td class=" p-2 w-full text-center"
                                    >{item.hour}</td
                                  >
                                  <td class=" p-2 w-full text-center"
                                    >{item.noofcustomers}</td
                                  >
                                  <td class=" p-2 w-full text-center"
                                    >{item.going_out_count}</td
                                  >
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      {:else}
                        <div class="p-4">Loading...</div>
                      {/if}
                      <!-- </Table.Cell> -->
                    </Table.Row>
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/if}
          </Subscribe>
        {/each}
      </Table.Body>
    {:else}
      <!-- <span
        class="rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4"
      >
        <p class=" text-xl font-semibold flex items-center gap-2">
          {$selectedStore.label}
        </p>
      </span> -->
      <!-- <p class="flex items-center justify-center h-[100px]">No data</p> -->
      {#each $headerRows as headerRow}
        <Table.Row
          class="bg-transparent flex flex-row border-b items-center justify-between"
        >
          {#each headerRow.cells as cell (cell.id)}
            <p
              class="flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/4"
            >
              No data
            </p>
          {/each}
        </Table.Row>
      {/each}
    {/if}
  </Table.Root>
</div>

<!-- 
<div class="flex items-center justify-between mt-4 px-6">
    
  </div> -->
