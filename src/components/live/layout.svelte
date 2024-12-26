<script lang="ts">
  import StreamLayout from "./streams/StreamLayout.svelte";
  import * as Dialog from "@/components/ui/dialog";
  import * as Resizable from "@/components/ui/resizable";
  import Icon from "@iconify/svelte";
  import {
    isAlertPanelOpen,
    isRoiPanelOpen,
  } from "@/stores";
  import CameraList from "@/components/live/cameraList/CameraList.svelte";
  import { nodes, liveEvents, gallery,selectedCamera } from "@/stores";
  import SidePannel from "./side-pannel.svelte";
  import EventAlertModal from "../events/EventAlertModal.svelte";
  import * as Tabs from "@/components/ui/tabs";
  import * as Accordion from "@/components/ui/accordion/index.ts";
  import ComfortableCard from "./alerts/comfortable-card.svelte";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import { PaneResizer, type PaneAPI } from "paneforge";
  import Button from "../ui/button/button.svelte";
  import Input from "../ui/input/input.svelte";
  import { onMount } from "svelte";
  import { PenTool,X } from "lucide-svelte";
  import getStreamURL from "@/lib/url";
  import { writable } from "svelte/store";
  import StreamTile from "./streams/StreamTile.svelte";
  import pb from "@/lib/pb";
  import { toast } from "svelte-sonner";
  const STREAM_URL = getStreamURL();

  let currentPanel = 1;
  let isPaneCollapsed = false;
  let paneOne: PaneAPI;
  let shouldUpdateContainer = false;
  let isMobile = false;
  let selectedEventFilter = "";
  let eventSearchQuery = "";
  let isOpen = writable(false);

  let draw = false;
  let canvas, ctx, rect;
  let canvasCoordinates=writable({});
  function toggleDraw() {
    draw = !draw;
    if (draw) {
      setTimeout(() => {
          setupCanvasForLine();
      }, 0);
    }
  }

   // setting Up Canvas to draw line over seleced roi camera
   function setupCanvasForLine() {
    canvas = document.getElementById("roicanvas");
    ctx = canvas.getContext("2d");
    rect = canvas.getBoundingClientRect();

    const points = [
      { x: 150, y: 150, isDragging: false, color: "blue" },
      { x: 250, y: 250, isDragging: false, color: "blue" },
    ];

    let lineIsDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    canvas.width = rect.width;
    canvas.height = rect.height;

    function updateCanvasCoordinates() {
      const videoResolution = { width: 640, height: 640 };
      canvasCoordinates.set(
        points.map((point) => ({
          x: Math.round((point.x / rect.width) * videoResolution.width),
          y: Math.round((point.y / rect.height) * videoResolution.height),
        })),
      );
    }

    function drawLinePoints() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.strokeStyle = "blue";
      ctx.stroke();
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
      });
    }

    function isWithinBounds(point) {
      return (
        point.x >= 0 &&
        point.x <= rect.width &&
        point.y >= 0 &&
        point.y <= rect.height
      );
    }

    canvas.addEventListener("mousedown", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let onPoint = false;

      points.forEach((point) => {
        if (
          Math.abs(mouseX - point.x) < 10 &&
          Math.abs(mouseY - point.y) < 10
        ) {
          point.isDragging = true;
          onPoint = true;
        }
      });

      if (!onPoint) {
        lineIsDragging = true;
        dragOffsetX = mouseX;
        dragOffsetY = mouseY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (lineIsDragging) {
        const dx = mouseX - dragOffsetX;
        const dy = mouseY - dragOffsetY;
        let allWithinBounds = true;
        points.forEach((point) => {
          const newX = point.x + dx;
          const newY = point.y + dy;
          if (!isWithinBounds({ x: newX, y: newY })) {
            allWithinBounds = false;
          }
        });

        if (allWithinBounds) {
          points.forEach((point) => {
            point.x += dx;
            point.y += dy;
          });
          dragOffsetX = mouseX;
          dragOffsetY = mouseY;
          drawLinePoints();
          updateCanvasCoordinates();
        }
      } else if (points.some((p) => p.isDragging)) {
        const point = points.find((p) => p.isDragging);
        const newX = mouseX;
        const newY = mouseY;
        if (isWithinBounds({ x: newX, y: newY })) {
          point.x = newX;
          point.y = newY;
          drawLinePoints();
          updateCanvasCoordinates();
        }
      }

      if (points.some((p) => p.isDragging)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    });

    canvas.addEventListener("mouseup", () => {
      lineIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
    });

    canvas.addEventListener("mouseout", () => {
      lineIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
      canvas.style.cursor = "default";
    });

    drawLinePoints();
    updateCanvasCoordinates();
  }

  const EVENT_FILTERS = [
    { filter: "face", label: "Face" },
    { filter: "person", label: "Person" },
    { filter: "alpr", label: "Vehicle" },
    { filter: "heatmap", label: "Heatmap" },
    { filter: "fire", label: "Fire" },
  ];

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

  function checkIfMobile() {
    isMobile = window.matchMedia("(max-width: 1024px)").matches;
  }

  $: filteredEvents = $liveEvents.filter((event) => {
    const hasValidSearchQuery = eventSearchQuery.trim() !== "";
    const matchesSearchQuery = hasValidSearchQuery
      ? event.title?.toLowerCase().includes(eventSearchQuery?.toLowerCase())
      : true;
    const matchesFilter = selectedEventFilter
      ? event.type === selectedEventFilter
      : true;
    return matchesSearchQuery && matchesFilter;
  });

  onMount(() => {
    checkIfMobile(); // Initial check
    window.addEventListener("resize", checkIfMobile); // Update on resize
    // addAuthLogs("login", $user?.email || "");

    return () => {
      window.removeEventListener("resize", checkIfMobile); // Clean up
    };
  });

    // Saving ROI Details to db
    async function updateAi() {
    try {
       await pb.collection("camera").update($selectedCamera,{
        isRoiEnabled:true,
        roiCanvasCoordinates:$canvasCoordinates
      });
      isOpen.set(false);
      toast.success("Roi Details Saved Successfully");
      draw = false;
    } catch (error) {
      toast?.error(error?.message||"Something went wrong while adding ROI Cameras");
      console.log('error updating roi camera',error?.message);
    }
  }
