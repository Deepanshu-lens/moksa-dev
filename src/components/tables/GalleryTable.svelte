<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import { readable } from "svelte/store";
  import Autoplay from "embla-carousel-autoplay";
  import * as Table from "@/components/ui/table";
  import * as Carousel from "@/components/ui/carousel/index.js";
  import type { Gallery } from "@/types";
  import { AlertTriangle, ChevronsUpDown } from "lucide-svelte";

  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");

  export let data: Gallery[];
  // console.log(data);
  // const table = createTable(readable(data));
  // const columns = table.createColumns([
  //   table.column({
  //     accessor: "name",
  //     header: "Name",
  //   }),
  //   table.column({
  //     accessor: "images",
  //     header: "Images",
  //   }),
  //   table.column({
  //     accessor: "created",
  //     header: "Created",
  //   }),
  //   table.column({
  //     accessor: "updated",
  //     header: "Updated",
  //   }),
  //   table.column({
  //     accessor: "lastSeen",
  //     header: "Last Seen",
  //   }),
  // ]);
  // const { headerRows, pageRows, tableAttrs, tableBodyAttrs } =
  //   table.createViewModel(columns);
</script>

<div class="max-h-[calc(100vh-160px)] h-full w-full overflow-y-scroll">
  <Table.Root class="mx-auto w-[100%] flex flex-col pb-10">
    <Table.Header
      class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9]"
    >
      <Table.Row class="bg-transparent flex items-center justify-between p-3">
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            S.No
            <ChevronsUpDown class="scale-75" />
          </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Name <ChevronsUpDown class="scale-75" />
          </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Images <ChevronsUpDown class="scale-75" />
          </span>
        </Table.Head>
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Created on <ChevronsUpDown class="scale-75" />
          </span></Table.Head
        >
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
        >
          <span class="flex items-center gap-1">
            Last Updated <ChevronsUpDown class="scale-75" />
          </span></Table.Head
        >
        <Table.Head
          class="text-[#727272] w-full h-full flex items-center justify-center"
          >Update</Table.Head
        >
      </Table.Row>
    </Table.Header>
    <Table.Body>
    {#if data && data.length > 0}
      {#each data as person, index}
        <Table.Row
          class="bg-transparent flex items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4]"
        >
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center"
          >
            <span> {index + 1} </span>
          </Table.Cell>
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
            ><span>{person.name}</span></Table.Cell
          >
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
          >
            <span class="flex -space-x-2 overflow-hidden my-2">
              {#each person.images as img}
                <img
                  class={`inline-block h-10 w-10 rounded-full ring-2 ring-white 3xl:w-16 3xl:h-16`}
                  src={"data:image/jpeg;base64," + img}
                  alt="registered-imgs"
                />
              {/each}
            </span></Table.Cell
          >
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
            ><span>{person.created}</span></Table.Cell
          >
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
            ><span>
              {timeAgo?.format(new Date(person?.updated))}
            </span></Table.Cell
          >
          <Table.Cell
            class="text-[#727272] w-full h-full flex items-center justify-center text-sm"
          >
            <button
              class="text-[#D28E3D] bg-[#D28E3D] bg-opacity-15 font-medium text-sm rounded-xl flex items-center p-2 gap-2"
              ><span class="h-2 w-2 rounded-full bg-[#D28E3D]" /> update now
            </button>
          </Table.Cell>
        </Table.Row>
      {/each}
      {:else}
      <div class="flex flex-col h-full p-4 my-auto z-10 relative">
        <p class="text-center text-xl font-medium">No registered people found, Register to add people to your gallery</p>
      </div>
      {/if}
    </Table.Body>
  </Table.Root>
</div>

<!-- <Table.Root {...$tableAttrs}>
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row>
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
                <Table.Head {...attrs}>
                  <Render of={cell.render()} />
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
          <Table.Row {...rowAttrs}>
            {#each row.cells as cell (cell.id)}
              <Subscribe attrs={cell.attrs()} let:attrs>
                <Table.Cell {...attrs}>
                  {#if cell.id === "images"}
                    <Carousel.Root
                      opts={{
                        align: "start",
                      }}
                      class="w-1/2 mx-auto"
                      plugins={[
                        Autoplay({
                          delay: 2000,
                        }),
                      ]}
                    >
                      <Carousel.Content class="-ml-1">
                        {#each cell.value as img}
                          <Carousel.Item class="pl-1 md:basis-1/2 lg:basis-1/3"
                            ><img
                              src={"data:image/jpeg;base64," + img}
                              alt="carousel-img"
                              width="100%"
                              height="100%"
                            />
                          </Carousel.Item>
                        {/each}
                      </Carousel.Content>
                      <Carousel.Previous />
                      <Carousel.Next />
                    </Carousel.Root>
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
  </Table.Root> -->
