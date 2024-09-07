<script lang="ts">
	import StoreDeleteDialog from '../../dialogs/StoreDeleteDialog.svelte';
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, Store, StoreIcon, Trash2, User } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";
  import EditStoreDialog from '@/components/dialogs/EditStoreDialog.svelte'
  export let combinedStores: any[] = [];

  const dispatch = createEventDispatcher();

  // $:console.log(combinedStores)
  const managerNames = ['Sunaib Lalani', 'Bunty', 'Sanjay'];

const dbData = combinedStores.map(store => {
  return {
    storeName: store.name,
    storeImage: store.storeImage,
    location: `${store.address}, ${store.country}` === 'address, country' ? 'US' : `${store.address}, ${store.country}`,
    storeManager: store.manager === 'manager' ? managerNames[Math.floor(Math.random() * managerNames.length)] : store.manager,
    managerImage: store.managerImage,
    dateOfRegistration: store.createdAt,
    camerasAssigned: store.camera_count,
    pincode: store.pincode,
    country: store.country,
    moksaId: store.id,
    lensId: store.lensId
  }
});

export let searchStore:string;

// $: console.log(searchStore)
  const data = writable(dbData);

  const readableData = readable([], (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });
 
  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 3 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
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

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns);

  const { hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page;
  const { selectedDataIds } = pluginStates.select;

 const { filterValue } = pluginStates.filter;

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
                    class="hover:bg-transparent text-[#323232] font-semibold opacity-60"
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
                    <span class="w-full flex items-center gap-3">
                      <EditStoreDialog store={row.original}>

                        <Button
                        class="text-[#4976F4] bg-[#4976F4]/[.1] rounded-full text-xs text-start flex items-center gap-1"
                        variant="ghost"
                        >
                        <Edit size={14} /> Modify</Button
                        >
                      </EditStoreDialog>
                      <StoreDeleteDialog name={row.original.storeName} moksaId={row.original.moksaId} id={row.original.lensId}>
                        <Button
                        class="text-[#F44336] bg-[#F44336]/[.1] rounded-full text-xs text-start flex items-center gap-1"
                        variant="ghost"><Trash2 size={14} /> Delete</Button
                        >
                      </StoreDeleteDialog>
                    </span>
                    {:else if cell.id === 'dateOfRegistration'}
                    <span class="text-sm text-[#727272]">
                      {new Date(row.original.dateOfRegistration).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {:else if cell.id === 'storeName'}
                    <span class="text-sm text-[#727272] flex items-center gap-2">
                         <!-- <img
                        src={row.original.storeImage}
                        alt={row.original.storeName}
                        class="size-7  object-cover"
                      /> -->
                      <Store size={20} class='text-[#3D81FC]'/>
                      {row.original.storeName}
                    </span>
                    {:else if cell.id === 'storeManager'}
                    <span class="text-sm text-[#727272] flex items-center gap-2">
                         <!-- <img
                        src={row.original.managerImage}
                        alt={row.original.storeManager}
                        class="size-7  object-cover"
                      /> -->
                      <User size={20} class='text-[#3D81FC]'/>
                      {row.original.storeManager}
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
  <div class="flex flex-row gap-2 items-center text-sm text-muted-foreground">
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
