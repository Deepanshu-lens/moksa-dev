<script lang="ts">
  import { onMount } from "svelte";
  import Sortable from "sortablejs";
  import * as DropdownMenu from "@/components/ui/dropdown-menu/index.js";
  import { cameras, nodes, selectedNode } from "@/stores";
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
  } from "lucide-svelte";

  let cameraItems: HTMLDivElement;
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
  let sortCriteria = "name"; // Default sort criteria
  let sortDirection = "asc"; // Default sort direction

  let currentCameras = $cameras;
  $: currentCameras = sortCameras($cameras, sortCriteria, sortDirection);

  function sortCameras(cameras, criteria, direction) {
    return [...cameras].sort((a, b) => {
      let comparison = 0;

      if (criteria === "created") {
        comparison =
          new Date(b.created).getTime() - new Date(a.created).getTime(); // Sort by created date
      } else {
        comparison = a.name.localeCompare(b.name); // Sort by name
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
    // Reapply the sort with the current criteria and direction
    currentCameras = sortCameras($cameras, sortCriteria, sortDirection);
  }

  function handleInput(event) {
    let searchQuery = event.target.value.toLowerCase();
    let filteredCameras = $cameras.filter((camera) => {
      const nameMatch = camera.name.toLowerCase().includes(searchQuery);
      const urlMatch = camera.url.toLowerCase().includes(searchQuery);
      const subUrlMatch =
        camera.subUrl && camera.subUrl.toLowerCase().includes(searchQuery);
      return nameMatch || urlMatch || subUrlMatch;
    });
    currentCameras = filteredCameras;
  }
</script>

<section class="border-l overflow-y-auto w-full">
  <div class="w-full p-2 px-4">
    <div class={`flex justify-between items-center gap-4 w-full`}>
      <NodeSelection />
      <div class={cn("flex items-center", "space-x-2")}>
        <NodeActionButton action="add" />
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
                on:click={() => handleSortChange("created")}
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
                on:click={() => handleSortChange("name")}
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
    </div>
    <div class="overflow-y-auto max-h-[calc(100vh-12rem)]">
      {#each currentCameras as camera, index}
        <article
          class="flex items-center p-4 dark:border bg-accent my-4
              hover:border hover:border-primary space-x-4
              rounded-xl text-sm z-10 w-full px-4"
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
            <CameraActionButton {camera} action="edit" />
            <CameraActionButton {camera} action="delete" />
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>
