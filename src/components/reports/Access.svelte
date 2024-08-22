<script>
  import { Select } from "bits-ui";
  import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ListFilter,
    MoreVertical,
    TrendingUp,
  } from "lucide-svelte";
  import * as Table from "@/components/ui/table";
  import * as Carousel from "@/components/ui/carousel";
  import Autoplay from "embla-carousel-autoplay";
  import { AlertTriangle, ChevronsUpDown } from "lucide-svelte";
</script>

<div
  class="max-h-[calc(100vh-75px-80px)] h-full w-full grid grid-cols-7 grid-rows-2 gap-4 p-2"
>
  <div class="col-span-7 h-full w-full grid grid-cols-7 gap-4">
    <div
      class="col-span-2 border-2 border-black/.23 border-solid p-2 flex flex-col h-full w-full rounded-lg"
    >
      <span class="flex items-center justify-between"
        ><span class="text-lg font-bold">Performance</span><span
          ><MoreVertical class="h-5 w-5" /></span
        ></span
      >
      <span class="h-full w-full overflow-hidden"
        ><img
          src="/images/Graph08.png"
          class="max-h-[250px] mx-auto max-w-[350px] object-contain"
          alt="8"
        /></span
      >
    </div>
    <div
      class="col-span-3 border-2 gap-4 border-black/.23 border-solid p-2 rounded-lg flex flex-col items-start justify-normal"
    >
      <span class="flex items-center justify-between w-full">
        <span class="text-lg font-bold">Average Face Recognition</span>
        <span class="flex items-center gap-3">
          <span class="flex items-center gap-1"
            ><span class="h-1.5 w-1.5 rounded-full bg-[#dd2025] text-sm" /> Unrecogonised</span
          >
          <span class="flex items-center gap-1"
            ><span class="h-1.5 w-1.5 rounded-full bg-[#14ba6d] text-sm" /> Recogonised</span
          >
          <span>
            <Select.Root portal={null}>
              <Select.Trigger class="text-sm">
                <Select.Value placeholder="Monthly" />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Label>Time</Select.Label>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </span>
        </span>
      </span>
      <span>Average active cameras</span>
      <span class="h-full w-full"
        ><img src="/images/Graph07.png" alt="9" /></span
      >
    </div>
    <div class="col-span-2 grid grid-cols-1 grid-rows-2 gap-4">
      <div
        class="col-span-1 border border-black/.23 border-solid rounded-lg p-2 flex items-center gap-1"
      >
        <span class="flex flex-col h-full flex-shrink-0 gap-1">
          <span class="text-lg font-semibold">Total registered faces</span>
          <span class="text-4xl font-bold">10293</span>
          <span class="flex items-center gap-1 text-black/.7 text-sm">
            <span class="text-[#00B69B] flex items-center gap-1">
              <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
            </span>
            Up from past week
          </span>
        </span>
        <span class="h-full w-full">
          <img src="/images/Graph8.png" alt="8" />
        </span>
      </div>
      <div
        class="col-span-1 border border-black/.23 border-solid rounded-lg p-2 flex items-center gap-1"
      >
        <span class="flex flex-col h-full flex-shrink-0 gap-1">
          <span class="text-lg font-semibold">Total registered faces</span>
          <span class="text-4xl font-bold">10293</span>
          <span class="flex items-center gap-1 text-black/.7 text-sm">
            <span class="text-[#00B69B] flex items-center gap-1">
              <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
            </span>
            Up from past week
          </span>
        </span>
        <span class=" h-full w-full">
          <img src="/images/Graph9.png" alt="10" />
        </span>
      </div>
    </div>
  </div>
  <div class="col-span-7 px-4">
    <div class="flex items-center justify-between pb-4">
      <span class="text-xl font-medium text-[#323232]">Overview</span>
      <span class="flex items-center gap-4">
        <span class="text-sm text-black/.7 flex items-center gap-1"
          ><ArrowUpDown class="h-4 w-4" /> Sort</span
        >
        <span class="text-sm text-black/.7 flex items-center gap-1"
          ><ListFilter class="h-4 w-4" /> Filter</span
        >
        <span class="text-sm text-black/.7">Rows per page: select</span>
        <span class="text-sm text-black/.7">1-10 of 54</span>
        <span class="flex items-center gap-2">
          <ChevronLeft class="h-4 w-4" />
          <ChevronRight class="h-4 w-4" />
        </span>
      </span>
    </div>
    <Table.Root class="mx-auto w-[98%] flex flex-col pb-10">
      <Table.Header
        class="border-2 border-[#e4e4e4] border-solid rounded-lg bg-[#f9f9f9]"
      >
        <Table.Row class="bg-transparent flex items-center justify-between p-3">
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Event Name
              <ChevronsUpDown class="scale-75" />
            </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Car specifics <ChevronsUpDown class="scale-75" />
            </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Detection Score <ChevronsUpDown class="scale-75" />
            </span>
          </Table.Head>
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Matches <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Time <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] w-full h-full">
            <span class="flex items-center gap-1">
              Date <ChevronsUpDown class="scale-75" />
            </span></Table.Head
          >
          <Table.Head class="text-[#727272] w-full h-full"
            >Capture Media</Table.Head
          >
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each Array(20) as _, index}
          <Table.Row
            class="bg-transparent flex items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4]"
          >
            <Table.Cell class="text-black w-full h-full"
              ><span class="flex items-center gap-2"
                ><span
                  class="bg-[#F0C01A] bg-opacity-20 h-[24px] w-[24px] rounded-md grid place-items-center"
                >
                  <AlertTriangle class=" h-4 w-4 text-[#f0c01a]" />
                </span>
                Face Detection
              </span>
            </Table.Cell>
            <Table.Cell class="text-[#727272] w-full h-full text-sm ml-2"
              ><span>undefined</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span>0.99575114</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span>No Matches Found</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span>04:54:19 PM</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm"
              ><span>March 29, 2024</span></Table.Cell
            >
            <Table.Cell class="text-[#727272] w-full h-full text-sm">
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
                <Carousel.Content class="m-0">
                  {#each Array(4) as img}
                    <Carousel.Item class="pl-[2px] md:basis-1/2 lg:basis-1/3"
                      ><img
                        src={"/images/01.svg"}
                        alt="carousel-img"
                        width="100%"
                        height="100%"
                      />
                    </Carousel.Item>
                    <!-- <Render of={cell.render()} /> -->
                  {/each}
                </Carousel.Content>
                <Carousel.Previous />
                <Carousel.Next />
              </Carousel.Root>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
</div>
