<script>
  import * as Table from "@/components/ui/table";
  import * as Carousel from "@/components/ui/carousel";
  import Autoplay from "embla-carousel-autoplay";
  import { AlertTriangle, ChevronsUpDown, Code,Copy } from "lucide-svelte";
  import EventsManagement from "@/managers/events-management.svelte";
  import { eventsManager, loadingEvents } from "@/stores";
  import Spinner from "../ui/spinner/Spinner.svelte";
  import { cn } from "@/lib/utils";
  import * as HoverCard from "@/components/ui/hover-card";
  import Button from "../ui/button/button.svelte";
  import { toast } from "svelte-sonner";

  function formatDate(isoDateString) {
    const date = new Date(isoDateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  }

  // Function to copy the code to clipboard
  function copyToClipboard() {
    const code = document.getElementById('code-block').innerText; // Get the code inside the pre tag
    navigator.clipboard.writeText(code) // Write to the clipboard
      .then(() => {
        toast.success('Code copied to clipboard!'); // Optional: Show a confirmation message
      })
  }
</script>

<EventsManagement />

<div class="w-full flex items-center justify-between pr-5 pb-3">
  <!-- event color depiction -->
  <div class="flex gap-x-4 p-2 ml-4">
    <!-- Critical -->
    <div class="flex items-center space-x-4">
      <div class="size-2 bg-red-700 rounded-full"></div>
      <span class="text-red-700 text-sm">Critical</span>
    </div>

    <!-- High -->
    <div class="flex items-center space-x-4">
      <div class="size-2 bg-orange-600 rounded-full"></div>
      <span class="text-orange-600 text-sm">High</span>
    </div>

    <!-- Medium -->
    <div class="flex items-center space-x-4">
      <div class="size-2 bg-yellow-500 rounded-full"></div>
      <span class="text-yellow-500 text-sm">Medium</span>
    </div>

    <!-- Low -->
    <div class="flex items-center space-x-4">
      <div class="size-2 bg-green-500 rounded-full"></div>
      <span class="text-green-500 text-sm">Low</span>
    </div>

    <!-- Information -->
    <div class="flex items-center space-x-4">
      <div class="size-2 bg-blue-500 rounded-full"></div>
      <span class="text-blue-500 text-sm">Information</span>
    </div>
  </div>

  <!-- Api Code Sample -->
  <div>
    <HoverCard.Root>
      <HoverCard.Trigger>
        <Button variant="outline" size="icon">
          <Code class="h-4 w-4 m-3" />
        </Button>
      </HoverCard.Trigger>
      <!-- HoverCard Content with Copy Button -->
      <HoverCard.Content class="w-[40rem] relative">
        <!-- Header Section -->
        <h1
          class="text-xl font-bold text-gray-900 dark:text-white py-1"
        >
          API Request Example
        </h1>

        <!-- Code Block Section -->
        <div
          class="max-w-4xl mx-auto p-4 bg-gray-800 dark:bg-gray-800 text-white rounded-lg shadow-lg"
        >
          <p class="text-sm text-gray-400 mb-2">
            Example of a POST request for alert creation:
          </p>
          <div class="">
            <!-- Copy Button -->
            <button
              on:click={copyToClipboard}
              class="absolute top-[3.7rem] right-6 p-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 transition duration-200"
            >
              <Copy class="w-4 h-4" />
            </button>

            <!-- Code Block -->
            <pre
              id="code-block"
              class="font-mono whitespace-pre-wrap bg-gray-900 rounded-lg p-4">
          curl -X POST http://localhost:1432/api/alerts \  
          -H "Content-Type: application/json" \  
          -d &#39; &#123;   
          "eventName": "UnauthorizedAccess",   
          "description": "Unauthorized individual detected at the main entrance.", <br
              />
          "location": "Main Entrance, Building A",   
          "confidence": 0.98,   
          "images": "iVBORw0KGgoAAAANSUhEUgAA...",   
          "severity": "critical, high, medium, low, information" [Any of these 5] <br
              />
          &#125; &#39;
        </pre>
          </div>
        </div>
      </HoverCard.Content>
    </HoverCard.Root>
  </div>
</div>

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
          Description
          <ChevronsUpDown class="scale-75" />
        </span>
      </Table.Head>
      <Table.Head class="text-[#727272] w-full h-full">
        <span class="flex items-center gap-1">
          Location
          <ChevronsUpDown class="scale-75" />
        </span>
      </Table.Head>
      <Table.Head class="text-[#727272] w-full h-full">
        <span class="flex items-center gap-1">
          Event Type
          <ChevronsUpDown class="scale-75" />
        </span>
      </Table.Head>
      <Table.Head class="text-[#727272] w-full h-full">
        <span class="flex items-center gap-1">
          Severity
          <ChevronsUpDown class="scale-75" />
        </span>
      </Table.Head>
      <Table.Head class="text-[#727272] w-full h-full">
        <span class="flex items-center gap-1">
          Date
          <ChevronsUpDown class="scale-75" />
        </span>
      </Table.Head>
      <Table.Head class="text-[#727272] w-full h-full">
        Captured Media
      </Table.Head>
    </Table.Row>
  </Table.Header>

  <!-- Loading state -->
  {#if $loadingEvents}
    <div class="w-full h-32 flex items-center justify-center">
      <Spinner />
    </div>
  {/if}

  <Table.Body class="overflow-y-scroll max-h-[calc(100vh-210px)]">
    {#if $eventsManager?.length > 0}
      {#each $eventsManager as event, index}
        <Table.Row
          class="bg-transparent flex items-center justify-between mt-4 rounded-lg  border-2 border-solid border-[#e4e4e4]"
        >
          <Table.Cell class="text-black w-full h-full">
            <span class="flex items-center gap-2">
              <span
                class="h-[24px] w-[24px] rounded-md grid place-items-center"
              >
                <AlertTriangle
                  class={cn(
                    "h-6 w-6 rounded-md",
                    event?.severity === "information"
                      ? "text-blue-700 bg-blue-100"
                      : event?.severity === "low"
                        ? "text-green-700 bg-green-100"
                        : event?.severity === "medium"
                          ? "text-yellow-700 bg-yellow-100"
                          : event?.severity === "high"
                            ? "text-orange-700 bg-orange-100"
                            : "text-red-700 bg-red-100"
                  )}
                />
              </span>
              <span class="ml-2">{event?.eventName}</span>
            </span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm ml-2">
            <span>{event?.description}</span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm ml-2">
            <span>{event?.location}</span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm">
            <span>{event?.eventType}</span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm">
            <span>{event?.severity || ""}</span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm">
            <span>{formatDate(event?.created)}</span>
          </Table.Cell>
          <Table.Cell class="text-[#727272] w-full h-full text-sm">
            {#if !event?.images}
              <span>No media available</span>
            {:else}
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
                  {#each event?.images as img}
                    <Carousel.Item class="pl-[2px] md:basis-1/2 lg:basis-1/3">
                      <img
                        src={img}
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
            {/if}
          </Table.Cell>
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>
