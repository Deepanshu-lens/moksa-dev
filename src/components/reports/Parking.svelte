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

<div class="">
  <!-- Cards Section -->
  <div class="grid grid-cols-4 gap-x-16 gap-y-12 px-4">
    <div class="rounded-lg bg-white shadow-lg p-2 h-32 border border-gray-100">
      <div class="flex items-center justify-center gap-6 h-full w-full">
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
          <p class="font-medium text-sm text-muted-foreground">ANPR</p>
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-white shadow-lg p-2 h-32 border border-gray-100">
      <div class="flex items-center justify-center gap-6 h-full w-full">
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
          <p class="font-medium text-sm text-muted-foreground">
            Entry/Exit of vehicles
          </p>
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-white shadow-lg p-2 h-32 border border-gray-100">
      <div class="flex items-center justify-center gap-6 h-full w-full">
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
          <p class="font-medium text-sm text-muted-foreground">
            Unrecogonised vehicles
          </p>
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-white shadow-lg p-2 h-32 border border-gray-100">
      <div class="flex items-center justify-center gap-6 h-full w-full">
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
          <p class="font-medium text-sm text-muted-foreground">Empty Slots</p>
        </span>
      </div>
    </div>
  </div>
</div>

<div class="flex items-center justify-between px-4 mt-10 gap-x-10">
  <!-- Reports Container section -->
  <div
    class=" bg-white shadow-lg border border-gray-100 rounded-lg h-72 px-2 py-3 flex flex-col gap-2"
  >
    <div class="flex items-center justify-between pl-5">
      <p class="text-[#475569] font-semibold">Reports</p>
      <div class="flex items-center gap-1">
        <button
          class="flex items-center gap-2 px-2 py-1 w-[150px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-sm text-[#4f4f4f]"
          ><CalendarDays class="text-[#4f4f4f]" size={14} /> Date</button
        >
        <button
          class="flex items-center gap-2 px-2 py-1 w-[100px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-sm text-[#4f4f4f]"
          ><Filter class="text-[#4f4f4f]" size={14} /> Filter</button
        >
      </div>
    </div>
    <span class=" w-full h-full overflow-hidden mt-5">
      <img
        src="/images/Graph06.png"
        alt="6"
        class="object-contain max-w-full max-h-full"
      />
    </span>
  </div>

  <!-- Vehicle Overview Container section -->
  <div
    class="col-span-5 bg-white shadow-lg border p-5 border-gray-100 rounded-lg h-72 flex flex-col gap-2"
  >
    <div class="flex items-center justify-between">
      <p class="text-[#475569] font-semibold">Vehicle Overview</p>
      <span class="flex items-center gap-1">
        <span class="text-sm text-[#475569]">Sort By: Yearly</span>
        <span><MoreVertical size={12} /></span>
      </span>
    </div>
    <!-- graphs container section -->
    <div class="flex items-center justify-between mt-1">
      <!-- Pie chart container section -->
      <div class="flex flex-col gap-y-1">
        <h5 class="text-[#475569] font-medium">Total Vehicles Registered</h5>
        <h3 class="font-bold text-2xl">4351+</h3>
        <span class="text-[#475569] text-sm"
          >From Jun 20, 2023 to Jun 20, 2024</span
        >
        <img
          src="/images/VehicleOverviewPie.png"
          class="h-28 w-28 mx-auto"
          alt="pie"
        />
        <div class="flex items-center space-x-3">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-slate-800 mr-2"></div>
            <span class="text-xs font-medium text-gray-700">Recognised</span>
          </div>

          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-teal-700 mr-2"></div>
            <span class="text-xs font-medium text-gray-700">Unrecognised</span>
          </div>

          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full bg-emerald-400 mr-2"></div>
            <span class="text-xs font-medium text-gray-700">Blacklisted</span>
          </div>
        </div>
      </div>
      <!-- Line chart container section -->
      <div class="h-[40%] w-96">
        <img src="/images/VehicleOverviewLine.png" alt="graph4" />
      </div>
    </div>
  </div>
</div>

<!-- Overview Table Section -->
<div class="flex items-center justify-between px-4 pb-4 mt-8">
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
              class="bg-[#F165228C]/20 bg-opacity-20 h-[24px] w-[24px] rounded-md grid place-items-center"
            >
              <AlertTriangle class=" h-4 w-4 text-[#F16522]" />
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
