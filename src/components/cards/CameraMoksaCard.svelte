<script lang="ts">
  import Button from "./../ui/button/button.svelte";
  import { toast } from "svelte-sonner";
  import {
    Users,
    MoreVertical,
    Hand,
    Edit,
    Settings,
    Trash,
    X,
    Cctv,
  } from "lucide-svelte";
  import { hoveredCamera, selectedNode, cameraCounts } from "@/lib/stores";
  import { activeCamera } from "@/lib/stores";
  import CameraSettingsDialog from "../dialogs/CameraSettingsDialog.svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import CameraEditDialog from "../dialogs/CameraEditDialog.svelte";
    import { onMount } from "svelte";

  export let isAllFullScreen: boolean;
  export let cameraId: string;
  export let name: string;
  export let url: string;
  export let subUrl: string;
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
  export let personCount: boolean;
  export let ptzControl;
  export let showOptions;
  export let role:string
  export let ptz;
  export let preset;
  export let lastCords;
  export let theft;
  export let theftDetectionThresh;
export let safety;
export let person;
export let employeEE;
export let heatmap;

let hasShownToast = false;
//  let showOptions = false;
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

  const deleteCamera = () => {
    // const cell = document.getElementById(`stream-${cameraId}`);
    // if (cell) {
    //   document.getElementById(`stream-${cameraId}`)?.remove();
    // }
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

  // $: console.log($ptzControl)

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- markup (zero or more items) goes here -->

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<article
  class={`flex  items-center gap-4 p-3 dark:border relative
              hover:border hover:border-[#3D81FC] ${isAllFullScreen && "text-slate-100"}
              rounded-xl shadow-md text-base w-full 
              ${cameraId === $activeCamera ? ` border animate-gradient-border  ${isAllFullScreen ? "bg-black" : "bg-[#DADFEA] dark:bg-black"}` : `${isAllFullScreen ? "bg-black" : "bg-[#DADFEA] dark:bg-black"}`}
        `}
  on:mouseover={() => {
    hoveredCamera.set(cameraId);
  }}
  on:click={() => {
    addUserLog(
      `user clicked on camera ${name} having url "${url}" from cameralist`,
    );
    activeCamera.update((previous) => (previous === cameraId ? "" : cameraId));
  }}
  on:mouseleave={() => {
    hoveredCamera.set("");
  }}
>
  <!-- <span class='h-7 w-7 my-handle cursor-grab flex-shrink-0 bg-[#000065] rounded-full grid place-items-center'> -->
  <!-- <img src='/images/Vector.svg' alt='menu' class='h-5 w-5' /> -->
  <!-- </span> -->

  <span
    class="grid place-items-center bg-white rounded-full size-7 text-black flex-shrink-0"
  >
    <Hand class=" h-4 w-4 my-handle cursor-grab flex-shrink-0" />
  </span>
  <div class="grid w-full gap-1">
    <span class="flex gap-3 items-center relative">
      <h3 class="text-sm font-medium whitespace-nowrap">
        {!isNaN(parseInt(name)) && String(parseInt(name)) === name
          ? "Camera"
          : ``}{" "}
        {name?.length > 11 ? name?.substring(0, 10) + "..." : name}
      </h3>
    </span>
    <p class="text-sm text-[#186AFD]">
      {(() => {
        const splitResult = url
          ?.split("@")?.[1]
          ?.split("/")?.[0]
          ?.split(":")?.[0];
        return splitResult?.length > 15
          ? splitResult.substring(0, 15) + "..."
          : splitResult;
      })()}
    </p>
  </div> <Button variant='ghost' class='p-0 bg-transparent absolute top-3 right-2 h-[22px] w-[22px]' type='button' size='icon' on:click={() => showOptions.set(cameraId)}>
    <MoreVertical size={16} />
  </Button>
  {#if $showOptions !== '' && $showOptions === cameraId}
  <div class='flex flex-col h-auto w-[140px] rounded-lg shadow-2xl drop-shadow-lg z-[99999] bg-white p-0.5 gap-1 flex-shrink-0 absolute top-2 right-2'
  >
  <button class='absolute top-1 right-1' on:click|stopPropagation={() => showOptions.set('')}>
    <X size={16} class='text-black'/>
  </button>
     <CameraEditDialog {name} {url} {cameraId} {role} {subUrl}>
       <span class='flex items-center gap-2 text-black font-medium'>
         <span class='size-[24px] rounded-full bg-[#6159F030] text-[#6159F0] flex-shrink-0 grid place-items-center'>
           <Edit class='h-4 w-4' />
          </span>
          Edit
        </span>
      </CameraEditDialog>
      <CameraSettingsDialog
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
        cameraURL={url}
        {subUrl}
        {theft}
        {person}
        {safety}
        {employeEE}
        {theftDetectionThresh}
        {heatmap}
      >
      <span class='flex items-center gap-2 text-black font-medium'>
        <span class='size-[24px] rounded-full bg-[#0469FF2E] text-[#0469FF] flex-shrink-0 grid place-items-center'>
          <Settings class='h-4 w-4' />
        </span>
        Settings
      </span>
    </CameraSettingsDialog>

<button class='flex items-center gap-2 text-black font-medium' on:click={deleteCamera}>
<span class='size-[24px] rounded-full bg-[#E539352E] text-[#E53935] flex-shrink-0 grid place-items-center'>
  <Trash class='h-4 w-4' />
</span>
Delete
</button>
{#if ptz}
<button class='flex items-center gap-2 text-black font-medium' on:click={() => {ptzControl.set({
  id: cameraId, url: url, preset: preset, lastCords: lastCords
}); showOptions.set('')}}>
<span class='size-[24px] rounded-full bg-[#015a62]/[.2] text-[#015a62] flex-shrink-0 grid place-items-center'>
  <Cctv class='h-4 w-4' />
</span>
PTZ Control
</button>
{/if}
  </div>
  {/if}
</article>


  <!-- <ul class="flex flex-row gap-1 ml-auto p-0 list-none cursor-pointer">
      <li class="cursor-pointer hover:scale-125">
      <CameraEditDialog {name} {url} {cameraId}>
        <Edit class="h-4 w-4" />
      </CameraEditDialog>
    </li>
    <li
      class="cursor-pointer hover:scale-125"
      on:click={() => {
        addUserLog(
          `user clicked on camera settings for camera with name  ${name}`,
        );
      }}
    >
      <CameraSettingsDialog
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
        {lineVehicleThresh}{personCount}
        cameraURL={url}><Settings class="h-4 w-4" /></CameraSettingsDialog
      >
    </li>
    <li class="cursor-pointer hover:scale-125" on:click={deleteCamera}>
      <Trash class="h-4 w-4" />
    </li>
  </ul> -->
  