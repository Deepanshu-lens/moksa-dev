<script lang="ts">
  import CameraMoksaCard from "./../cards/CameraMoksaCard.svelte";
  import type { Camera } from "@/types";
  import { Cctv, Command, Search } from "lucide-svelte";
  import AddCameraDialog from "../dialogs/AddCameraDialog.svelte";
  import Sortable from "sortablejs";
  import { Input } from "../ui/input";
  import { onMount } from "svelte";
  import {
    selectedNode,
    filteredNodeCameras,
    cameraCounts,
  } from "@/lib/stores";
  import Button from "../ui/button/button.svelte";
  export let showItems: boolean;
  import { addUserLog } from "@/lib/addUserLog";
  import { page } from "$app/stores";
  import PocketBase from "pocketbase";
  import { writable } from "svelte/store";

  let showOptions = writable("");
  export let isAllFullScreen: boolean;
  export let user;
  export let data;
  // export let showOptions;
  export let ptzControl;
  let cameraItems: HTMLDivElement;
  let filterText: string = "";
  const PB = new PocketBase(`https://server.moksa.ai`);
  // console.log(data.user)

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      const input = document.getElementById("searchInput") as HTMLInputElement;
      input.blur(); // Remove focus from the input
    }
  }

  onMount(function () {
    if (cameraItems) {
      Sortable.create(cameraItems, {
        animation: 250,
        chosenClass: "chosen",
        dragClass: "dragged",
        handle: ".my-handle",
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Command + / or Ctrl + / is pressed
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault(); // Prevent the default action to avoid any conflicts
        const input = document.getElementById("searchInput");
        input?.focus();
      }
    };

    // Add the event listener to the window object
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Cleanup the event listener when the component is destroyed
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  onMount(async () => {
    PB.autoCancellation(false);
    PB.collection("personCounter").subscribe("*", async (e: any) => {
      const cameraId = e.record.camera;
      const updatedCount = e.record.count;

      // console.log("cameraId", cameraId);
      // console.log("updatedCount", updatedCount);
      cameraCounts.update((counts) => {
        counts[cameraId] = updatedCount;
        return counts;
      });
    });
  });

  $: if ($selectedNode?.camera) {
    if (filterText) {
      const exactMatches = $selectedNode.camera.filter(
        (camera: Camera) =>
          camera.name.toLowerCase() === filterText.toLowerCase(),
      );
      filteredNodeCameras.set(
        exactMatches.length > 0
          ? exactMatches
          : $selectedNode.camera.filter((camera: Camera) =>
              camera.name.toLowerCase().includes(filterText.toLowerCase()),
            ),
      );
    } else {
      filteredNodeCameras.set($selectedNode.camera);
    }
  }

  function filterItems(e: Event) {
    filterText = (e.target as HTMLInputElement).value;
  }

  // $: console.log($filteredNodeCameras)
</script>

{#if $selectedNode?.camera?.length === 0}
  <div class="w-full py-24 flex justify-center items-center">
    <div class="flex flex-col space-y-6 mx-auto items-center">
      <Cctv size={64} />
      <AddCameraDialog nodes={data.nodes} sNode={""} {user}>
        <Button class="mx-auto text-center disabled:cursor-not-allowed"
          >Add Camera</Button
        >
      </AddCameraDialog>
    </div>
  </div>
{:else}
  <!-- START Camera Filtering -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->

  <div
    id="camera-list"
    class={`relative flex items-center p-4 gap-8 bg-background transition-all duration-100 ${isAllFullScreen ? "bg-black" : ""}
          ${!showItems ? "opacity-0" : "opacity-100"}`}
    on:click={() => {
      addUserLog("user clicked on search cameralist");
    }}
  >
    <span
      class={`absolute  top-1/2 -translate-y-1/2 left-6 transition-all duration-100 
          ${!showItems ? "opacity-0" : "opacity-100"}`}
    >
      <Search
        size={18}
        class={isAllFullScreen ? "text-white" : "text-black dark:text-white"}
      />
    </span>
    <span class="relative w-full">
      <Input
        id="searchInput"
        type="text"
        name="search-input"
        placeholder="Search"
        autocomplete="off"
        autocapitalize="off"
        class={`
                bg-transparent transition-all duration-100
                ${!showItems ? "opacity-0" : "opacity-100"}
                border border-gray-300 
                dark:border-[#333] ${isAllFullScreen ? "text-gray-300" : "text-gray-900 dark:text-gray-300 "} capitalize
                text-sm sm:text-[10px] md:text-xs lg:text-sm xl:text-md rounded-lg
                block py-2.5 pl-10 box-border dark:focus:border-black
                dark:active:border-black
                `}
        on:input={filterItems}
        on:keydown={handleEscape}
      />
      <span
        class={`flex absolute items-center gap-1 text-sm top-1/2 -translate-y-1/2 right-2 ${
          isAllFullScreen ? "text-gray-300" : "text-gray-900 dark:text-gray-300"
        }`}
      >
        <Command
          class={`h-4 w-4 ${isAllFullScreen ? "text-gray-300" : "text-gray-900 dark:text-gray-300"}`}
        /> /
      </span>
    </span>
  </div>
  <!-- END Camera Filtering -->

  <!-- START Camera Cards -->
  {#if $filteredNodeCameras.length > 0}<div
      id="camera-items"
      class={`flex flex-col gap-4 w-full max-w-screen-md mx-auto h-[calc(100vh-200px)] overflow-y-auto overflow-x-clip
                  transition-all duration-100 fade-in-0
                  p-4 pt-0
                  rounded-lg 
                  ${showItems ? "opacity-100 " : "opacity-0"}`}
      bind:this={cameraItems}
    >
      {#each $filteredNodeCameras as camera}
        {#key $selectedNode}
          <CameraMoksaCard
            {ptzControl}
            {showOptions}
            cameraId={camera.id}
            name={camera?.name}
            url={camera?.url}
            subUrl={camera?.subUrl}
            save={camera?.save}
            face={camera?.expand?.inference?.face}
            vehicle={camera?.expand?.inference?.vehicle}
            faceDetectionThreshold={camera?.expand?.inference?.faceDetThresh}
            faceSearchThreshold={camera?.expand?.inference?.faceMatchThresh}
            vehicleDetectionThreshold={camera?.expand?.inference?.vehDetThresh}
            vehiclePlateThreshold={camera?.expand?.inference?.vehPlateThresh}
            vehicleOCRThreshold={camera?.expand?.inference?.vehOCRThresh}
            saveFolder={camera?.saveFolder}
            saveDuration={camera?.saveDuration}
            motion={camera?.expand?.inference?.motionThresh}
            priority={camera?.expand?.inference?.priority}
            running={camera?.expand?.inference?.running}
            runningThresh={camera?.expand?.inference?.runningThresh}
            intrusionDetection={camera?.expand?.inference?.intrusionDetection}
            intrusionPerson={camera?.expand?.inference?.intrusionPerson}
            intrusionVehicle={camera?.expand?.inference?.intrusionVehicle}
            lineCrossing={camera?.expand?.inference?.lineCrossing}
            linePerson={camera?.expand?.inference?.linePerson}
            lineVehicle={camera?.expand?.inference?.lineVehicle}
            linePersonThresh={camera.linePersonThresh}
            lineVehicleThresh={camera?.expand?.inference?.lineVehicleThresh}
            intrusionPersonThresh={camera?.expand?.inference
              ?.intrusionPersonThresh}
            intrusionVehicleThresh={camera?.expand?.inference
              ?.intrusionVehicleThresh}
            sparshID={camera?.sparshID}
            personCount={camera.personCount}
            {isAllFullScreen}
            features={user.features}
            role={data.user.role}
            ptz={camera.ptz}
            preset={camera.preset}
            lastCords={camera.lastCords}
            theft={camera.expand?.inference?.theft}
            safety={camera.expand?.inference?.safety}
            person={camera.expand?.inference?.person}
            employeEE={camera.expand?.inference?.employeEE}
            theftDetectionThresh={camera?.theftDetectionThresh}
            heatmap={camera?.expand?.inference?.heatmap}
            cameraNo={camera?.cameraNo}
            moksaId={camera?.cameraId}
          />
        {/key}
      {/each}
    </div>
  {:else}<div
      class={`${isAllFullScreen ? "text-slate-300" : "text-black/[.7] dark:text-slate-300"} px-4 text-sm flex flex-row items-center gap-1 my-4`}
    >
      No cameras found with that name or URL.
    </div>
  {/if}
  <!-- END Camera Cards -->
{/if}
