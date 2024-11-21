<script lang="ts">
  import Icon from "@iconify/svelte";
  import { isAlertMobileOpen } from "@/stores/ui";
  import { nodes, liveEvents } from "@/stores";
  import * as Drawer from "@/components/ui/drawer";

  const eventTypeIcons = {
    person: "mdi:human",
    face: "mdi:face-recognition",
    fire: "mdi:fire",
    alpr: "mdi:car",
  };
  let selectedEvent: Event | null = null;

  function openEventModal(event: Event): any {
    selectedEvent = { ...event };
  }
</script>

<Drawer.Root bind:open={$isAlertMobileOpen}>
  <Drawer.Trigger><slot /></Drawer.Trigger>
  <Drawer.Content class="max-h-[50vh] h-[50vh]">
    <Drawer.Header>
      <Drawer.Title>Events</Drawer.Title>
      {#if $nodes?.length > 0}
        {#if $isAlertMobileOpen}
          <div class="border-l flex flex-col p-2 max-h-full overflow-auto">
            <div
              class="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-3rem)] text-xs overflow-visible"
            >
              {#if $liveEvents.length > 0}
                {#each $liveEvents as event}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="flex bg-accent p-4 rounded-xl shadow-sm hover:border hover:border-primary relative group overflow-visible cursor-pointer"
                    on:click={() => openEventModal(event)}
                  >
                    <div class="flex gap-6 items-center flex-grow">
                      <img
                        src={"data:image/jpeg;base64," + event.frameImage}
                        alt={event.title || "Unknown Identity"}
                        class="w-16 h-16 rounded-xl object-cover transform transition-transform duration-300 group-hover:scale-150"
                      />
                      <div
                        class="flex justify-between w-full items-center gap-4"
                      >
                        <div class="flex flex-col gap-2 justify-between">
                          <div class="flex items-center space-x-1">
                            {#if eventTypeIcons[event.type]}
                              <Icon
                                icon={eventTypeIcons[event.type]}
                                width="20"
                              />
                            {/if}
                            <h3 class="text-sm">
                              {event.title || "Unknown Identity"}
                            </h3>
                          </div>
                          <div class="flex flex-col items-start gap-0">
                            <span
                              class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm"
                              >Confidence: {Math.round(event.score * 100)} %</span
                            >
                            <!-- <span
                            class={cn(
                              "text-sm",
                              event.matchScore > 0
                                ? "text-green-500"
                                : "text-orange-500"
                            )}
                            >{event.matchScore > 0
                              ? "Match found"
                              : "No match found"}</span
                          > -->
                          </div>
                        </div>
                        <div
                          class="ml-auto text-sm text-muted-foreground text-wrap"
                        >
                          <div>
                            {new Date(event?.created).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(event?.created).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              {:else}
                <div class="p-3">No events yet</div>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    </Drawer.Header>
    <Drawer.Footer>
      <Drawer.Close>Cancel</Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
