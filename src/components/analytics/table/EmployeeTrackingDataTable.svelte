<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Edit, Store, StoreIcon, Trash2, TrendingDown, TrendingUp } from "lucide-svelte";
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
  export let d: any;

  console.log(d)

  const dbData = d.map((item: any) => {
    return {
      employee: `${item.first_name} ${item.last_name}`,
      storeName: item.storeName,
      loginTime: item.loginTime,
      withCustomers: String(item.customer),
      onMobile: String(item.mobile),
      sittingIdle: String(item.idle),
      fillingShelf: '02:24:26',
      efficiencyScore: 69,
    }
  })
  // Static data
  // const staticData = [
  //    {
  //     employee: "Charles Gracia",
  //     storeName: "Store 01",
  //     loginTime: "04:54:19 PM",
  //     withCustomers: "02:24:26",
  //     onMobile: "02:24:26",
  //     sittingIdle: "02:24:26",
  //     fillingShelf: "02:24:26",
  //     efficiencyScore: 70,
  //   },
  //   {
  //     employee: "Emma Johnson",
  //     storeName: "Store 02",
  //     loginTime: "08:30:45 AM",
  //     withCustomers: "03:15:12",
  //     onMobile: "01:45:33",
  //     sittingIdle: "00:45:18",
  //     fillingShelf: "01:30:55",
  //     efficiencyScore: 85,
  //   },
  //   {
  //     employee: "Michael Chen",
  //     storeName: "Store 03",
  //     loginTime: "11:20:37 AM",
  //     withCustomers: "01:55:48",
  //     onMobile: "00:30:22",
  //     sittingIdle: "01:10:41",
  //     fillingShelf: "03:45:09",
  //     efficiencyScore: 78,
  //   },
  //   {
  //     employee: "Sarah Davis",
  //     storeName: "Store 01",
  //     loginTime: "02:15:56 PM",
  //     withCustomers: "04:10:33",
  //     onMobile: "00:55:17",
  //     sittingIdle: "00:30:45",
  //     fillingShelf: "01:15:28",
  //     efficiencyScore: 92,
  //   },
  //   {
  //     employee: "Robert Wilson",
  //     storeName: "Store 04",
  //     loginTime: "07:45:22 AM",
  //     withCustomers: "02:30:15",
  //     onMobile: "01:20:48",
  //     sittingIdle: "01:45:36",
  //     fillingShelf: "02:55:19",
  //     efficiencyScore: 68,
  //   },
  // ];

  function getAisleColor(aisle: string): string {
    const colors: { [key: string]: string } = {
      'Liqour': '#e6f7f5',
      'Grocery': '#e6f0ff',
      'Clothing': '#fff9e6',
      'Electronics': '#ffe6f0',
    };
    return colors[aisle] || '#e6e6e6';
  }

  const data = writable(dbData);

  const readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  const table = createTable(readableData, {
    page: addPagination({ initialPageSize: 20 }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string, value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  const columns = table.createColumns([
    table.column({
      id: 'select',
      header: '',
      cell: ({ row }) => row.select,
    }),
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "storeName",
      header: "Store Name",
    }),
    table.column({
      accessor: "loginTime",
      header: "Login Time",
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
                  class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center flex-1 w-[11.11px]"
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
          <Table.Row {...rowAttrs} class="border-b flex items-center w-full justify-between">
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs} class='flex items-center justify-center whitespace-nowrap w-[11.11%]'>
                  {#if cell.id === 'select'}
                    <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600" />
                  {:else if cell.id === 'employee'}
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User class="w-4 h-4 text-gray-500" />
                      </div>
                      <span>{row.original.employee}</span>
                    </div>
                  {:else if cell.id === 'storeName'}
                    <div class="flex items-center justify-center gap-2">
                      <Store class="w-4 h-4" />
                      <span>{row.original.storeName}</span>
                    </div>
                  {:else if cell.id === 'efficiencyScore'}
                    <div class="relative w-10 h-10">
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
