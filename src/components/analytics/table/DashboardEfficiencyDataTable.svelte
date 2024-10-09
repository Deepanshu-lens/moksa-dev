<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import {
    ArrowUpDown,
    Edit,
    Store,
    StoreIcon,
    Trash2,
    TrendingDown,
    TrendingUp,
    User,
  } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";

  const dispatch = createEventDispatcher();

  export let efficiency;
  export let token;
  export let dateRange;
  export let selectedStore;
  export let value;
  let currentpage = 1;
  let currentDataCount = 0;
  let currentPageIndex = 0;
  let loading = false;

  console.log(efficiency.total);

  const fetchMoreData = async () => {
    currentpage++;
    // console.log($dateRange, $selectedStore.value);
    const today = new Date();
    let startDate = new Date(today);

    switch ($dateRange) {
      case "7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "15 Days":
        startDate.setDate(today.getDate() - 15);
        break;
      case "30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "12 Months":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }
    // console.log(value);
    const start = value?.start
      ? `${value.start.year}-${String(value.start.month).padStart(2, "0")}-${String(value.start.day).padStart(2, "0")}`
      : "";
    const end = value?.end
      ? `${value.end.year}-${String(value.end.month).padStart(2, "0")}-${String(value.end.day).padStart(2, "0")}`
      : "";

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    // console.log(currentpage);
    const efficiency = await fetch(
      `https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${$selectedStore.value}/${$dateRange === "custom" ? start : formatDate(startDate)}/${currentpage}/100/${$dateRange === "custom" ? end : formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return efficiency.json();
  };
  // console.log("dashboard efficiency", efficiency.total);

  $: dbData = efficiency.data.map((item) => {
    return {
      employee: `${item.first_name} ${item.last_name}`,
      customer: item.customer,
      idle: item.idle,
      mobile: item.mobile,
      fillingShelves: item.fillingShelves,
    };
  });

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({
      initialPageIndex: currentPageIndex,
      initialPageSize: 5,
    }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  async function handlePageChange(newPageIndex) {
    $pageIndex = newPageIndex;
    currentPageIndex = newPageIndex;

    if ($pageIndex === $pageCount - 1 && currentDataCount < efficiency.total) {
      loading = true;
      const newData = await fetchMoreData();
      console.log("new data", newData);
      efficiency.data = [...efficiency.data, ...newData?.data?.data];
      currentDataCount = efficiency.data.length;
      data.set(dbData); // Update the data store
      console.log(currentPageIndex);
      loading = false;
      table = createTable(readableData, {
        page: addPagination({
          initialPageIndex: currentPageIndex + 1,
          initialPageSize: 5,
        }),
        sort: addSortBy(),
        filter: addTableFilter({
          fn: ({
            filterValue,
            value,
          }: {
            filterValue: string;
            value: string;
          }) => value.toLowerCase().includes(filterValue.toLowerCase()),
        }),
        select: addSelectedRows(),
      });
    }
  }

  $: columns = table.createColumns(
    efficiency.column
      .filter(
        (col) =>
          ![
            "store_id",
            "first_name",
            "last_name",
            "role",
            "efficiency_score",
          ].includes(col.key),
      )
      .map((col) =>
        table.column({
          accessor: col.key === "employee_id" ? "employee" : col.key,
          header: col.header,
        }),
      ),
  );

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));
  $: ({ hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page);
  $: ({ selectedDataIds } = pluginStates.select);
</script>

<div class="m-0">
  {#if loading}
    <div class="flex items-center justify-center w-full h-full min-h-[200px]">
      <Spinner />
    </div>
  {:else}
    <Table.Root {...$tableAttrs} class="w-full">
      <Table.Header>
        {#each $headerRows as headerRow}
          <Subscribe rowAttrs={headerRow.attrs()}>
            <Table.Row
              class="bg-transparent flex flex-row border-b items-center"
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
                    class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center text-start flex-1 py-2 px-4 w-full"
                  >
                    <!-- <span class="font-semibold text-sm">
                      <Render of={cell.render()} />
                    </span> -->
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
            <Table.Row {...rowAttrs} class="border-b flex items-center w-full">
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <Table.Cell
                    {...attrs}
                    class="flex-1 flex items-center justify-center py-2 px-4 w-full text-center"
                  >
                    {#if cell.id === "employee"}
                      <div class="flex items-center gap-2">
                        <!-- <img src="/path/to/avatar.png" alt="Avatar" class="w-8 h-8 rounded-full" /> -->
                        <User class="size-5 text-blue-500 " />
                        <span class="text-sm font-medium whitespace-nowrap"
                          >{row.original.employee}</span
                        >
                      </div>
                    {:else if cell.id === "customer"}
                      <span class="text-sm text-green-500"
                        >{row.original.customer}</span
                      >
                    {:else if cell.id === "idle"}
                      <span class="text-sm text-blue-500"
                        >{row.original.idle}</span
                      >
                    {:else if cell.id === "mobile"}
                      <span class="text-sm text-pink-500"
                        >{row.original.mobile}</span
                      >
                    {:else if cell.id === "fillingShelves"}
                      <span class="text-sm text-orange-500"
                        >{row.original.fillingShelves}</span
                      >
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
  {/if}

  {#if $pageCount > 1}
    <div class="flex flex-row items-center justify-center space-x-4 py-4">
      <Button
        size="sm"
        variant="outline"
        class="bg-transparent hover:bg-[#015a62] hover:text-white text-[#727272] gap-2"
        on:click={() => handlePageChange($pageIndex - 1)}
        disabled={!$hasPreviousPage}
      >
        Previous
      </Button>
      <div
        class="flex flex-row gap-2 items-center text-sm text-muted-foreground"
      >
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
        on:click={() => handlePageChange($pageIndex + 1)}
      >
        Next
      </Button>
    </div>
  {/if}
</div>
