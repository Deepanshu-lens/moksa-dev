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

  export let selectedEventTypeFilters;
  export let date;
  export let time;

  let currentPage = 1;
  const eventsPerPage = 10;
  let isLoadingMore = false;
  let selectedEvent: Event | null = null;
  let events: any = [];
  let heatMaps: any = [];

  allEvents.subscribe((value) => (events = value));
  personCount.subscribe((value) => (heatMaps = value));

  let filteredEvents: any = events;
  let filteredHeatMap: any = heatMaps;
  let filteredEventsTypes: any;

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
        .getList<any>(currentPage + 1, eventsPerPage);
      allEvents.update((current) => [...current, ...localEvents.items]);
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

  function filterByDate(events: any[], date: any) {
    if (!date) return events;
    return events.filter((event) => {
      const eventDate = new Date(event.created);
      const year = date.year;
      const month = String(date.month).padStart(2, "0");
      const day = String(date.day).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;
      return eventDate.toISOString().split("T")[0] === formattedDate;
    });
  }

  function filterByTime(events: any[], time: any) {
    if (!time?.startTime || !time?.endTime) return events;
    return events.filter((event) => {
      const eventTime = new Date(event.created).toTimeString().slice(0, 5);
      return eventTime >= time.startTime && eventTime <= time.endTime;
    });
  }

  $: {
    let filteredByDate = filterByDate(events, date);
    let filteredByTime = filterByTime(filteredByDate, time);
    filteredEvents = filteredByTime;
    let filteredHeatByDate = filterByDate(heatMaps, date);
    let filteredHeatByTime = filterByTime(filteredHeatByDate, time);
    filteredHeatMap = filteredHeatByTime;
  }

  $: {
    if (selectedEventTypeFilters.length === 0) {
      filteredEventsTypes = eventTypes;
    } else {
      filteredEventsTypes = eventTypes.filter((val) =>
        selectedEventTypeFilters.includes(val.type)
      );
    }
  }

  function filterEventsByType(type: string) {
    return filteredEvents.filter((event: any) => event.type === type);
  }

  function openEventModal(event: Event): void {
    selectedEvent = { ...event };
  }

  function closeEventModal(): void {
    selectedEvent = null;
  }
</script>

<div class="container mx-auto">
  <section class="relative h-full w-full py-4">
    {#if $isEventsLoading && currentPage === 1}
      <div class="col-span-5 flex h-full w-full">
        <Loader2 class="animate-spin" />
        Fetching Events...
      </div>
    {:else}
      <div
        class="flex flex-row gap-5 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-x-8 lg:overflow-x-visible"
      >
        {#each filteredEventsTypes as { type, heading, color }}
          <div
            class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-1"
          >
            <EventHeading {heading} {color} />
            <div
              on:scroll={handleScroll}
              class="event-grid-container flex h-full max-h-[calc(100vh-175px)] w-full flex-col gap-2 overflow-y-auto"
            >
              {#each filterEventsByType(type) as event}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
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
        <!-- Heatmap Section -->
        {#if selectedEventTypeFilters.length === 0 || selectedEventTypeFilters.includes("heatmap")}
          <div
            class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-1"
          >
            <div
              class="flex h-full w-full flex-shrink-0 flex-col gap-4 lg:col-span-5"
            >
              <EventHeading heading={"Heatmap"} color={"#FFB347"} />
              <div
                class="flex h-full max-h-[calc(100vh-14rem)] w-full flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-y-auto"
              >
                {#each filteredHeatMap as count}
                  <img
                    src={"data:image/jpeg;base64," + count.image}
                    alt="heatmap"
                    loading="lazy"
                    class="aspect-video flex-shrink-0 scale-100"
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
          </div>
        {/if}
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
</div>

{#if selectedEvent}
  <EventAlertModal event={selectedEvent} onClose={closeEventModal} />
{/if}
