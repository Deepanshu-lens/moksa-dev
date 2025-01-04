<script lang="ts">
  import { onMount } from "svelte";
  import Sortable from "sortablejs";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import { cameras, nodes, selectedCamera, selectedNode, user } from "@/stores";
  import NodeSelection from "@/components/node/NodeSelection.svelte";
  import NodeActionButton from "@/components/node/crud/NodeActionButton.svelte";
  import { cn } from "@/lib/utils";
  import Icon from "@iconify/svelte";
  import { Input } from "@/components/ui/input";
  import Button from "@/components/ui/button/button.svelte";
  import CameraActionButton from "@/components/camera/crud/CameraActionButton.svelte";
  import {
    ArrowDownZA,
    CalendarArrowDown,
    ArrowUpZA,
    CalendarArrowUp,
    ArrowDownWideNarrow,
    Check,
  } from "lucide-svelte";
  import { writable } from "svelte/store";
  import { getCameras } from "@/managers/get-heathmap";
  import { addUserLogs } from "@/lib/logs/userLogs";
  export let moksa;
  console.log(moksa,'mkk');
  let cameraItems: HTMLDivElement;
  let sortCriteria: string | null = null; // No sort criteria by default
  let sortDirection = "asc"; // Default sort direction
  let searchCriteria = "name"; // Default search criteria
  let isSortingEnabled = false; // Flag to track if sorting is active

  let currentCameras = $cameras;
  let totalCamNodes = {};

  $: {
    totalCamNodes = {
      cameras: currentCameras?.length || 0,
      nodes: $nodes?.length,
    };
  }

  onMount(() => {
    if (cameraItems) {
      Sortable.create(cameraItems, {
        animation: 250,
        chosenClass: "chosen",
        dragClass: "dragged",
        handle: ".my-handle",
      });
    }
  });

  $: {
    // Only sort cameras if sorting is enabled
    currentCameras = isSortingEnabled
      ? sortCameras($cameras, sortCriteria, sortDirection)
      : $cameras;
  }

  function sortCameras(cameras, criteria, direction) {
    return [...cameras].sort((a, b) => {
      let comparison = 0;

      if (criteria === "created") {
        // Sort by created date
        comparison =
          new Date(b.created).getTime() - new Date(a.created).getTime();
      } else {
        // Sort by name with natural sorting
        const extractNumbers = (str) =>
          str.match(/\d+/g) ? parseInt(str.match(/\d+/g)[0], 10) : 0;

        const nameA = a.name?.toLowerCase();
        const nameB = b.name?.toLowerCase();

        if (nameA === nameB) {
          comparison = 0;
        } else {
          const numA = extractNumbers(nameA);
          const numB = extractNumbers(nameB);

          if (nameA.replace(/\d+/g, "") === nameB.replace(/\d+/g, "")) {
            comparison = numA - numB; // Compare numeric parts
          } else {
            comparison = nameA.localeCompare(nameB); // Compare alphabetic parts
          }
        }
      }

      return direction === "asc" ? comparison : -comparison; // Toggle direction
    });
  }

  function handleSortChange(selectedSort) {
    if (sortCriteria === selectedSort) {
      // Toggle sort direction if the same criteria is clicked
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      // Set new criteria and default to ascending
      sortCriteria = selectedSort;
      sortDirection = "asc";
    }

    isSortingEnabled = true; // Enable sorting
    searchCriteria = selectedSort; // Update search criteria
  }

  function handleInput(event) {
    let searchQuery = event.target.value?.toLowerCase();
    let filteredCameras = $cameras.filter((camera) => {
      const nameMatch = camera.name?.toLowerCase().includes(searchQuery);
      const urlMatch = camera.url?.toLowerCase().includes(searchQuery);
      const subUrlMatch =
        camera.subUrl && camera.subUrl?.toLowerCase().includes(searchQuery);

      // Filter based on selected search criteria
      return searchCriteria === "name" ? nameMatch : urlMatch || subUrlMatch;
    });

    // Disable sorting when filtering
    isSortingEnabled = false;
    currentCameras = filteredCameras;
  }
</script>

