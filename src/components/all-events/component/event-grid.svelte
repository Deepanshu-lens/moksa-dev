<script lang="ts">
  import { Loader2 } from "lucide-svelte";
  import EventCard from "./event-card.svelte";
  import EventHeading from "./event-heading.svelte";
  import { isEventsLoading, allEvents, totalAllEvent, selectedNode } from "@/stores";
  import pb from "@/lib/pb";

  export let data; 

  let currentPage = 1; 
  const eventsPerPage = 10; 
  let isLoadingMore = false; 

  const fetchMoreEvents = async () => {
    if ($isEventsLoading || isLoadingMore || ($allEvents.length >= $totalAllEvent)) return; 
    isLoadingMore = true; 
    try {
      const localEvents = await pb.collection("events").getList<any>(currentPage + 1, eventsPerPage, {
        // fields: "id,score,title,created,severity,type,frameImage",
        // filter:`node ?~ "${$selectedNode}"`,
        // sort:"-created"
      });
      allEvents.update(current => {
        return [...current, ...localEvents.items];
      });
      currentPage += 1; 
    } catch (error) {
      console.error("Error fetching more events:", error);
    } finally {
      isLoadingMore = false; 
    }
  };

  const handleScroll = (event:any) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      fetchMoreEvents(); 
    }
  };

</script>

<section class="grid w-full h-full grid-cols-4 gap-x-8 px-4 py-4">
  {#if $isEventsLoading && currentPage === 1}
    <div class="col-span-4 w-full flex justify-center items-center h-full gap-2">
      <Loader2 class="animate-spin" />
      Fetching Events...
    </div>
  {:else}
    <div class="col-span-4 h-full w-full flex flex-col gap-4">
      <EventHeading
        heading={"Person Detection"}
        color={"#FF4764"}
      />
      <div
        on:scroll={handleScroll}
        id="event-grid-container"
        class="event-grid-container w-full flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-175px)] h-full"
      >
        {#each data as event}
          <EventCard {event} />
        {/each}
        {#if isLoadingMore}
          <div class="w-full flex justify-center items-center h-10 mt-2 gap-2">
            <Loader2 class="animate-spin" />
            Loading more events...
          </div>
        {/if}
      </div>
    </div>
  {/if}
</section>