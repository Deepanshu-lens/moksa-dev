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
  } from "lucide-svelte";
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
  export let efficiencyData;
  export let selectedStore;

  $: console.log("emp table", $efficiencyData.data.data);

  $: dbData = $efficiencyData.data.data.map((item: any) => {
    return {
      employee: `${item.first_name} ${item.last_name}`,
      storeName: item.storeName === undefined ? $selectedStore : item.storeName,
      role: item.role,
      withCustomers: item.customer,
      onMobile: item.mobile,
      sittingIdle: item.idle,
      fillingShelf: item.fillingShelves,
      efficiencyScore: "Coming Soon",
    };
  });

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: 3 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  $: columns = table.createColumns([
    // table.column({
    //   id: 'select',
    //   header: '',
    //   cell: ({ row }) => row.select,
    // }),
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "storeName",
      header: "Store Name",
    }),
    table.column({
      accessor: "role",
      header: "Role",
    }),
    table.column({
      accessor: "withCustomers",
      header: "With Customers",
    }),
    table.column({
      accessor: "onMobile",
      header: "On Mobile",
    }),
    table.column({
      accessor: "sittingIdle",
      header: "Sitting Idle",
    }),
    table.column({
      accessor: "fillingShelf",
      header: "Filling Shelves",
    }),
    table.column({
      accessor: "efficiencyScore",
      header: "Efficiency Score",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));
  $: ({ hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page);
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
                  class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center w-full"
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
          <Table.Row
            {...rowAttrs}
            class="border-b flex items-center w-full justify-between"
          >
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell
                  {...attrs}
                  class="flex items-center justify-center whitespace-nowrap w-full"
                >
                  {#if cell.id === "select"}
                    <input
                      type="checkbox"
                      class="form-checkbox h-4 w-4 text-blue-600"
                    />
                  {:else if cell.id === "employee"}
                    <div class="flex items-center gap-2">
                      <div
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <User class="w-4 h-4 text-gray-500" />
                      </div>
                      <span>{row.original.employee}</span>
                    </div>
                  {:else if cell.id === "storeName"}
                    <div class="flex items-center justify-center gap-2">
                      <Store class="w-4 h-4" />
                      <span>{row.original.storeName}</span>
                    </div>
                    <!-- {:else if cell.id === 'efficiencyScore'} -->
                    <!-- <div class="relative w-10 h-10">
                      <svg class="w-10 h-10" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          stroke-width="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3B82F6"
                          stroke-width="3"
                          stroke-dasharray={`${row.original.efficiencyScore}, 100`}
                        />
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-xs scale-90 font-semibold">
                        {row.original.efficiencyScore}%
                      </span>
                    </div> -->
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
        class="bg-transparent hover:bg-[#3D81FC] hover:text-white text-[#727272] gap-2"
        on:click={() => ($pageIndex = $pageIndex - 1)}
        disabled={!$hasPreviousPage}
      >
        Previous
      </Button>
      <div
        class="flex flex-row gap-2 items-center text-sm text-muted-foreground"
      >
        <span class="p-2 rounded-md aspect-square bg-[#3D81FC] bg-opacity-10">
          {$pageIndex + 1 < 10 ? "0" + ($pageIndex + 1) : $pageIndex + 1}
        </span>
        of
        <span class="p-2 rounded-md aspect-square bg-[#3D81FC] bg-opacity-20">
          {$pageCount < 10 ? "0" + $pageCount : $pageCount}
        </span> Page.
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={!$hasNextPage}
        class="bg-transparent hover:bg-[#3D81FC] hover:text-white text-[#727272] gap-2"
        on:click={() => ($pageIndex = $pageIndex + 1)}
      >
        Next
      </Button>
    </div>
  {/if}
</div>
