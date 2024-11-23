<script lang="ts">
  import StreamLayout from "./streams/StreamLayout.svelte";
  import * as Resizable from "@/components/ui/resizable";
  import Icon from "@iconify/svelte";
  import { isAlertPanelOpen } from "@/stores";
  import CameraList from "@/components/live/cameraList/CameraList.svelte";
  import { nodes, liveEvents, gallery } from "@/stores";
  import SidePannel from "./side-pannel.svelte";
  import EventAlertModal from "../events/EventAlertModal.svelte";
  import * as Tabs from "@/components/ui/tabs";
  import * as Accordion from "@/components/ui/accordion/index.ts";
  import ComfortableCard from "./alerts/comfortable-card.svelte";
  import { PaneResizer, type PaneAPI } from "paneforge";
  export let STREAM_URL;
  let isCollapsed = false;


  let currentPanel = 1;
  let isPaneCollapsed = false;
  let paneOne: PaneAPI;
  let shouldUpdateContainer = false;


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

  function closeEventModal() {
    selectedEvent = null;
  }

  $:console.log($gallery)
</script>

<div class="hidden lg:block w-full">
  <Resizable.PaneGroup
  direction="horizontal"
  autoSaveId="LENSViewPaneSize"
  style="height: calc(100vh - 3rem);"
  >
  <Resizable.Pane defaultSize={70}>
      <StreamLayout {STREAM_URL} />
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane
    style={`${!isPaneCollapsed ? "overflow: visible;" : "overflow: hidden;"}`}
    maxSize={50}
    defaultSize={22}
    bind:pane={paneOne}
    collapsible={true}
    collapsedSize={0}
    minSize={0}
    onResize={(e) => {
      if (e<10) {
        // Threshold for easier expansion
        isPaneCollapsed = true;
        paneOne.collapse();
      } else {
        isPaneCollapsed = false;
        paneOne.expand();
      }
      shouldUpdateContainer = true;
    }}
  >
    <div>
      <div class="relative w-full h-full">
      <div class="lg:block hidden">
        {#if $nodes && $nodes.length > 0}
          <div class="lg:relative">
            {#if $isAlertPanelOpen}
              <div class="flex">
                {#if currentPanel == 0}
                  <CameraList />
                {:else if currentPanel == 1}
                  <div class="border-l flex flex-col p-2 overflow-visible w-full min-w-[360px]">
                    <h1 class="text-lg font-bold p-3">Events</h1>
                    <Tabs.Root>
                      <Tabs.List class="w-full">
                        <Tabs.Trigger value="comfortable" class="w-1/2"
                          >Comfortable</Tabs.Trigger
                        >
                        <Tabs.Trigger value="informative" class="w-1/2"
                          >Informative</Tabs.Trigger
                        >
                      </Tabs.List>
                      <Tabs.Content
                        value="comfortable"
                        class="w-full min-w-[310px]"
                      >
                        <Accordion.Root multiple value={["open"]} class="m-4">
                          <Accordion.Item value="open">
                            <Accordion.Trigger>Whitelisted</Accordion.Trigger>
                            <Accordion.Content>
                              <div class="flex flex-col gap-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
                                {#each $gallery.filter((event: any) => !event.blackList) as event}
                                  <ComfortableCard {event} />
                                {:else}
                                  <div class="p-3">No whitelisted faces</div>
                                {/each}
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                          <Accordion.Item value="item-2">
                            <Accordion.Trigger>BlackListed</Accordion.Trigger>
                            <Accordion.Content>
                              <div class="flex flex-col gap-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
                                {#each $gallery.filter((event: any) => event.blackList) as event}
                                  <ComfortableCard {event} />
                                {:else}
                                  <div class="p-3">No blacklisted faces</div>
                                {/each}
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        </Accordion.Root>
                      </Tabs.Content>
                      <Tabs.Content value="informative">
                        <div
                          class="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-12rem)] overflow-visible"
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
                                    src={"data:image/jpeg;base64," +
                                      event.frameImage}
                                    alt={event.title || "Unknown Identity"}
                                    class="w-16 h-16 rounded-xl object-cover transform transition-transform duration-300 group-hover:scale-150"
                                  />
                                  <div
                                    class="flex justify-between w-full items-center gap-4"
                                  >
                                    <div
                                      class="flex flex-col gap-2 justify-between"
                                    >
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
                                      <div
                                        class="flex flex-col items-start gap-0"
                                      >
                                        <span
                                          class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                                          >Confidence: {Math.round(
                                            event?.score * 100
                                          )} %</span
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
                                        {new Date(
                                          event?.created
                                        ).toLocaleDateString()}
                                      </div>
                                      <div>
                                        {new Date(
                                          event?.created
                                        ).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            {/each}
                          {:else}
                            <div class="p-3">
                              No events yet. Displaying only live events.
                            </div>
                          {/if}
                        </div>
                      </Tabs.Content>
                    </Tabs.Root>
                  </div>
                {/if}
                <!-- <SidePannel /> -->
              </div>
            {:else}
              <div class="flex">
                <CameraList />
                <!-- <SidePannel /> -->
              </div>
            {/if}
  
            {#if selectedEvent}
              <EventAlertModal event={selectedEvent} onClose={closeEventModal}
              ></EventAlertModal>
            {/if}
  
            {#if $isAlertPanelOpen}
              <div
                class="absolute z-50 -translate-x-full top-44 transform -left-8 transition-all duration-500 ease-in-out"
              >
                <div
                  class="-rotate-90 flex flex-row-reverse items-center origin-top-right"
                >
                  <div
                    class={`${currentPanel == 0 ? "font-bold bg-accent" : "bg-background/80 "} cursor-pointer h-[32px] rounded-t-xl  text-black dark:text-white px-3 flex  items-center whitespace-nowrap shadow-xl z-40 border dark:border-muted-foreground/10`}
                  >
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      class="flex items-center justify-center place-items-center my-auto space-x-2"
                      on:click={() => (currentPanel = 0)}
                    >
                      <span>Cameras</span>
                      <button
                        class={`text-center items-center flex place-items-center hover:bg-foreground/50 hover:dark:text-black hover:text-white rounded-full hover:m-1`}
                        on:click|stopPropagation={() =>
                          isAlertPanelOpen.set(false)}
                      >
                        <Icon icon="material-symbols:close-rounded" width={14} />
                      </button>
                    </div>
                  </div>
                  <div
                    class={`${currentPanel == 1 ? "font-bold bg-accent" : "bg-background/80 "} cursor-pointer h-[32px] rounded-t-xl  text-black dark:text-white px-3 flex items-center whitespace-nowrap shadow-xl z-40 border dark:border-muted-foreground/10`}
                  >
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                      class={`flex items-center justify-center place-items-center my-auto space-x-2`}
                      on:click={() => {
                        currentPanel = 1;
                        isPaneCollapsed = false;
                      }}
                    >
                      <span>Alerts</span>
                      <button
                        class={`text-center items-center flex place-items-center hover:bg-foreground/50 hover:dark:text-black hover:text-white rounded-full hover:m-1`}
                        on:click|stopPropagation={() =>
                          isAlertPanelOpen.set(false)}
                      >
                        <Icon icon="material-symbols:close-rounded" width={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
      </div>
      </div>
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>

<div class="w-full lg:hidden">
  <StreamLayout {STREAM_URL} />
</div>
<div class="hidden lg:block">
  <SidePannel />
</div>