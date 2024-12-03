<script lang="ts">
  import StoreDeleteDialog from "../../dialogs/StoreDeleteDialog.svelte";
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import {
    ArrowUpDown,
    Edit,
    Store,
    Trash2,
    User,
    ChevronDown,
    ChevronUp,
  } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";
  import EditStoreDialog from "@/components/dialogs/EditStoreDialog.svelte";
  export let combinedStores: any[] = [];
  export let token: string;
  export let user: any;
  export let refreshStoreData: () => void;

  const dispatch = createEventDispatcher();

  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1),
  )
    .toISOString()
    .split("T")[0];

  const expandedRowData = writable([]);

  let expandedRow = writable(null);

  async function toggleRowExpansion(rowId, moksaId) {
    if ($expandedRow === rowId) {
      expandedRow.set(null);
      expandedRowData.set([]);
    } else {
      await fetch(
        `https://dev.api.moksa.ai/store/getStoreByStoreIdWithAllDetails/${moksaId}/${oneYearAgo}/${today}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )
        .then((res) => res.json())
        .then((data) => {
          // console.log(data)
          if (data?.status === 200) {
            expandedRowData.set(data?.data);
            expandedRow.set(rowId);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  $: dbData = combinedStores.map((store) => {
    console.log(store, "store here");
    return {
      storeName: store.name,
      storeImage: store.storeImage,
      location: `${store.address}, ${store.country}`,
      storeManager: store.manager,
      managerImage: store.managerImage,
      dateOfRegistration: store.createdAt,
      camerasAssigned: store.camera_count,
      pincode: store.pincode,
      country: store.country,
      moksaId: store.id,
      lensId: store.lensId,
    };
  });

  console.log(combinedStores, "combinedStores");

  $: console.log(dbData, "db data here");

  export let searchStore: string;

  // $: console.log(searchStore)

  $: data = writable(dbData);

  $: readableData = readable([], (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: 3 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
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
      accessor: "location",
      header: "Location",
    }),
    table.column({
      accessor: "storeManager",
      header: "Store Manager",
    }),
    table.column({
      accessor: "dateOfRegistration",
      header: "Date of Registration",
    }),
    table.column({
      accessor: "camerasAssigned",
      header: "Cameras Assigned",
    }),
    table.column({
      accessor: "action",
      header: "Action",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));

  $: ({ hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page);
  $: ({ selectedDataIds } = pluginStates.select);

  $: ({ filterValue } = pluginStates.filter);

  $: $filterValue = searchStore;

  function handleRowClick(rowData) {
    dispatch("rowClick", rowData);
  }
</script>

<div class="rounded-md mt-0">
  <Table.Root
    {...$tableAttrs}
    class="border-b border-x mx-auto w-[100%] flex flex-col pb-10 rounded-md"
  >
    <Table.Header class="rounded-lg bg-[#f9f9f9]">
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
                  class="text-[#323232] whitespace-nowrap h-full flex items-center justify-center flex-1"
                >
                  <Button
                    variant="ghost"
                    on:click={props.sort.toggle}
                    class={`hover:bg-transparent text-[#323232] dark:text-white/[.8] font-semibold opacity-60 min-w-[150px] ${cell.id === "storeName" ? "text-center justify-center" : ""}`}
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
    <Table.Body {...$tableBodyAttrs} class="overflow-x-auto">
      {#each $pageRows as row (row.id)}
        <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
          <Table.Row
            {...rowAttrs}
            data-state={$selectedDataIds[row.id] && "selected"}
            class="bg-transparent flex items-center justify-between border-b border-solid border-[#e4e4e4]"
            on:click={() => handleRowClick(row.original)}
          >
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell
                  {...attrs}
                  class="whitespace-nowrap flex-1 flex items-center justify-center"
                >
                  {#if cell.id === "action"}
                    {#if user.role === "superAdmin"}
                      <span class="w-full flex items-center gap-3">
                        <EditStoreDialog
                          store={row.original}
                          {token}
                          {refreshStoreData}
                        >
                          <Button
                            class="text-[#4976F4] bg-[#4976F4]/[.1] rounded-full text-xs text-start flex items-center gap-1"
                            variant="ghost"
                          >
                            <Edit size={14} /> Modify</Button
                          >
                        </EditStoreDialog>
                        <StoreDeleteDialog
                          email={user.email}
                          name={row.original.storeName}
                          moksaId={row.original.moksaId}
                          id={row.original.lensId}
                        >
                          <Button
                            class="text-[#F44336] bg-[#F44336]/[.1] rounded-full text-xs text-start flex items-center gap-1"
                            variant="ghost"><Trash2 size={14} /> Delete</Button
                          >
                        </StoreDeleteDialog>
                      </span>
                    {:else}
                      <EditStoreDialog store={row.original} {token}>
                        <Button
                          class="text-[#4976F4] bg-[#4976F4]/[.1] rounded-full text-xs text-start flex items-center gap-1"
                          variant="ghost"
                        >
                          <Edit size={14} /> Modify</Button
                        >
                      </EditStoreDialog>
                    {/if}
                  {:else if cell.id === "dateOfRegistration"}
                    <span class="text-sm text-[#727272]">
                      {new Date(
                        row.original.dateOfRegistration,
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  {:else if cell.id === "storeName"}
                    <span
                      class="text-sm text-[#727272] flex items-center min-w-[200px] text-start justify-start gap-2"
                    >
                      <Store size={20} class="text-[#3D81FC]" />
                      {row.original.storeName}
                      <button
                        on:click|stopPropagation={() =>
                          toggleRowExpansion(row.id, row.original.moksaId)}
                        class="ml-2"
                      >
                        {#if $expandedRow === row.id}
                          <ChevronUp size={16} />
                        {:else}
                          <ChevronDown size={16} />
                        {/if}
                      </button>
                    </span>
                  {:else if cell.id === "storeManager"}
                    <span
                      class="text-sm text-[#727272] flex items-center text-start justify-start gap-2 min-w-[125px]"
                    >
                      <User size={20} class="text-[#3D81FC]" />
                      {row.original.storeManager}
                    </span>
                  {:else if cell.id === "location"}
                    <span class="text-sm text-[#727272] text-left">
                      <!-- Left-align the location text -->
                      {row.original.location}
                    </span>
                  {:else}
                    <Render of={cell.render()} />
                  {/if}
                </Table.Cell>
              </Subscribe>
            {/each}
          </Table.Row>
          {#if $expandedRow === row.id}
            <Table.Row
              class="bg-transparent grid grid-cols-4 grid-row-1 gap-4 p-4"
            >
              <div
                class="col-span-1 px-4 py-3 h-[40px] relative flex items-center gap-3 min-w-1/4"
              >
                <span>
                  <p class="text font-semibold dark:text-white text-black/[.7]">
                    Cameras in Service
                  </p>
                  <p class="dark:text-white text-black/[.7] text-xl font-bold">
                    {$expandedRowData[0].camera_count}
                  </p>
                </span>
              </div>
              <div
                class="col-span-1 px-4 py-3 h-[55px] relative flex items-center gap-3 min-w-1/4"
              >
                <span>
                  <p class="text font-semibold dark:text-white text-black/[.7]">
                    Suspicious Activities Detected
                  </p>
                  <p class="dark:text-white text-black/[.7] text-xl font-bold">
                    {$expandedRowData[0].theft_detected_count}
                  </p>
                </span>
              </div>
              <div
                class="col-span-1 px-4 py-3 h-[40px] relative flex items-center gap-3 min-w-1/4"
              >
                <span>
                  <p class="text font-semibold dark:text-white text-black/[.7]">
                    Incidents Cleared by Operator
                  </p>
                  <p class="dark:text-white text-black/[.7] text-xl font-bold">
                    {$expandedRowData[0]
                      .theft_prevented_count}/{$expandedRowData[0]
                      .theft_detected_count}
                  </p>
                </span>
              </div>
            </Table.Row>
          {/if}
        </Subscribe>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
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
