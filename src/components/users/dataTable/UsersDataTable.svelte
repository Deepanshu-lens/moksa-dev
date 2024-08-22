<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, StoreIcon, Trash2, User } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";

  const dispatch = createEventDispatcher();

  // Static data
  const staticData = [
    {
      username: "John Doe",
      userImage: "https://example.com/john-doe.jpg",
      email: "john.doe@example.com",
      designation: "Manager",
      dateOfRegistration: "2024-03-15T12:00:00Z",
      storeName: "Store A",
      storesAssigned: 3,
      action: "Edit",
    },
    // Add more static data entries here
  ];


  const data = writable(staticData);

  const readableData = readable([], (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 5 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  const columns = table.createColumns([
    table.column({
      accessor: "username",
      header: "Username",
    }),
    table.column({
      accessor: "designation",
      header: "Designation",
    }),
    table.column({
      accessor: "dateOfRegistration",
      header: "Date of Registration",
    }),
    table.column({
      accessor: "storeName",
      header: "Store Name",
    }),
    table.column({
      accessor: "storesAssigned",
      header: "Stores Assigned",
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
                  class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center flex-1"
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
                      <Button
                        class="text-[#4976F4] bg-[#4976F4]/[.1] rounded-2xl text-xs text-start flex items-center gap-1"
                        variant="ghost"
                      >
                        <Edit size={14} /> Modify</Button
                      >
                      <Button
                        class="text-[#F44336] bg-[#F44336]/[.1] rounded-2xl text-xs text-start flex items-center gap-1"
                        variant="ghost"><Trash2 size={14} /> Delete</Button
                      >
                    </span>
                  {:else if cell.id === "username"}
                    <span class="flex items-center gap-2">
                      <!-- <img
                        src={row.original.userImage}
                        alt={row.original.username}
                        class="size-7 rounded-full object-cover"
                      /> -->
                      <User size={26} class="text-[#4976F4]" />
                      <span class="flex flex-col gap-1">
                        <p class="text-sm font-medium">
                          {row.original.username}
                        </p>
                        <p class="text-sm text-[#727272]">
                          {row.original.email}
                        </p>
                      </span>
                    </span>
                    {:else if cell.id === 'dateOfRegistration'}
                    <span class="text-sm text-[#727272]">
                      {new Date(row.original.dateOfRegistration).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {:else if cell.id === 'storeName'}
                    <span class="text-sm text-[#727272] flex items-center gap-2">
                      <StoreIcon size={16} />
                      {row.original.storeName}
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
