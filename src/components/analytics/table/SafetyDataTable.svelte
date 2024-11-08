<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Check, X } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { User } from "lucide-svelte";
  import { readable, writable } from "svelte/store";
  import * as Dialog from "@/components/ui/dialog";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";

  export let safetyData;
  export let token;
  export let dateRange;
  export let selectedStore;
  export let value;

  $: console.log("safetyData", safetyData);

  // console.log($dateRange, $selectedStore)

  $: if ($dateRange || $selectedStore) {
    // console.log('here')
    currentPageIndex = 0;
  }

  let dialogOpen = false;
  let selectedImage = null;

  async function openImageDialog(imageUri) {
    dialogOpen = true;
    selectedImage = null; // Reset selectedImage before fetching
    console.log(imageUri);
    try {
      const response = await fetch("https://api.moksa.ai/stream", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: imageUri }),
      });

      if (!response.ok) {
        throw new Error("Failed to get image");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      selectedImage = imageUrl;
      console.log("Image URL:", selectedImage);
    } catch (error) {
      console.error("Error fetching image:", error);
      // Optionally, set an error state or show an error message to the user
    }
  }

  $: if (dialogOpen === false && selectedImage) {
    URL.revokeObjectURL(selectedImage);
  }

  const dispatch = createEventDispatcher();

  $: dbData =
    safetyData.data &&
    safetyData?.data?.map((item: any) => ({
      masks: item.wearing_mask,
      uniform: item.wearing_uniform,
      employee: `${item.first_name} ${item.last_name}`,
      gloves: item.wearing_gloves,
      hairnet: item.wearing_hair_net,
      breakingSOPs: "Coming Soon",
      videoLink: "Image",
      videourl: item.img_link,
      date: item.createdAt,
    }));

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({
      initialPageSize: 3,
      initialPageIndex: currentPageIndex,
    }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });
  // Employees date gloves hairnet mask uniforms images
  $: columns = table.createColumns([
    table.column({
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "date",
      header: "Date",
    }),
    table.column({
      accessor: "gloves",
      header: "Gloves",
    }),
    table.column({
      accessor: "hairnet",
      header: "Hairnet",
    }),
    table.column({
      accessor: "masks",
      header: "Masks",
    }),
    table.column({
      accessor: "uniform",
      header: "Uniform",
    }),
    // table.column({
    //   accessor: "breakingSOPs",
    //   header: "Breaking SOPs",
    // }),

    table.column({
      accessor: "videoLink",
      header: "Image",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));
  $: ({ hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page);

  let currentpage = 1;
  let currentDataCount = safetyData.data.length;
  let currentPageIndex = 0;

  const fetchMoreData = async () => {
    currentpage++;
    console.log($dateRange, $selectedStore.value);
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

    const safetyDetails = await fetch(
      `https://api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/${currentpage}/100/${$dateRange === "custom" ? start : formatDate(startDate)}/${$dateRange === "custom" ? end : formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return safetyDetails.json();
  };
  let loading = false;

  async function handlePageChange(newPageIndex) {
    $pageIndex = newPageIndex;
    currentPageIndex = newPageIndex;
    if ($pageIndex === $pageCount - 1 && currentDataCount < safetyData.total) {
      loading = true;
      const newData = await fetchMoreData();
      console.log("new data", newData);
      safetyData.data = [...safetyData.data, ...newData?.data?.data];
      currentDataCount = safetyData.data.length;
      data.set(dbData);
      loading = false;

      // table.setPageIndex(currentPageIndex);
    }
  }
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
                {#if cell.id === "chevron"}
                  <p class="w-1/5"></p>
                {:else}
                  <Table.Head
                    {...attrs}
                    class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-full"
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
    {#if loading}
      <div class="flex items-center justify-center w-full h-full min-h-[250px]">
        <Spinner />
      </div>
    {:else}
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
                    class="flex items-center justify-center whitespace-nowrap flex-1 py-2 text-center"
                  >
                    {#if cell.id === "employee"}
                      <div class="flex items-center gap-2 text-center">
                        <div
                          class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-center"
                        >
                          <User class="w-4 h-4 text-gray-600" />
                        </div>
                        <span>{row.original.employee}</span>
                      </div>
                    {:else if ["masks", "uniform", "gloves", "hairnet"].includes(cell.id)}
                      {#if row.original[cell.id] === "true"}
                        <img src="/images/tick.png" alt="tick" srcset="" class="w-5 h-5">
                      {:else if row.original[cell.id] === "false"}
                        <img src="/images/cross.png" alt="cross"  class="w-5 h-5">
                      {:else}
                        <p>{row.original[cell.id]}</p>
                      {/if}
                    {:else if cell.id === "videoLink"}
                      <Button
                        variant="link"
                        class="text-red-500"
                        on:click={() => openImageDialog(row.original.videourl)}
                      >
                        {row.original.videoLink}
                      </Button>
                    {:else if cell.id === "date"}
                      {@const date = new Date(row.original.date)}
                      {@const formattedDate = date.toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                        hour: "numeric",
                        minute: "numeric",
                      })}
                      <p>{formattedDate}</p>
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
    {/if}
  </Table.Root>
  {#if $pageCount > 1}
    <div class="flex flex-row items-center justify-center space-x-4 py-4">
      <Button
        size="sm"
        variant="outline"
        class="bg-transparent hover:bg-[#3D81FC] hover:text-white text-[#727272] gap-2"
        on:click={() => handlePageChange($pageIndex - 1)}
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
        on:click={() => handlePageChange($pageIndex + 1)}
      >
        Next
      </Button>
    </div>
  {/if}
</div>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Safety Event Image View</Dialog.Title>
    </Dialog.Header>
    <div class="flex items-center justify-center w-full h-full">
      {#if selectedImage}
        <img
          src={selectedImage}
          alt="Safety Data Image"
          class="max-w-full w-auto h-[300px] object-contain border"
        />
      {:else}
        <Spinner />
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
