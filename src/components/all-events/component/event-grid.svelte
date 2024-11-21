<script lang="ts">
  import { Loader2 } from "lucide-svelte";
  import EventCard from "./event-card.svelte";
  import EventHeading from "./event-heading.svelte";
  import {
    isEventsLoading,
    allEvents,
    totalAllEvent,
    personCount,
  } from "@/stores";
  import pb from "@/lib/pb";
  import EventAlertModal from "@/components/events/EventAlertModal.svelte";

  let currentPage = 1;
  const eventsPerPage = 10;
  let isLoadingMore = false;
  let selectedEvent: Event | null = null;


  const fetchMoreEvents = async () => {
    if (
      $isEventsLoading ||
      isLoadingMore ||
      $allEvents.length >= $totalAllEvent
    )
      return;
    isLoadingMore = true;
    try {
      const localEvents = await pb
        .collection("events")
        .getList<any>(currentPage + 1, eventsPerPage, {
          // fields: "id,score,title,created,severity,type,frameImage",
          // filter:`node ?~ "${$selectedNode}"`,
          // sort:"-created"
        });
      allEvents.update((current) => {
        return [...current, ...localEvents.items];
      });
      currentPage += 1;
    } catch (error) {
      console.error("Error fetching more events:", error);
    } finally {
      isLoadingMore = false;
    }
  };

  const handleScroll = (event: any) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      fetchMoreEvents();
    }
  };

  // Mapping of event types to their headers and colors
  const eventTypes = [
    { type: "person", heading: "Person Detection", color: "#FF4764" },
    { type: "fire", heading: "Fire Detection", color: "#FF5733" },
    { type: "face", heading: "Face Detection", color: "#24DA8E" },
    // { type: 'heatmap', heading: 'Heatmap Detection', color: '#FFB347' },
    { type: "alpr", heading: "Vehicle Detection", color: "#8A2BE2" },
  ];

  // Function to filter events by type
  const filterEventsByType = (type: string) => {
    return $allEvents.filter((event) => event.type === type);
  };

  function openEventModal(event: Event): any {
    selectedEvent = { ...event };
  }

  function closeEventModal() {
    selectedEvent = null;
  }
</script>

<section class="grid w-full h-full grid-cols-5 gap-x-8 px-4 py-4">
  {#if $isEventsLoading && currentPage === 1}
    <div
      class="col-span-5 w-full flex justify-center items-center h-full gap-2"
    >
      <Loader2 class="animate-spin" />
      Fetching Events...
    </div>
  {:else}
    {#each eventTypes as { type, heading, color }}
      <div class="col-span-1 h-full w-full flex flex-col gap-4">
        <EventHeading {heading} {color} />
        <div
          on:scroll={handleScroll}
          class="event-grid-container w-full flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-175px)] h-full"
        >
          {#each filterEventsByType(type) as event}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div on:click={() => openEventModal(event)}>
              <EventCard {event} />
            </div>
          {:else}
            <div
              class="w-full flex justify-center items-center h-10 mt-2 text-gray-500"
            >
              No {heading.toLowerCase()} events available.
            </div>
          {/each}
        </div>
      </div>
    {/each}

    <!-- sepearate heatmap -->
    <div class="col-span-1 h-full w-full flex flex-col gap-4">
      <EventHeading heading={"Heatmap"} color={"#FFB347"} />
      <div
        class="w-full flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-175px)] h-full"
      >
        {#each $personCount as count}
          <img
            src={"data:image/jpeg;base64," + count.image}
            alt="heatmap"
            loading="lazy"
            class="aspect-video scale-100"
          />
        {:else}
          <div
            class="w-full flex justify-center items-center h-10 mt-2 text-gray-500"
          >
            No Heatmap available.
          </div>
        {/each}
      </div>
    </div>
    {#if isLoadingMore}
      <div
        class="col-span-5 w-full flex justify-center items-center h-10 mt-2 gap-2"
      >
        <Loader2 class="animate-spin" />
        Loading more events...
      </div>
    {/if}
  {/if}
</section>

<!-- for events details modal-->
{#if selectedEvent}
  <EventAlertModal event={selectedEvent} onClose={closeEventModal}
  ></EventAlertModal>
{/if}