</script>

<div class="w-full">
  <Resizable.PaneGroup
    direction="horizontal"
    autoSaveId="LENSViewPaneSize"
    style="height: calc(100vh-3rem);"
  >
    <Resizable.Pane defaultSize={70}>
      <StreamLayout {STREAM_URL} />
    </Resizable.Pane>
    <Resizable.Handle withHandle class="hidden lg:flex" />
    <Resizable.Pane
      style={`${!isPaneCollapsed ? "overflow: visible;" : "overflow: hidden;"}`}
      class="hidden lg:block"
      maxSize={50}
      defaultSize={22}
      bind:pane={paneOne}
      collapsible={true}
      collapsedSize={0}
      minSize={0}
      onResize={(e) => {
        if (e < 10) {
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
                {#if $isAlertPanelOpen || $isRoiPanelOpen}
                  <div class="flex">
                    {#if currentPanel == 0}
                      <CameraList />
                    {:else if currentPanel == 1}
                      <div
                        class="border-l flex flex-col p-2 overflow-visible w-full min-w-[360px]"
                      >
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
                            <Accordion.Root
                              multiple
                              value={["open"]}
                              class="m-4"
                            >
                              <Accordion.Item value="open">
                                <Accordion.Trigger
                                  >Whitelisted</Accordion.Trigger
                                >
                                <Accordion.Content>
                                  <div
                                    class="flex flex-col gap-4 max-h-[calc(100vh-22rem)] h-60 overflow-y-auto"
                                  >
                                    {#each $gallery.filter((event: any) => !event.blackList) as event}
                                      <ComfortableCard {event} />
                                    {:else}
                                      <div class="p-3">
                                        No whitelisted faces
                                      </div>
                                    {/each}
                                  </div>
                                </Accordion.Content>
                              </Accordion.Item>
                              <Accordion.Item value="item-2">
                                <Accordion.Trigger
                                  >BlackListed</Accordion.Trigger
                                >
                                <Accordion.Content>
                                  <div
                                    class="flex flex-col gap-4 max-h-[calc(100vh-22rem)] overflow-y-auto h-60"
                                  >
                                    {#each $gallery.filter((event: any) => event.blackList) as event}
                                      <ComfortableCard {event} />
                                    {:else}
                                      <div class="p-3">
                                        No blacklisted faces
                                      </div>
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
                              <!-- Filters and Search -->
                              <div
                                class="flex gap-3 items-center justify-between p-2"
                              >
                                <Input
                                  bind:value={eventSearchQuery}
                                  placeholder="Search"
                                  class="w-48 focus:outline-none focus:ring-0"
                                />
                                <!-- Filter -->
                                <DropdownMenu.Root>
                                  <DropdownMenu.Trigger asChild let:builder>
                                    <Button
                                      builders={[builder]}
                                      class="text-xs h-10"
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Icon
                                        icon="mdi:filter-outline"
                                        class="w-5 h-5"
                                      />
                                    </Button>
                                  </DropdownMenu.Trigger>
                                  <DropdownMenu.Content class="w-48">
                                    <DropdownMenu.Label
                                      >Filters</DropdownMenu.Label
                                    >
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Group>
                                      {#each EVENT_FILTERS as filter}
                                        <DropdownMenu.Item
                                          class="flex items-center justify-between"
                                          on:click={() => {
                                            if (
                                              selectedEventFilter ==
                                              filter.filter
                                            ) {
                                              selectedEventFilter = "";
                                            } else {
                                              selectedEventFilter =
                                                filter.filter;
                                            }
                                          }}
                                        >
                                          <span>{filter.label}</span>
                                          {#if selectedEventFilter == filter.filter}
                                            <Icon icon="mdi:check" />
                                          {/if}
                                        </DropdownMenu.Item>
                                      {/each}
                                    </DropdownMenu.Group>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Root>
                              </div>
                              {#if filteredEvents.length > 0}
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                {#each filteredEvents as event}
                                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                                  <div
                                    class="flex bg-accent p-4 rounded-xl shadow-sm hover:border hover:border-primary relative group overflow-visible cursor-pointer"
                                    on:click={() => openEventModal(event)}
                                  >
                                    <div
                                      class="flex gap-6 items-center flex-grow"
                                    >
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
                                          <div
                                            class="flex items-center space-x-1"
                                          >
                                            {#if eventTypeIcons[event.type]}
                                              <Icon
                                                icon={eventTypeIcons[
                                                  event.type
                                                ]}
                                                width="20"
                                              />
                                            {/if}
                                            <h3 class="text-sm">
                                              {event.title ||
                                                "Unknown Identity"}
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
                                  No {EVENT_FILTERS.find(
                                    (filter) =>
                                      filter.filter === selectedEventFilter
                                  )?.label} events yet. Displaying only live events.
                                </div>
                              {/if}
                            </div>
                          </Tabs.Content>
                        </Tabs.Root>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="flex">
                    <CameraList />
                  </div>
                {/if}

                {#if selectedEvent}
                  <EventAlertModal
                    event={selectedEvent}
                    onClose={closeEventModal}
                  ></EventAlertModal>
                {/if}

                {#if $isAlertPanelOpen || $isRoiPanelOpen}
                  <div
                    class="absolute z-50 -translate-x-full top-44 transform -left-8 transition-all duration-500 ease-in-out"
                  >
                    <div
                      class="-rotate-90 flex flex-row-reverse items-center origin-top-right"
                    >
                      <!-- svelte-ignore a11y_no_static_element_interactions -->
                      <div
                        class={`${currentPanel == 0 ? "font-bold bg-accent" : "bg-background/80 "} cursor-pointer h-[32px] rounded-t-xl  text-black dark:text-white px-3 flex  items-center whitespace-nowrap shadow-xl z-40 border dark:border-muted-foreground/10`}
                      >
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
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
                            <Icon
                              icon="material-symbols:close-rounded"
                              width={14}
                            />
                          </button>
                        </div>
                      </div>
                      {#if $isAlertPanelOpen}
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
                              <Icon
                                icon="material-symbols:close-rounded"
                                width={14}
                              />
                            </button>
                          </div>
                        </div>
                      {:else if $isRoiPanelOpen}
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
                            <span>Mark ROI</span>
                            <button
                              class={`text-center items-center flex place-items-center hover:bg-foreground/50 hover:dark:text-black hover:text-white rounded-full hover:m-1`}
                              on:click|stopPropagation={() =>
                                isRoiPanelOpen.set(false)}
                            >
                              <Icon
                                icon="material-symbols:close-rounded"
                                width={14}
                              />
                            </button>
                          </div>
                        </div>
                      {/if}
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

<!-- {#if isMobile}
  <div class="w-full lg:hidden">
    <StreamLayout {STREAM_URL} />
  </div>
{/if} -->
<div class="hidden lg:block">
  <SidePannel isOpen={isOpen}/>
</div>

<Dialog.Root bind:open={$isOpen}>
  <Dialog.Trigger><slot></slot></Dialog.Trigger>
  <Dialog.Content class="h-[90vh] max-w-[75vw]">
    <div
      class="relative h-[76vh] w-full"
    >
      <StreamTile
        name={$selectedCamera?.name}
        id={$selectedCamera?.id}
        url={`${STREAM_URL}/api/ws?src=${$selectedCamera?.id}`}
        isMarkRoi={true}
      ></StreamTile>
      {#if !draw}
      <button
        on:click={toggleDraw}
        class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute bottom-4 left-1/2 -translate-x-1/2 items-center rounded-xl scale-90 z-20"
        ><PenTool size={22} /></button
      >
    {:else}
      <button
        on:click={toggleDraw}
        class="flex gap-2 z-[100] bg-[rgba(0,0,0,.5)] text-white p-2 absolute bottom-4 left-1/2 -translate-x-1/2 items-center rounded-xl scale-90"
        ><X size={22} /></button
      >{/if}
      </div>
      {#if draw}
      <canvas
        id="roicanvas"
        class="bg-transparent z-50 h-fit w-full absolute top-0 left-0"
      ></canvas>
    {/if}
    <div class="w-full p-4 flex items-center gap-4">
      <Button
        on:click={() => {
          updateAi();
        }}>Save</Button
      >
      <Button
        variant="secondary"
        on:click={() => {
          isOpen.set(false);
          selectedCamera.set(null);
        }}>Cancel</Button
      >
    </div>
    </Dialog.Content
  >
</Dialog.Root>
