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

  export let liveData;
  export let selectedStore;
  export let allStores;
  export let value;
  export let dateRange;
  export let token;
  // console.log("liveData", allStores);

  $: console.log("LivePeopleCountDataTable received new data:", liveData);

  $: mapData = liveData?.data === undefined ? [] : liveData.data;

  $: console.log("mapData", mapData);

  $: dbData = mapData.map((item: any) => ({
    storeName: item.store,
    // item.store_id === selectedStore.value
    //   ? selectedStore.label
    //   : allStores.find((store) => store.id === item.store_id)?.name ||
    //     item.store_id,
    // customerCount: Number(item.going_out) - Number(item.going_in),
    customerCount: Number(item.noofcustomers),
    goingOut: Number(item.going_out_count),
    created: item.createdAt,
    busyHour: item.busyhour,
    predictedMean: item.predictedmean,
    predictedPercentage: item.predicted_percentage,
    storeId: item.store_id,
  }));

  //  {
  //     store_id: 31,
  //     store: 'Lion Stop',
  //     noofcustomers: '8',
  //     going_out_count: '16',
  //     busyhour: '05AM-06AM',
  //     predictedmean: 4,
  //     predicted_percentage: -50,
  //     total_count: '1'
  //   }

  function parseTimeString(timeString: string): string {
    const timeRanges = timeString.split(/[-to]/).map((time) => time.trim());
    return timeRanges
      .map((time) => {
        const [hour, modifier] = time.match(/(\d+)([APM]+)/).slice(1);
        const hourFormatted = hour.padStart(2, "0"); // Ensure two digits
        return `${hourFormatted}:00${modifier.toLowerCase()}`; // Append minutes and format modifier
      })
      .join("-");
  }

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: 100 }),
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
    // table.column({
    //   accessor: "customerCount",
    //   header: "Customer Count",
    // }),
    table.column({
      accessor: "customerCount",
      header: "Coming In",
    }),
    table.column({
      accessor: "busyHour",
      header: "Busy Hour Projections",
    }),
    table.column({
      accessor: "customerProjection",
      header: "Customer Projections",
    }),
    table.column({
      accessor: "goingOut",
      header: "Going Out",
    }),
    table.column({
      accessor: "chevron",
      header: "Chevron",
    }),
    // table.column({
    //   accessor: "created",
    //   header: "Created At",
    // }),
    // table.column({
    //   id: 'chevron',
    //   header: '',
    //   cell: () => '',
    // }),
  ]);

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
        `https://api.moksa.ai/people/getPeopleCountLive/${storeId}/1/100`,
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

  let expandedRows = new Set();
  let expandedData = {};

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
</script>

<div class="m-0 flex flex-col">
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
                    class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-1/6"
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
    {#if mapData.length > 0}
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
                    class={`flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/6`}
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
                    {:else if cell.id === "created"}
                      <span class="text-sm text-[#727272]">
                        {new Date(row.original.created).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          },
                        )}
                      </span>
                    {:else if cell.id === "customerProjection"}
                      <div class="flex items-center gap-2">
                        <span class="text-gray-600"
                          >{row.original.predictedMean}</span
                        >
                        <div
                          class={`px-2 py-1 rounded ${row.original.predictedMean > row.original.customerCount ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
                        >
                          <!-- {#if row.original.predictedPercentage > 0}
                            <TrendingUp class="w-4 h-4 inline mr-1" />
                          {:else}
                            <TrendingDown class="w-4 h-4 inline mr-1" />
                          {/if} -->
                          {row.original.predictedPercentage}%
                        </div>
                      </div>
                    {:else if cell.id === "chevron"}
                      <Button
                        variant="ghost"
                        size="icon"
                        on:click={() => toggleRow(row.original.storeId)}
                      >
                        <ChevronRight
                          class={`w-5 h-5 text-gray-400 ${
                            expandedRows.has(row.original.storeId)
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
            {#if expandedRows.has(row.original.storeId)}
              <Table.Row class="bg-gray-50 w-full">
                <Table.Cell colspan={columns.length} class="w-full">
                  {#if expandedRows.has(row.original.storeId)}
                    <Table.Row class="bg-gray-50 w-full">
                      <!-- <Table.Cell
                        colspan={columns.length}
                        class="w-full bg-pink-900"
                      > -->
                      {#if expandedData[row.original.storeId]}
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
                              {#each expandedData[row.original.storeId] as item}
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
      <Table.Body>
        {#each $headerRows as headerRow}
          <Table.Row
            class="bg-transparent flex flex-row border-b items-center justify-between"
          >
            {#each headerRow.cells as cell (cell.id)}
              <Table.Cell
                class="flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/4"
                >No data</Table.Cell
              >
            {/each}
          </Table.Row>
        {/each}
      </Table.Body>
    {/if}
  </Table.Root>
</div>