<section class="border-l overflow-y-auto w-full">
  <div class="w-full p-2 px-4">
    <div class={`flex justify-between items-center gap-4 w-full`}>
      <NodeSelection />
      <div class={cn("flex items-center", "space-x-2")}>
        <NodeActionButton action="add" {moksa}/>
        <NodeActionButton action="edit" />
        <NodeActionButton action="delete" />
      </div>
    </div>
    <div class="border-t mt-2 mb-4 w-full"></div>
    <div
      id="camera-items"
      class={`flex flex-col gap-4 w-full mx-auto max-h-[calc(100vh-3rem)] overflow-y-auto mb-4`}
      bind:this={cameraItems}
    >
      <div class="flex justify-between gap-2 items-center">
        <!-- search Criteria selector -->
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              class="text-xs h-10"
              variant="outline"
              size="sm"
            >
              <ArrowDownWideNarrow size={17} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-36 mr-8">
            <DropdownMenu.Label>Search By</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item
                class="flex items-center justify-between"
                on:click={() => {
                  handleSortChange("name"); // Update sort criteria
                  addUserLogs(
                    "User sorted cameras by name",
                    $user?.email || "",
                    $user?.id || ""
                  );
                  searchCriteria = "name"; // Set search criteria to "name"
                }}
              >
                <div class="flex items-center gap-x-2 justify-between w-full">
                  <span>Camera Name</span>
                  <span>
                    {#if searchCriteria === "name"}
                      <Check class="mr-2" size={12} />
                    {/if}
                  </span>
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                class="flex items-center justify-between"
                on:click={() => {
                  handleSortChange("url"); // Update sort criteria
                  addUserLogs(
                    "User sorted cameras by url",
                    $user?.email || "",
                    $user?.id || ""
                  );
                  searchCriteria = "url"; // Set search criteria to "RTSP URL"
                }}
              >
                <div class="flex items-center gap-x-2 w-full justify-between">
                  <span>RTSP URL</span>
                  <span>
                    {#if searchCriteria === "url"}
                      <Check class="mr-2" size={12} />
                    {/if}
                  </span>
                </div>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <div class="relative w-11/12">
          <Icon
            icon="material-symbols:search-rounded"
            class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 scale-x-[-1]"
          />
          <Input
            type="text"
            name="text"
            placeholder="Search..."
            class="pl-10 w-full border rounded-md"
            on:input={handleInput}
          />
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild let:builder>
            <Button
              builders={[builder]}
              class="text-xs h-10"
              variant="outline"
              size="sm"
            >
              <Icon icon="mdi:filter-outline" class="w-5 h-5" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-48">
            <DropdownMenu.Label>Filters</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Group>
              <DropdownMenu.Item
                class="flex items-center justify-between"
                on:click={() => {
                  handleSortChange("created");
                  addUserLogs(
                    "User sorted cameras by date",
                    $user?.email || "",
                    $user?.id || ""
                  );
                }}
              >
                <span>Date (created on)</span>
                <span>
                  {#if sortDirection === "asc"}
                    <CalendarArrowUp size={15} />
                  {:else}
                    <CalendarArrowDown size={15} />
                  {/if}
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Item
                class="flex items-center justify-between"
                on:click={() => {
                  handleSortChange("name");
                  addUserLogs(
                    "User sorted cameras by name",
                    $user?.email || "",
                    $user?.id || ""
                  );
                }}
              >
                <span> Camera Name </span>
                <span>
                  {#if sortDirection === "asc"}
                    <ArrowUpZA size={15} />
                  {:else}
                    <ArrowDownZA size={15} />
                  {/if}
                </span>
              </DropdownMenu.Item>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <CameraActionButton action="add" icon />
      </div>

      <div
        class="item-count text-xs text-gray-500 flex items-center gap-x-2 w-full justify-center"
      >
        <span>
          Total Cameras: {totalCamNodes?.cameras}
        </span>
        |
        <span>
          Total Nodes: {totalCamNodes?.nodes - 1}
        </span>
      </div>
    </div>
    <div class="overflow-y-auto max-h-[calc(100vh-14rem)]">
      {#each currentCameras as camera, index}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <article
          class={cn(
            "flex items-center p-4 dark:border bg-accent my-4 hover:border hover:border-primary space-x-4 rounded-xl text-sm z-10 w-full px-4 relative",
            {
              "border dark:border-white border-green-400":
                camera.id === $selectedCamera,
            }
          )}
          on:click={() => {
            if ($selectedCamera === camera.id) selectedCamera.set("");
            else selectedCamera.set(camera.id.replace(/_FULL$/, ""));
          }}
        >
          <Icon
            icon="material-symbols:menu"
            class="h-4 w-4 cursor-grab flex-shrink-0 my-handle"
          />
          <div class="grid gap-1 flex-grow">
            <h3 class="text-sm font-medium whitespace-nowrap truncate">
              {camera.name?.length > 11
                ? camera.name?.substring(0, 10) + "..."
                : camera.name}
            </h3>
            <p class={`text-xs w-full truncate`}>
              {camera.url?.split("@")?.[1]?.split("/")?.[0]?.split(":")?.[0]}
            </p>
          </div>
          <div
            class="flex flex-row gap-0 xl:ml-auto space-x-2 list-none cursor-pointer items-end"
          >
            <CameraActionButton {camera} action="edit" icon={true} />
            <CameraActionButton {camera} action="settings" icon={true} />
            <CameraActionButton {camera} action="ptz" icon={true} />
            <CameraActionButton {camera} action="delete" icon={true} />
          </div>
          {#if $selectedNode === "all" && $nodes?.find((node) => node.id === camera?.node[0])?.name}
            <span
              class="absolute left-0 -top-2 z-10 py-0.5 px-2 bg-purple-200 rounded-2xl text-xs text-black"
            >
              {$nodes.find((node) => node.id === camera?.node[0])?.name}
            </span>
          {/if}
        </article>
      {/each}
    </div>
  </div>
</section>
