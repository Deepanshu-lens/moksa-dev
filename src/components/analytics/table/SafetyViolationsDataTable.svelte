<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import {
    ArrowUpDown,
    Check,
    X,
    ChevronRight,
    Edit,
    Store,
    StoreIcon,
    Trash2,
    TrendingDown,
    TrendingUp,
    File,
    FileText,
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

  export let safetyData;

  const staticData = [
    {
      employeeId: "E0001",
      employee: "Charles Gracia",
      employeeImg: "https://via.placeholder.com/150",
      sopDocument: "Charles Gracia",
      sopImage: "https://via.placeholder.com/150",
    },
    {
      employeeId: "E0002",
      employee: "Sarah Johnson",
      employeeImg: "https://via.placeholder.com/150",
      sopDocument: "Sarah Johnson",
      sopImage: "https://via.placeholder.com/150",
    },
    {
      employeeId: "E0003",
      employee: "Michael Lee",
      employeeImg: "https://via.placeholder.com/150",
      sopDocument: "Michael Lee",
      sopImage: "https://via.placeholder.com/150",
    },
    {
      employeeId: "E0004",
      employee: "Emily Rodriguez",
      employeeImg: "https://via.placeholder.com/150",
      sopDocument: "Emily Rodriguez",
      sopImage: "https://via.placeholder.com/150",
    },
    {
      employeeId: "E0005",
      employee: "David Kim",
      employeeImg: "https://via.placeholder.com/150",
      sopDocument: "David Kim",
      sopImage: "https://via.placeholder.com/150",
    },
  ];

  // $: console.log(safetyData)
    const dbData = safetyData?.map((item: any) => ({
    employee: `${item.first_name} ${item.last_name}`,
    employeeId: item.employee_id,
    sopDocument: `${item.first_name} ${item.last_name}`,
  }));

  const data = writable(dbData);

  const readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 5 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });



  const columns = table.createColumns([
    table.column({
      accessor: "employeeId",
      header: "Employee ID",
    }),
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "sopDocument",
      header: "SOP Document",
    }),
  ]);

  const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns);
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
                  class="text-[#727272] whitespace-nowrap text-sm h-full flex items-start text-start justify-start py-2 flex-1"
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
                  class="flex items-center whitespace-nowrap flex-1 py-2"
                >
                  {#if cell.id === "employee" || cell.id === "sopDocument"}
                    <div class="flex items-center gap-2 justify-center">
                      <!-- <img src="/path/to/employee-image.jpg" alt={row.original.employee} class="w-8 h-8 rounded-lg object-cover" /> -->
                      {#if cell.id === "employee"}
                      <span class='text-sm'>{row.original[cell.id]}</span>
                        <User size="20" />
                      {:else}
                        <span class='text-sm'>{row.original[cell.id]}</span>
                        <FileText size="20" />
                      {/if}
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
