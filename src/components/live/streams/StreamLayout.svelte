<script>
  import {
    cameras,
    selectedLayout,
    totalCameras,
    nodes,
    user,
    selectedNode,
    captureRef,
    customLayout,
  } from "@/stores";
  import pb from "@/lib/pb";
  import StreamTile from "./StreamTile.svelte";
  import Pagination from "./pagination/Pagination.svelte";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { displayCameras } from "@/stores/camera";
  import { PictureInPicture2 } from "lucide-svelte";
  import PocketBase from "pocketbase";

  export let STREAM_URL;
  const isMobile = writable(false);
  const priorityIndex = writable(0);
  const secondPriIndex = writable(1);
  let localCaptureRef;
  let custom_layout;
  let gridStyle;
  let nodeName = "";
  const pb_online = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL);

  // // Function to determine the grid style based on the number of cameras
  const layoutConfigs = {
    6: "grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr);", // 6x6
    5: "grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr);", // 5x5
    4: "grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr);", // 4x4
    3: "grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);", // 3x3
    2: "grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);", // 2x2
    1: "grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(1, 1fr);", // 1x1
    7: `
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      grid-template-areas:
        "bigCell1 bigCell1 ."
        "bigCell1 bigCell1 ."
        ". . .";
    `, // 1+5 layout
    8: `
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      grid-template-areas:
        "bigCell1 bigCell1 bigCell1 ."
        "bigCell1 bigCell1 bigCell1 ."
        "bigCell1 bigCell1 bigCell1 ."
        ". . . .";
    `, // 1+7 layout
    9: `
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      grid-template-areas:
        "bigCell1 bigCell1 . ."
        "bigCell1 bigCell1 . ."
        ". . . ."
        ". . . .";
    `, // 1+12 layout
    10: `
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      grid-template-areas:
        "bigCell1 bigCell1 bigCell2 bigCell2"
        "bigCell1 bigCell1 bigCell2 bigCell2"
        ". . . ."
        ". . . .";
    `, // 2+8 layout
  };

  function getGridStyle(cameraCount, layoutIndex) {
    if ($isMobile) {
      // Mobile view: 1 column and multiple rows based on cameraCount
      return `grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(${cameraCount}, 150px);`;
    }
    if (custom_layout && custom_layout.rows > 0 && custom_layout.columns > 0) {
      return `grid-template-columns: repeat(${custom_layout.columns}, 1fr); grid-template-rows: repeat(${custom_layout.rows}, 1fr);`;
    } else if (layoutIndex > 0 && layoutIndex < 11) {
      return layoutConfigs[layoutIndex];
    } else if (layoutIndex === 0) {
      switch (cameraCount) {
        case 1:
          return `grid-template-columns: repeat(1, 1fr); grid-template-rows: repeat(1, 1fr);`;
        case 2:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);`;
        case 3:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);`;
        case 4:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr);`;
        case 5:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr);`;
        case 6:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr);`;
        case 7:
          return `grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr);`;
        case 8:
          return `grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);`;
        case 9:
          return `grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);`;
        default:
          return `grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);`;
      }
    }
  }

  // Reactive statement to calculate the grid style dynamically
  $: gridStyle = getGridStyle($cameras.length, $selectedLayout);

  customLayout.subscribe((value) => {
    if (value && value.rows > 0 && value.columns > 0) {
      custom_layout = value;
    } else {
      custom_layout = {};
    }
    gridStyle = getGridStyle($cameras.length, $selectedLayout);
  });

  const addNode = async () => {
    let record;
    let record_offline;
    const data = {
      name: nodeName,
      session: $user.session[0],
    };
    if (window.api) {
      record = await pb_online.collection("node").create(data);
      if (record) record_offline = pb.collection("node").create(record);
      else record_offline = await pb.collection("node").create(data);

      if (record) $selectedNode.set(record.id);
      else if (record_offline) $selectedNode.set(record_offline.id);
    } else {
      record = await pb.collection("node").create(data);
      $selectedNode.set(record.id);
    }
  };

  onMount(() => {
    const updateScreenSize = () => {
      isMobile.set(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  });

  $: captureRef.set(localCaptureRef);
  displayCameras.subscribe(() => priorityIndex.set(0));

  // Function to draw lines on the canvas
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

  function showCanvasPoints() {
    setTimeout(() => {
      $displayCameras.forEach((camera, index) => {
        let canvas = document.getElementById(`stream-canvas-${index}`);
        if (camera?.isRoiEnabled) {
          drawLinesRectangles(
            canvas,
            camera?.roiCanvasCoordinates,
            camera?.roiRectangleCoordinates
          );
        }
      });
    }, 2000);
  }

  displayCameras?.subscribe((value) => {
    showCanvasPoints();
  });
</script>

{#if $nodes && $user}
  {#if $nodes.length === 0}
    <div
      class="
        flex
        flex-col
        items-start
        justify-center h-screen w-screen
        dark:bg-dark-add-node
        bg-no-repeat
        pl-32
        bg-light-add-node
        bg-contain
        bg-right
        dark:bg-cover"
    >
      <form
        on:submit={(e) => e.preventDefault()}
        method="POST"
        class="flex flex-col"
      >
        <label for="nodeName" class="font-medium text-start self-start mb-2">
          Node name
        </label>
        <input
          name="name"
          required
          bind:value={nodeName}
          class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
        />
        <button
          class="flex max-w-[160px] hover:bg-[#015a62]/[.9] dark:bg-transparent bg-[#015a62] border-2 border-white border-solid dark:hover:bg-[white] dark:hover:text-[#015a62] text-md text-white items-center justify-center py-2 px-6 font-medium rounded-lg"
          type="submit"
          on:click={addNode}
        >
          Add Store
        </button>
      </form>
    </div>
  {:else}
    <div class="flex flex-col flex-grow mt-4">
      <div
        bind:this={localCaptureRef}
        class="grid grid-cols-1 gap-4 p-4 w-full lg:grid-cols-4 camera-grid pb-[20vh] lg:pb-2"
        style={gridStyle + "height: calc(100vh - 7.5rem); overflow-y: auto;"}
      >
        {#key $displayCameras}
          {#each $displayCameras as camera, index}
            <div
              class="relative"
              style={$selectedLayout > 6 && $selectedLayout < 10
                ? index === $priorityIndex && "grid-area: bigCell1;"
                : $selectedLayout === 10
                  ? index === $priorityIndex
                    ? "grid-area: bigCell1;"
                    : index === $secondPriIndex && "grid-area:bigCell2;"
                  : ""}
            >
              <StreamTile
                name={camera?.name}
                id={camera?.streamType !== "Default"
                  ? camera?.streamType === "Mainstream"
                    ? `${camera?.id}_FULL`
                    : `${camera?.id}`
                  : $displayCameras.length > 4
                    ? `${camera?.id}`
                    : `${camera?.id}_FULL`}
                url={camera?.streamType !== "Default"
                  ? camera?.streamType === "Mainstream"
                    ? `${STREAM_URL}/api/ws?src=${camera?.id}_FULL`
                    : `${STREAM_URL}/api/ws?src=${camera?.id}`
                  : $displayCameras.length > 4
                    ? `${STREAM_URL}/api/ws?src=${camera?.id}`
                    : `${STREAM_URL}/api/ws?src=${camera?.id}_FULL`}
              ></StreamTile>
              <canvas
                id={`stream-canvas-${index}`}
                class="absolute top-0 left-0 w-full h-full p-3"
                style="pointer-events: none;"
              ></canvas>
              {#if index !== $priorityIndex && $selectedLayout > 6 && $selectedLayout < 10}
                <button
                  class="absolute bottom-4 left-4"
                  on:click={() => {
                    priorityIndex.set(index);
                  }}
                >
                  <PictureInPicture2 size={16} />
                </button>
              {/if}
              {#if index !== $priorityIndex && index !== $secondPriIndex && $selectedLayout === 10}
                <div
                  class="absolute bottom-3 left-4 flex justify-between items-center py-3 gap-2"
                >
                  <button
                    on:click={() => {
                      priorityIndex.set(index);
                    }}
                  >
                    <PictureInPicture2 size={16} />
                  </button>
                  <button
                    on:click={() => {
                      secondPriIndex.set(index);
                    }}
                  >
                    <PictureInPicture2 size={16} class="scale-x-[-1]" />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        {/key}
      </div>

      {#if $totalCameras > 0}
        <Pagination />
      {/if}
    </div>
  {/if}
{/if}
