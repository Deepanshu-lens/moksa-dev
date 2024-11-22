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
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import * as Dialog from "@/components/ui/dialog";
  export let token;

  const dispatch = createEventDispatcher();

  // Static data
  export let data;

  $: console.log("livetabledata", data);

  let dialogOpen = false;
  let selectedImage = null;

  async function openImageDialog(imageUri) {
    dialogOpen = true;
    selectedImage = null; // Reset selectedImage before fetching
    try {
      const response = await fetch(
        `https://api.moksa.ai/stream?key=${imageUri}`,
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

  $: if (dialogOpen === false && selectedImage) {
    URL.revokeObjectURL(selectedImage);
  }

  $: dbData = data?.map((item: any) => ({
    employee: `${item.first_name ? item.first_name + " " + item.last_name : item.emp_id}`,
    masks: item.wearing_mask,
    gloves: item.wearing_gloves,
    hairnet: item.wearing_hair_net,
    uniform: item.wearing_uniform,
    apron: "Coming Soon",
    videoLink: "Link",
    videourl: item.img_link,
    date: item.createdAt,
  }));

  $: dataa = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = dataa.subscribe(set);
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
      accessor: "employee",
      header: "Employee",
    }),
    table.column({
      accessor: "date",
      header: "Date",
    }),
    table.column({
      accessor: "masks",
      header: "Masks",
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
      accessor: "uniform",
      header: "Uniform",
    }),
    table.column({
      accessor: "videoLink",
      header: "Image Link",
    }),
  ]);

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs } =
    table.createViewModel(columns));
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
                <!-- {#if cell.id === 'chevron'}
                <p class='w-1/5'></p>
                {:else} -->
                <Table.Head
                  {...attrs}
                  class="text-[#727272] whitespace-nowrap text-sm h-full flex items-center text-center justify-center py-2 w-1/4"
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
                <!-- {/if} -->
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
                  class="flex items-center justify-center whitespace-nowrap flex-1 py-2 w-1/4 text-center"
                >
                  {#if cell.id === "employee"}
                    <div
                      class="flex items-center gap-2 text-start w-full justify-start ml-5"
                    >
                      <div
                        class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-center"
                      >
                        <User class="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{row.original.employee}</span>
                    </div>
                  {:else if ["uniform", "masks", "gloves", "hairnet"].includes(cell.id)}
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
  </Table.Root>
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
