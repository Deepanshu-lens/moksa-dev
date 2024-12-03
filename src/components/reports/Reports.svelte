<script>
  import * as Table from "@/components/ui/table";
  import * as Carousel from "@/components/ui/carousel";
  import Autoplay from "embla-carousel-autoplay";
  import { AlertTriangle, ChevronsUpDown } from "lucide-svelte";
</script>

<Table.Root class="mx-auto w-[98%] flex flex-col">
  <!-- <Table.Caption>A list of your recent invoices.</Table.Caption> -->
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
          Camera Name <ChevronsUpDown class="scale-75" />
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
          Date <ChevronsUpDown class="scale-75" />
        </span></Table.Head
      >
      <Table.Head class="text-[#727272] w-full h-full">
        <span class="flex items-center gap-1">
          Time <ChevronsUpDown class="scale-75" />
        </span></Table.Head
      >
      <Table.Head class="text-[#727272] w-full h-full">Capture Media</Table.Head
      >
    </Table.Row>
  </Table.Header>
  <Table.Body class="overflow-y-scroll max-h-[calc(100vh-210px)]">
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
