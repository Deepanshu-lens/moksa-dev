<script lang="ts">
  import { toast } from "svelte-sonner";
  import { Edit, Settings, Trash, Menu, Users } from "lucide-svelte";
  import { hoveredCamera, selectedNode, cameraCounts } from "@/stores";
  import { activeCamera } from "@/lib/stores";
  import CameraEditDialog from "../dialogs/CameraEditDialog.svelte";
  import { writable } from "svelte/store";
  import { onMount } from "svelte";
  import CameraSettingDialogTech from "../dialogs/CameraSettingDialogTech.svelte";

  export let isAllFullScreen: boolean;

  export let cameraId: string;
  export let name: string;
  export let url: string;
  export let save: boolean;
  export let face: boolean;
  export let vehicle: boolean;
  export let faceDetectionThreshold: number;
  export let faceSearchThreshold: number;
  export let vehicleDetectionThreshold: number;
  export let vehiclePlateThreshold: number;
  export let vehicleOCRThreshold: number;
  export let saveDuration: number;
  export let saveFolder: string;
  export let motion: number;
  export let priority: boolean;
  export let running: boolean;
  export let runningThresh: number;
  export let intrusionDetection: boolean;
  export let intrusionPerson: boolean;
  export let intrusionVehicle: boolean;
  export let intrusionPersonThresh: number;
  export let intrusionVehicleThresh: number;
  export let lineCrossing: boolean;
  export let linePerson: boolean;
  export let lineVehicle: boolean;
  export let linePersonThresh: number;
  export let lineVehicleThresh: number;
  export let sparshID: string;
  export let personCount;

  let hasShownToast = false;

  $: count = $cameraCounts[cameraId];

  $: {
    if (count > 4 && !hasShownToast) {
      toast(`Number of people in Camera:${name} exceeded the fixed threshold`);
      hasShownToast = true;
    } else if (count <= 4) {
      hasShownToast = false;
    }
  }

  onMount(() => {
    return () => {
      hasShownToast = false;
    };
  });

  // CODE

  // console.log(features);

  const deleteCamera = () => {
    fetch("/api/camera/deleteCamera", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraId,
        nodeId: $selectedNode.id,
        name,
        url,
      }),
    }).then(() => {
      document.getElementById(`stream-${cameraId}`)?.remove();
      toast("Camera deleted");
    });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
  class={`flex  items-center gap-4 p-4 dark:border 
              hover:border hover:border-primary ${isAllFullScreen && "text-slate-100"}
              rounded-xl shadow-md text-sm z-10 w-full px-4
          ${cameraId === $activeCamera ? ` border animate-gradient-border  ${isAllFullScreen ? "bg-black" : "bg-[#f9f9f9] dark:bg-black"}` : `${isAllFullScreen ? "bg-black" : "bg-[#f9f9f9] dark:bg-black"}`}
        `}
  on:mouseover={() => {
    hoveredCamera.set(cameraId);
  }}
  on:click={() => {
    activeCamera.update((previous) => (previous === cameraId ? "" : cameraId));
  }}
  on:mouseleave={() => {
    hoveredCamera.set("");
  }}
>
  <Menu class=" h-4 w-4 my-handle cursor-grab flex-shrink-0" />
  <div class="grid gap-1">
    <span class="flex items-center gap-2">
      <h3 class="text-sm font-medium whitespace-nowrap">
        {!isNaN(parseInt(name)) && String(parseInt(name)) === name
          ? "Camera"
          : ``}{" "}
        {name?.length > 11 ? name?.substring(0, 10) + "..." : name}
      </h3>
      {#if personCount}
        <span
          class="flex items-center gap-1 text-black dark:text-white/[.8] font-medium text-xs"
        >
          <Users class="h-4 w-4 flex-shrink-0" />
          {count === undefined ? "N/A" : count}
        </span>{/if}
    </span>
    <p class="text-xs">
      {url?.split("@")?.[1]?.split("/")?.[0]?.split(":")?.[0].length > 15
        ? url
            ?.split("@")?.[1]
            ?.split("/")?.[0]
            ?.split(":")?.[0]
            .substring(0, 15) + "..."
        : url?.split("@")?.[1]?.split("/")?.[0]?.split(":")?.[0]}
    </p>
  </div>

  <ul class="flex flex-row gap-2 xl:ml-auto p-0 list-none cursor-pointer">
    <li class="cursor-pointer hover:scale-125">
      <!-- {#if features && features.includes("camera settings")} -->
      <CameraEditDialog {name} {url} {cameraId} {sparshID}>
        <Edit class="h-4 w-4" />
      </CameraEditDialog>
      <!-- {/if} -->
    </li>
    <li
      class="cursor-pointer hover:scale-125"
    >
      <!-- <CameraSettingsDialog
        cameraName={name}
        {save}
        {face}
        {vehicle}
        {running}
        runningDetectionThreshold={runningThresh}
        {cameraId}
        {faceDetectionThreshold}
        {faceSearchThreshold}
        {vehicleDetectionThreshold}
        {vehiclePlateThreshold}
        {vehicleOCRThreshold}
        {saveFolder}
        {saveDuration}
        {motion}
        {priority}
        {intrusionDetection}
        {intrusionPerson}
        {intrusionVehicle}
        {intrusionPersonThresh}
        {intrusionVehicleThresh}
        {lineCrossing}
        {linePerson}
        {lineVehicle}
        {linePersonThresh}
        {lineVehicleThresh}
        {personCount}
        cameraURL={url}><Settings class="h-4 w-4" /></CameraSettingsDialog
      > -->
      <CameraSettingDialogTech
        cameraName={name}
        {save}
        {face}
        {vehicle}
        {running}
        runningDetectionThreshold={runningThresh}
        {cameraId}
        {faceDetectionThreshold}
        {faceSearchThreshold}
        {vehicleDetectionThreshold}
        {vehiclePlateThreshold}
        {vehicleOCRThreshold}
        {saveFolder}
        {saveDuration}
        {motion}
        {priority}
        {intrusionDetection}
        {intrusionPerson}
        {intrusionVehicle}
        {intrusionPersonThresh}
        {intrusionVehicleThresh}
        {lineCrossing}
        {linePerson}
        {lineVehicle}
        {linePersonThresh}
        {lineVehicleThresh}
        {personCount}
        cameraURL={url}><Settings class="h-4 w-4" /></CameraSettingDialogTech
      >
    </li>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <li class="cursor-pointer hover:scale-125" on:click={deleteCamera}>
      <Trash class="h-4 w-4" />
    </li>
  </ul>
</article>
