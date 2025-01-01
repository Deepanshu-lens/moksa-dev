<script lang="ts">
    import P5 from 'p5-svelte';
  import StreamLayout from "./streams/StreamLayout.svelte";
  import * as Dialog from "@/components/ui/dialog";
  import * as Resizable from "@/components/ui/resizable";
  import Icon from "@iconify/svelte";
  import CameraList from "@/components/live/cameraList/CameraList.svelte";
  import {
    nodes,
    liveEvents,
    gallery,
    isAlertPanelOpen,
    isRoiPanelOpen,
    cameras,
    selectedCamera,
    user,
  } from "@/stores";
  import SidePannel from "./side-pannel.svelte";
  import EventAlertModal from "../events/EventAlertModal.svelte";
  import { toast } from "svelte-sonner";
  import * as Tabs from "@/components/ui/tabs";
  import * as Accordion from "@/components/ui/accordion/index.ts";
  import ComfortableCard from "./alerts/comfortable-card.svelte";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import { PaneResizer, type PaneAPI } from "paneforge";
  import Button from "../ui/button/button.svelte";
  import Input from "../ui/input/input.svelte";
  import { onMount } from "svelte";
  import { PenTool,X,RectangleHorizontal,RotateCw,Scaling } from "lucide-svelte";
  import getStreamURL from "@/lib/url";
  import { cn } from "@/lib/utils";
  import { writable } from 'svelte/store';
  import StreamTile from './streams/StreamTile.svelte';
  import pb from '@/lib/pb';
  import { addUserLogs } from '@/lib/logs/userLogs';
  const STREAM_URL = getStreamURL();

  let currentPanel = 1;
  let isPaneCollapsed = false;
  let paneOne: PaneAPI;
  let shouldUpdateContainer = false;
  let isMobile = false;
  let selectedEventFilter = "";
  let eventSearchQuery = "";
  let isOpen = writable(false);
  let lines = []; // Array to store lines, each line is an array of two points
  let rectangles = []; // Array to store drawn rectangles

  let roiCamera = writable(null);
  let p5Instance;
  let canvas;

  let isDrawingLines = false; // Track whether we are in line drawing mode
  let isDrawingRectangles = false; // Track whether we are in rectangle drawing mode
  let isRotating = false; // Whether we are in rotate mode
  let isResizing = false; // Whether we are in resize mode

  function toggleDraw() {
    isDrawingLines =!isDrawingLines;
    isDrawingRectangles = false;
    isRotating=false;
    isResizing=false;
  }

  // Function to toggle drawing mode
  const toggleDrawingMode = () => {
    isDrawingLines=false;
    isDrawingRectangles=!isDrawingRectangles;
    isRotating=false;
    isResizing=false;
  };

  const sketch = (p) => {
  let startX, startY; // Starting coordinates for drawing
  let currentRect = null; // The current rectangle being drawn
  let currentLine = null; // The current line being drawn
  let selectedRect = null; // The rectangle being rotated or resized
  let initialMouseAngle = 0; // Initial angle between mouse and rectangle center
  let initialRectAngle = 0; // Initial angle of the rectangle
  let initialWidth = 0, initialHeight = 0; // Initial width and height of the rectangle
  let initialMouseX = 0, initialMouseY = 0; // Initial mouse position for resizing and rotating
  p5Instance = p;

  p.setup = () => {
    p.createCanvas(1050, 610); // Adjusted to match your existing canvas size
    p.background(0, 0, 0, 0); // Transparent background
  };

  p.draw = () => {
    p.clear(); // Clear canvas for redraw

    // Draw all completed rectangles
    for (let rect of rectangles) {
      p.push();
      p.translate(rect.x + rect.w / 2, rect.y + rect.h / 2); // Move origin to rectangle center
      p.rotate(p.radians(rect.angle || 0)); // Rotate rectangle using stored angle
      p.noFill(); // Transparent interior
      p.stroke(0, 0, 255); // Blue color for the border
      p.strokeWeight(2); // Border thickness
      p.rectMode(p.CENTER);
      p.rect(0, 0, rect.w, rect.h); // Draw rectangle

      // Draw rotation handles (for rotation and resizing)
      const halfW = rect.w / 2;
      const halfH = rect.h / 2;
      const handleSize = 10;

      p.fill(0, 255, 0); // Green color for handles
      p.noStroke();
      p.ellipse(-halfW, -halfH, handleSize); // Top-left
      p.ellipse(halfW, -halfH, handleSize); // Top-right
      p.ellipse(-halfW, halfH, handleSize); // Bottom-left
      p.ellipse(halfW, halfH, handleSize); // Bottom-right
      p.pop();
    }

    // Draw all completed lines
    for (let line of lines) {
      p.stroke(0, 0, 255); // Blue color for line
      p.strokeWeight(2); // Line thickness
      p.line(line.x1, line.y1, line.x2, line.y2); // Draw line
    }

    // Draw the current rectangle while dragging
    if (currentRect) {
      p.noFill(); // Transparent interior
      p.stroke(0, 0, 255); // Blue color for the border
      p.strokeWeight(2); // Border thickness
      p.rect(currentRect.x, currentRect.y, currentRect.w, currentRect.h); // Draw rectangle
    }

    // Draw the current line while dragging
    if (currentLine) {
      p.stroke(0, 0, 255); // Blue color for line
      p.strokeWeight(2); // Line thickness
      p.line(currentLine.x1, currentLine.y1, currentLine.x2, currentLine.y2); // Draw line
    }
  };

  p.mousePressed = () => {
    // Handle rotation or resizing or drawing based on the current mode
    if (isRotating) {
      for (let rect of rectangles) {
        const centerX = rect.x + rect.w / 2;
        const centerY = rect.y + rect.h / 2;
        const halfW = rect.w / 2;
        const halfH = rect.h / 2;

        const handlePositions = [
          { x: centerX - halfW, y: centerY - halfH }, // Top-left
          { x: centerX + halfW, y: centerY - halfH }, // Top-right
          { x: centerX - halfW, y: centerY + halfH }, // Bottom-left
          { x: centerX + halfW, y: centerY + halfH }, // Bottom-right
        ];

        // Check if any handle is clicked (for rotation)
        for (let handle of handlePositions) {
          if (p.dist(p.mouseX, p.mouseY, handle.x, handle.y) <= 10) {
            selectedRect = rect;
            // Calculate initial mouse and rectangle angles for rotation
            initialMouseAngle = Math.atan2(p.mouseY - centerY, p.mouseX - centerX);
            initialRectAngle = p.radians(rect.angle || 0);
            initialMouseX = p.mouseX;
            initialMouseY = p.mouseY;
            return;
          }
        }
      }
    }

    if (isResizing) {
      // Handle resizing
      for (let rect of rectangles) {
        const centerX = rect.x + rect.w / 2;
        const centerY = rect.y + rect.h / 2;
        const halfW = rect.w / 2;
        const halfH = rect.h / 2;

        // Define the vertices (corners) of the rectangle
        const vertices = [
          { x: centerX - halfW, y: centerY - halfH }, // Top-left
          { x: centerX + halfW, y: centerY - halfH }, // Top-right
          { x: centerX - halfW, y: centerY + halfH }, // Bottom-left
          { x: centerX + halfW, y: centerY + halfH }, // Bottom-right
        ];

        // Check if the mouse is near any of the rectangle's vertices (for resizing)
        for (let vertex of vertices) {
          const distance = p.dist(p.mouseX, p.mouseY, vertex.x, vertex.y);
          const handleSize = 15; // Increase size of the "hit" area for resizing (can be adjusted)
          if (distance <= handleSize) {
            selectedRect = rect;
            initialWidth = rect.w;
            initialHeight = rect.h;
            initialMouseX = p.mouseX;
            initialMouseY = p.mouseY;
            return; // Exit the loop once a vertex is selected for resizing
          }
        }
      }
    }


    if (isDrawingRectangles) {
      // Handle rectangle drawing
      startX = p.mouseX;
      startY = p.mouseY;
      currentRect = { x: startX, y: startY, w: 0, h: 0, angle: 0 }; // Initialize a rectangle with no angle
    }

    // Handle line drawing
    if (isDrawingLines) {
      startX = p.mouseX;
      startY = p.mouseY;
      currentLine = { x1: startX, y1: startY, x2: startX, y2: startY }; // Initialize a line
    }
  };

  p.mouseDragged = () => {
    if (isRotating && selectedRect) {
      const centerX = selectedRect.x + selectedRect.w / 2;
      const centerY = selectedRect.y + selectedRect.h / 2;

      // Calculate current mouse angle relative to rectangle center
      const currentMouseAngle = Math.atan2(p.mouseY - centerY, p.mouseX - centerX);

      // Update rectangle's angle
      selectedRect.angle = p.degrees(initialRectAngle + (currentMouseAngle - initialMouseAngle));
    }

    if (isResizing && selectedRect) {
      // Update the width and height based on the mouse position
      selectedRect.w = initialWidth + (p.mouseX - initialMouseX);
      selectedRect.h = initialHeight + (p.mouseY - initialMouseY);
    }

    // Update current rectangle or line dimensions
    if (isDrawingRectangles && currentRect) {
      currentRect.w = p.mouseX - startX;
      currentRect.h = p.mouseY - startY;
    }

    if (isDrawingLines && currentLine) {
      currentLine.x2 = p.mouseX;
      currentLine.y2 = p.mouseY;
    }
  };

  p.mouseReleased = () => {
    if (isRotating || isResizing) {
      // Update the rectangle in the array
      if (selectedRect) {
        const rectIndex = rectangles.findIndex(
          (rect) => rect.x === selectedRect.x && rect.y === selectedRect.y
        );
        if (rectIndex !== -1) {
          rectangles[rectIndex] = selectedRect;
        }
      }

      // selectedRect = null; // Reset the selected rectangle
    }

    if (isDrawingRectangles && currentRect) {
      let isRectangleFake = checkFakeLinesRect(currentRect);
      if (!isRectangleFake) {
        rectangles.push(currentRect); // Add the rectangle to the list
        currentRect = null; // Reset current rectangle
      }
    }

    if (isDrawingLines && currentLine) {
      let isLineFake = checkFakeLinesRect(currentLine);
      if (!isLineFake) {
        lines.push(currentLine); // Add the line to the list
        currentLine = null; // Reset current line
      }
    }
  };

  // Check whether the lines and rectangles drawn are not fake
  function checkFakeLinesRect(currentItem) {
    for (const key in currentItem) {
      if (typeof currentItem[key] === "number" && currentItem[key] % 1 !== 0) {
        return false; // Return true as soon as a whole number is found
      }
    }

    return true;
  }
};


  // handle toggling resizing 
  const toggleResizeMode =()=>{
    isResizing=!isResizing;
    isDrawingRectangles=false;
    isRotating=false;
  }

  // handle toggling rotating 
  const toggleRotateMode =()=>{
    isRotating=!isRotating;
    isDrawingRectangles=false;
    isResizing=false;
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

  function drawLinesRectangles(canvas, coordinates, rectangleCoordinates) {
  if (!!canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.beginPath();

    // Get the current canvas dimensions
    const canvasWidth = canvas.width; // Current canvas width
    const canvasHeight = canvas.height; // Current canvas height

    // Draw lines
    if (coordinates?.length > 0) {
      coordinates?.forEach((line) => {
        const x1 = (line?.x1 / 100) * canvasWidth;
        const x2 = (line?.x2 / 100) * canvasWidth;
        const y1 = (line?.y1 / 100) * canvasHeight;
        const y2 = (line?.y2 / 100) * canvasHeight;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
    }

    // Draw rectangles (including rotated ones)
    if (rectangleCoordinates?.length > 0) {
      rectangleCoordinates?.forEach((rect) => {
        const x = (rect?.x / 100) * canvasWidth;
        const y = (rect?.y / 100) * canvasHeight;
        const w = (rect?.w / 100) * canvasWidth;
        const h = (rect?.h / 100) * canvasHeight;
        const angle = (rect?.angle || 0) * (Math.PI / 180); // Convert angle to radians

        ctx.save(); // Save the current state of the canvas
        ctx.translate(x + w / 2, y + h / 2); // Move origin to rectangle center
        ctx.rotate(angle); // Rotate the rectangle
        ctx.rect(-w / 2, -h / 2, w, h); // Draw rectangle relative to the new origin
        ctx.restore(); // Restore the original canvas state
      });
    }

    ctx.strokeStyle = "blue"; // Set line color
    ctx.lineWidth = 1;
    ctx.stroke(); // Draw the lines and rectangles
  }
}

  function handleClear(){
    let canvasDefault = document.getElementById('roicanvas-default');
    if(canvasDefault){
      const ctxDefault = canvasDefault.getContext("2d");
      ctxDefault.clearRect(0,0,canvasDefault?.clientWidth,canvasDefault.height); //clearing default canvas
    }
    
    if(canvas){
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    }
  }

    // Function to clear all drawn lines and rectangles
  const clearAll = () => {
    lines = []; // Clear the lines array
    rectangles = []; // Clear the rectangles array
    isDrawingLines=false;
    isDrawingRectangles=false;
    isRotating=false;
    isResizing=false;
    if (p5Instance) {
      p5Instance.clear(); // Clear the canvas
      p5Instance.background(0, 0, 0, 0); // Reset to transparent background
    }

    roiCamera.update((value)=>{
      const current = {
        ...value,
        roiCanvasCoordinates:[],
        roiRectangleCoordinates:[],
      }
      return current;
    });
    handleClear();
  };

  onMount(() => {
    checkIfMobile(); // Initial check
    window.addEventListener("resize", checkIfMobile); // Update on resize

    return () => {
      window.removeEventListener("resize", checkIfMobile); // Clean up
    };
  });

  // Saving ROI Details to db
  async function updateAi() {
    try {
        let canvas = document.getElementById("defaultCanvas0");
        // Convert points to percentages based on the current canvas width and height
        const canvasWidth = canvas?.clientWidth; // Current canvas width
        const canvasHeight = canvas?.clientHeight; // Current canvas height
        rectangles?.pop(); //removing unneccessary rectangle drawn
        lines?.pop();

        let lineCoordinates = lines?.map(line => 
            {
              return{
                x1:(line?.x1*100)/canvasWidth,
                x2:(line?.x2*100)/canvasWidth,
                y1:(line?.y1*100)/canvasHeight,
                y2:(line?.y2*100)/canvasHeight
              }
            }
        );

        let rectangleCoordinates = rectangles?.map(rect=>{
          {
            return {
              x:(rect?.x*100)/canvasWidth,
              y:(rect?.y*100)/canvasHeight,
              h:(rect?.h*100)/canvasHeight,
              w:(rect?.w*100)/canvasWidth,
              angle:rect?.angle
            }
          }
        });

        // Adding already existing lines
        if($roiCamera?.isRoiEnabled && $roiCamera?.roiCanvasCoordinates?.length > 0){
          // when current array having lines
          if(lineCoordinates?.length > 0){
            lineCoordinates = [...lineCoordinates, ...$roiCamera?.roiCanvasCoordinates];
          }

           // when current is empty
           else if($roiCamera?.roiCanvasCoordinates?.length>0 && lineCoordinates?.length===0){
            lineCoordinates = [...$roiCamera?.roiCanvasCoordinates];
          }
        }

        // Adding already existing rectangles
        if($roiCamera?.isRoiEnabled && $roiCamera?.roiRectangleCoordinates?.length>0){
          // when current array having rectangles
          if(rectangleCoordinates?.length>0){
            rectangleCoordinates = [...rectangleCoordinates, ...$roiCamera?.roiRectangleCoordinates];
          }
          // when current is empty
          else if($roiCamera?.roiRectangleCoordinates?.length>0 && rectangleCoordinates?.length===0){
            rectangleCoordinates = [...$roiCamera?.roiRectangleCoordinates];
          }
        }

        await pb.collection("camera").update($selectedCamera, {
            isRoiEnabled: (lineCoordinates?.length>0 || rectangleCoordinates?.length>0) ? true:false,
            roiCanvasCoordinates: lineCoordinates?.length>0? lineCoordinates:null,
            roiRectangleCoordinates:rectangleCoordinates?.length>0 ? rectangleCoordinates :null
        });
        addUserLogs("ROI Details Saved Successfully", $user?.email || "", $user?.id || "");
        lines =[];
        rectangles=[];
        isOpen.set(false);
        roiCamera.set(null);
        isDrawingLines=false;
        isDrawingRectangles=false;
        p5Instance=null;
        canvas=null;
        isRotating=false;
        isResizing=false;
        toast.success("ROI Details Saved Successfully");
    } catch (error) {
        toast?.error(error?.message || "Something went wrong while adding ROI Cameras");
    }
  }

  isOpen.subscribe((open)=>{
    if(open){
      let temp = $cameras.find((cam) => cam.id === $selectedCamera);
      roiCamera.set(temp);
      lines=[];
      rectangles=[];
      setTimeout(() => {
        if($roiCamera?.isRoiEnabled && ($roiCamera?.roiCanvasCoordinates?.length>0 || $roiCamera?.roiRectangleCoordinates?.length>0)){
          let canvas = document.getElementById("roicanvas-default");
          drawLinesRectangles(canvas, $roiCamera?.roiCanvasCoordinates,$roiCamera?.roiRectangleCoordinates);
        }
      }, 2000);
    }
  });

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
    <Resizable.Handle
      withHandle
      class={cn("hidden lg:flex", { "lg:hidden": $nodes && $nodes.length < 1 })}
    />
    <Resizable.Pane
      style={`${!isPaneCollapsed ? "overflow: visible;" : "overflow: hidden;"}`}
      class={cn("hidden lg:block", {
        "lg:hidden": $nodes && $nodes?.length < 1,
      })}
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
  <Dialog.Content class="h-[90vh] max-w-[77vw]">
    <div
      class="relative h-[76vh] w-[97%]"
    >
      <StreamTile
        name={$selectedCamera?.name}
        id={$selectedCamera?.id}
        url={`${STREAM_URL}/api/ws?src=${$selectedCamera}`}
        isMarkRoi={true}
      ></StreamTile>
      <div class="flex items-center justify-center">
        <button
          on:click={toggleDraw}
          class={cn("cursor-pointer flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute -bottom-12 left-1/2 -translate-x-1/2 items-center rounded-xl scale-90 z-20", isDrawingLines && "bg-gray-500")}
          ><PenTool size={22} /></button
        >
        <button
          on:click={toggleDrawingMode}
          class={cn("flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute -bottom-12 left-[55%] -translate-x-1/2 items-center rounded-xl scale-90 z-20",isDrawingRectangles && "bg-gray-500")}
          ><RectangleHorizontal size={22} /></button
        >
        <button
          on:click={clearAll}
          class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute -bottom-12 left-[60%] -translate-x-1/2 items-center rounded-xl scale-90 z-20 hover:bg-gray-500"
          ><X size={22} /></button
        >
          <!-- Resize Button -->
        <button
          on:click={toggleResizeMode}
          class={cn("cursor-pointer flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute top-[47%] -right-16 -translate-x-1/2 items-center rounded-xl scale-90 z-20", isResizing && "bg-gray-500")}
        >
          <Scaling size={22} /> <!-- Icon for resizing -->
        </button>

        <!-- Rotate Button -->
        <button
          on:click={toggleRotateMode}
          class={cn("cursor-pointer flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute top-[55%] -right-16 -translate-x-1/2 items-center rounded-xl scale-90 z-20", isRotating && "bg-gray-500")}
        >
          <RotateCw size={22} /> <!-- Icon for rotation -->
        </button>
      </div>
      </div>
      <!-- P5.js canvas -->
       <div class="bg-transparent z-40 h-[70.5vh] absolute top-5 left-5">
        <P5 {sketch} parentDivStyle="position: absolute; top: 0; left: 0; z-index: 10; background: transparent; pointer-events: auto;" />
       </div>
      <canvas
        id="roicanvas-default"
        class="bg-transparent z-30 h-[74.5vh] w-[71vw] absolute top-5 left-5"
      ></canvas>
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

<style>
   canvas {
    z-index: 100; /* Ensure the canvas is visible above/below other elements */
  }
</style>