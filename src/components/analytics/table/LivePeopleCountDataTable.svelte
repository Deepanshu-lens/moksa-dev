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

  // const fakeLiveData = [
  //   { store_id: "store1", going_out: "15", going_in: "10", createdAt: "2023-04-15T09:30:00Z" },
  //   { store_id: "store2", going_out: "8", going_in: "12", createdAt: "2023-04-15T09:35:00Z" },
  //   { store_id: "store3", going_out: "20", going_in: "18", createdAt: "2023-04-15T09:40:00Z" },
  //   { store_id: "store1", going_out: "22", going_in: "25", createdAt: "2023-04-15T09:45:00Z" },
  //   { store_id: "store2", going_out: "10", going_in: "7", createdAt: "2023-04-15T09:50:00Z" },
  //   { store_id: "store3", going_out: "30", going_in: "28", createdAt: "2023-04-15T09:55:00Z" },
  //   { store_id: "store1", going_out: "18", going_in: "20", createdAt: "2023-04-15T10:00:00Z" },
  //   { store_id: "store2", going_out: "14", going_in: "16", createdAt: "2023-04-15T10:05:00Z" },
  //   { store_id: "store3", going_out: "25", going_in: "22", createdAt: "2023-04-15T10:10:00Z" },
  //   { store_id: "store1", going_out: "30", going_in: "28", createdAt: "2023-04-15T10:15:00Z" },
  // ];

  // const fakeSelectedStore = { value: "store1", label: "Main Street Store" };

  // Replace the existing liveData and selectedStore with the fake data
  export let liveData;
  export let selectedStore;
  // let liveData = fakeLiveData;
  // let selectedStore = fakeSelectedStore;

  //  $: console.log("LivePeopleCountDataTable received new data:", liveData);

  $: dbData = liveData.map((item: any) => ({
    storeName:
      item.store_id === selectedStore.value
        ? selectedStore.label
        : item.store_id,
    // customerCount: Number(item.going_out) - Number(item.going_in),
    goingIn: Number(item.going_in),
    goingOut: Number(item.going_out),
    created: item.createdAt,
  }));

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
      accessor: "goingIn",
      header: "Going In",
    }),
    table.column({
      accessor: "goingOut",
      header: "Going Out",
    }),
    table.column({
      accessor: "created",
      header: "Created At",
    }),
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
                    class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-1/3"
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
    {#if liveData.length > 0}
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
                    class={`flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/3`}
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
                      <!-- {:else if cell.id === "chevron"}
                    <ChevronRight class="w-5 h-5 text-gray-400" /> -->
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
