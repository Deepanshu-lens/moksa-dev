<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import * as Dialog from "@/components/ui/dialog";

  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";

  export let safetyData;
  export let token;
  let dialogOpen = false;
  let selectedImage = null;
  let loading = false;

  $: console.log("safetyDataTable", safetyData);

  export let dateRange;
  export let selectedStore;
  export let value;
  let currentpage = 1;
  let currentDataCount = 0;
  let currentPageIndex = 0;

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

    const safetyDetails = await fetch(
      `https://dev.api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${$selectedStore.value}/${currentpage}/100/${$dateRange === "custom" ? start : formatDate(startDate)}/${$dateRange === "custom" ? end : formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return safetyDetails.json();
  };

  $: dbData = safetyData?.data.map((item: any) => ({
    employee: `${item.first_name} ${item.last_name}`,
    masks: item.wearing_mask,
    gloves: item.wearing_gloves,
    hairnet: item.wearing_hair_net,
    uniform: item.wearing_uniform,
    breakingSOPs: item.time_sop,
    videoLink: "Image",
    videourl: item.img_link,
  }));

  $: if ($dateRange || $selectedStore) {
    currentPageIndex = 0;
  }

  $: data = writable(dbData);

  async function openImageDialog(imageUri) {
    dialogOpen = true;
    selectedImage = null; // Reset selectedImage before fetching
    console.log(imageUri);
    try {
      const response = await fetch(
        `https://dev.api.moksa.ai/stream?key=${imageUri}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

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

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({
      initialPageIndex: currentPageIndex,
      initialPageSize: 4,
    }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  $: columns = table.createColumns([
    table.column({
      accessor: "employee",
      header: "Employee",
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
      header: "Mask",
    }),
    table.column({
      accessor: "uniform",
      header: "Uniform",
    }),
    table.column({
      accessor: "videoLink",
      header: "Image",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));
  $: ({ hasNextPage, hasPreviousPage, pageIndex, pageCount } =
    pluginStates.page);

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
    }
  }
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
                    class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center text-start flex-1 py-2 px-4 w-1/4"
                  >
                    <span class="font-semibold text-sm">
                      <Render of={cell.render()} />
                    </span>
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
                    class="flex-1 flex items-center justify-center py-2 px-4 w-1/6 text-center"
                  >
                    {#if cell.id === "employee"}
                      <div class="flex items-center gap-2 whitespace-nowrap">
                        <!-- <img src="/path/to/avatar.png" alt="Avatar" class="w-8 h-8 rounded-full" /> -->
                        <!-- <User class="size-5" /> -->
                        <span class="text-sm font-medium"
                          >{row.original.employee}</span
                        >
                      </div>
                    {:else if ["masks", "gloves", "hairnet", "uniform"].includes(cell.id)}
                      {#if row.original[cell.id] === "true"}
                        <img
                          src="/images/tick.png"
                          alt="tick"
                          srcset=""
                          class="w-5 h-5"
                        />
                      {:else if row.original[cell.id] === "false"}
                        <img
                          src="/images/cross.png"
                          alt="cross"
                          srcset=""
                          class="w-5 h-5"
                        />
                      {:else}
                        <span>{row.original[cell.id]}</span>
                      {/if}
                    {:else if cell.id === "breakingSops"}
                      <span class="text-sm">{row.original.breakingSops}</span>
                    {:else if cell.id === "videoLink"}
                      <Button
                        variant="link"
                        class="text-red-500"
                        on:click={() => openImageDialog(row.original.videourl)}
                      >
                        {row.original.videoLink}
                      </Button>
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
    <div class="flex flex-row items-center justify-center space-x-4 py-2">
      <Button
        size="sm"
        variant="outline"
        class="bg-transparent hover:bg-[#015a62] hover:text-white text-[#727272] gap-2"
        disabled={!$hasPreviousPage}
        on:click={() => handlePageChange($pageIndex - 1)}
      >
        <!-- on:click={() => ($pageIndex = $pageIndex - 1)} -->
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
        <!-- on:click={() => ($pageIndex = $pageIndex + 1)} -->
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
        <!-- svelte-ignore a11y-img-redundant-alt -->
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
