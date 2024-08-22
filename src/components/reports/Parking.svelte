<script>
  import {
    ArrowUpDown,
    Briefcase,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Filter,
    Heart,
    ListFilter,
    MoreVertical,
    ShoppingBasket,
    TrendingUp,
    Gamepad,
  } from "lucide-svelte";

  import * as Table from "@/components/ui/table";
  import * as Carousel from "@/components/ui/carousel";
  import Autoplay from "embla-carousel-autoplay";
  import { AlertTriangle, ChevronsUpDown } from "lucide-svelte";
</script>

<div class="grid grid-cols-8 gap-6 grid-rows-2 h-[200px] px-4">
  <span class="col-span-2 rounded-lg bg-white shadow-lg p-2 h-[90px]">
    <span class="flex items-center justify-center gap-6 h-full w-full">
      <span
        class="h-[60px] w-[60px] rounded-full bg-[#5B93FF] bg-opacity-30 grid place-items-center"
      >
        <Heart class="text-[#5B93FF]" />
      </span>
      <span class="flex flex-col">
        <span class="flex items-center">
          <p class="text-[#030229] font-bold text-xl">64.31%</p>
          <span
            class="text-[#00B69B] bg-[#00b69b] bg-opacity-20 flex items-center gap-1 p-2 rounded-3xl scale-75 text-sm"
          >
            <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
          </span>
        </span>
        <p class="font-medium text-[#030229]">ANPR</p>
      </span>
    </span>
  </span>
  <span class="col-span-2 rounded-lg bg-white shadow-lg p-2 h-[90px]">
    <span class="flex items-center justify-center gap-6 h-full w-full">
      <span
        class="h-[60px] w-[60px] rounded-full bg-[#FFD66B] bg-opacity-30 grid place-items-center"
      >
        <Gamepad class="text-[#FFD66B]" />
      </span>
      <span class="flex flex-col">
        <span class="flex items-center">
          <p class="text-[#030229] font-bold text-xl">64.31%</p>
          <span
            class="text-[#00B69B] bg-[#00b69b] bg-opacity-20 flex items-center gap-1 p-2 rounded-3xl scale-75 text-sm"
          >
            <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
          </span>
        </span>
        <p class="font-medium text-[#030229]">Entry/Exit of vehicles</p>
      </span>
    </span>
  </span>
  <span class="col-span-2 rounded-lg bg-white shadow-lg p-2 h-[90px]">
    <span class="flex items-center justify-center gap-6 h-full w-full">
      <span
        class="h-[60px] w-[60px] rounded-full bg-[#FF8F6B] bg-opacity-30 grid place-items-center"
      >
        <ShoppingBasket class="text-[#FF8F6B]" />
      </span>
      <span class="flex flex-col">
        <span class="flex items-center">
          <p class="text-[#030229] font-bold text-xl">64.31%</p>
          <span
            class="text-[#00B69B] bg-[#00b69b] bg-opacity-20 flex items-center gap-1 p-2 rounded-3xl scale-75 text-sm"
          >
            <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
          </span>
        </span>
        <p class="font-medium text-[#030229]">Unrecogonised vehicles</p>
      </span>
    </span>
  </span>
  <span class="col-span-2 rounded-lg bg-white shadow-lg p-2 h-[90px]">
    <span class="flex items-center justify-center gap-6 h-full w-full">
      <span
        class="h-[60px] w-[60px] rounded-full bg-[#605BFF] bg-opacity-30 grid place-items-center"
      >
        <Briefcase class="text-[#605BFF]" />
      </span>
      <span class="flex flex-col">
        <span class="flex items-center">
          <p class="text-[#030229] font-bold text-xl">64.31%</p>
          <span
            class="text-[#00B69B] bg-[#00b69b] bg-opacity-20 flex items-center gap-1 p-2 rounded-3xl scale-75 text-sm"
          >
            <TrendingUp class="text-[#00B69B] h-3 w-3" /> 1.3%
          </span>
        </span>
        <p class="font-medium text-[#030229]">Empty Slots</p>
      </span>
    </span>
  </span>
  <span
    class="col-span-4 bg-white shadow-lg rounded-lg h-64 p-2 flex flex-col gap-2"
  >
    <span class="flex items-center justify-between px-6">
      <p class="text-[#475569] font-semibold">Reports</p>
      <span class="flex items-center gap-1">
        <button
          class="flex items-center gap-2 px-2 py-1 w-[150px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-base text-[#4f4f4f]"
          ><CalendarDays class="text-[#4f4f4f]" /> Date</button
        >
        <button
          class="flex items-center gap-2 px-2 py-1 w-[100px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-base text-[#4f4f4f]"
          ><Filter class="text-[#4f4f4f]" /> Filter</button
        >
      </span>
    </span>
    <span class=" w-full h-full overflow-hidden">
      <img
        src="/images/Graph06.png"
        alt="6"
        class="object-contain max-w-full max-h-full mx-auto"
      />
    </span>
  </span>
  <span
    class="col-span-4 bg-white shadow-lg rounded-lg h-64 p-2 flex flex-col gap-2"
  >
    <span class="flex items-center justify-between px-6">
      <p class="text-[#475569] font-semibold">Vehicle Overview</p>
      <span class="flex items-center gap-1">
        <span>Sort By: Yearly</span>
        <span><MoreVertical /></span>
      </span>
    </span>
    <span class="h-full w-full">
      <img src="/images/Graph04.png" alt="graph4" />
    </span>
  </span>
</div>
<div class="flex items-center justify-between px-4 pb-4 mt-52">
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
      <Table.Head class="text-[#727272] w-full h-full">Capture Media</Table.Head
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
