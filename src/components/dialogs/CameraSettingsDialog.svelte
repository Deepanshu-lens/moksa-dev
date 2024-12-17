<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import { Switch } from "@/components/ui/switch";
  import * as Select from "@/components/ui/select";

  import {
    FileVideo2,
    Merge,
    FolderSearch,
    Pipette,
    ScanFace,
    Activity,
    Siren,
    PersonStanding,
    ShieldAlert,
    Plus,
  } from "lucide-svelte";

  export let cameraName = "";
  export let cameraURL = "";
  export let cameraId = "";
  export let save: boolean;
  export let face: boolean;
  export let running: boolean;
  export let faceDetectionThreshold: number = 0.6;
  export let faceSearchThreshold: number = 0.3;
  export let runningDetectionThreshold: number = 0.75;
  export let saveDuration: number;
  export let saveFolder: string;
  export let motion: number = 1000;
  export let priority: boolean;
  export let intrusionDetection: boolean;
  export let intrusionPerson: boolean;
  export let intrusionVehicle: boolean;
  export let intrusionPersonThresh: number = 0.3;
  export let intrusionVehicleThresh: number = 0.3;
  export let lineCrossing: boolean;
  export let linePerson: boolean;
  export let lineVehicle: boolean;
  export let linePersonThresh: number = 0.3;
  export let lineVehicleThresh: number = 0.3;
  export let personCount: boolean;
  export let subUrl: string;
  export let theft: boolean;
  export let safety: boolean;
  export let person: boolean;
  export let employeEE: boolean;
  export let heatmap: boolean;
  export let theftDetectionThresh: number = 0.5;
  export let showOptions;
  export let isSettingsDialogOpen;
  export let cameraNo;
  export let moksaId;
  export let user;
  let dialogOpen = false;

  let activeTab = "video-saving";

  const tabs = [
    { id: "video-saving", label: "Video Saving", icon: FileVideo2 },
    { id: "face-scanning", label: "Face Scanning", icon: ScanFace },
    { id: "running-detection", label: "Running Detection", icon: Activity },
    {
      id: "intrusion-detection",
      label: "Intrusion Detection",
      icon: ShieldAlert,
    },
    { id: "line-crossing", label: "Line Crossing", icon: PersonStanding },
    { id: "priority", label: "Priority", icon: Siren },
    { id: "motion-sensitivity", label: "Motion Sensitivity", icon: Activity },
  ];

  $: {
    if (dialogOpen) {
      isSettingsDialogOpen.set(true);
    } else {
      isSettingsDialogOpen.set(false);
    }
  }

  const items = [
    {
      value: 30 * 24 * 60,
      label: "Every month",
    },
    {
      value: 7 * 24 * 60,
      label: "Every week",
    },
    {
      value: 24 * 60,
      label: "Every day",
    },
    {
      value: 60,
      label: "Every hour",
    },
    {
      value: 1,
      label: "Every minute",
    },
  ];

  const editCamera = async () => {
    setTimeout(() => {
      console.log(showOptions.set(""));
    }, 1000);
    await fetch("/api/camera/editCamera", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraId,
        nodeId: $selectedNode.id,
        name: cameraName,
        url: cameraURL,
        subUrl,
        face,
        save,
        running,
        faceDetectionThreshold,
        faceSearchThreshold,
        runningThresh: runningDetectionThreshold,
        saveDuration,
        saveFolder,
        motionThresh: motion === 0 ? 1000 : motion,
        priority: priority === true ? 1 : 0,
        intrusionDetection,
        intrusionPerson,
        intrusionVehicle,
        intrusionPersonThresh,
        intrusionVehicleThresh,
        lineCrossing,
        linePerson,
        lineVehicle,
        linePersonThresh,
        lineVehicleThresh,
        personCount,
        theft,
        safety,
        person,
        theftDetectionThresh,
        employeEE,
        heatmap,
      }),
    }).then(() => {
      toast("Camera settings updated.");
      dialogOpen = false;
    });
    const enabledFeatures = {
      heat: heatmap || false,
      count: person || false,
      theft: theft || false,
      kitchenhygiene: safety || false,
      rtsp: false,
    };
    console.log("features", enabledFeatures);
    console.log("storeid", $selectedNode.moksaId);
    console.log("moksaid camid", moksaId);
    const dev = await fetch(`/api/camera/updateFeatures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        storeId: $selectedNode.moksaId,
        camId: moksaId,
        feature: enabledFeatures,
      }),
    });
    const r = await dev.json();
    console.log("updatefeature", r);
  };

  console.log(user?.role, "user in dialog");

  let labels = [];
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    class="sm:max-w-[900px] scale-90 2xl:scale-100 max-h-[90%] overflow-y-scroll"
  >
    <!-- Header -->
    <div class="bg-[#000B40] text-white p-6">
      <Dialog.Title class="text-xl font-semibold">Camera Settings</Dialog.Title>
      <Dialog.Description class="text-gray-300">
        Change settings for {cameraName} camera
      </Dialog.Description>
    </div>

    <div class="flex h-[400px]">
      <!-- Sidebar -->
      <div class="w-64 bg-gray-100 p-2 space-y-1">
        {#each tabs as tab}
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm
            {activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'hover:bg-gray-200'}"
            on:click={() => (activeTab = tab.id)}
          >
            <svelte:component this={tab.icon} class="w-5 h-5" />
            {tab.label}
          </button>
        {/each}
      </div>

      <!-- Content Area -->
      <div class="flex-1 p-6">
        {#if activeTab === "video-saving"}
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold">Video Saving</h3>
                <p class="text-gray-500">
                  Save camera feed directly to your device
                </p>
              </div>
              <Switch bind:checked={save} />
            </div>

            {#if save}
              <div class="mt-8">
                {#if labels.length === 0}
                  <!-- Empty state when no labels -->
                  <div class="border-2 border-dashed border-gray-200 rounded-lg p-8">
                    <div class="text-center text-gray-500">
                      <button 
                        class="flex items-center gap-2 mx-auto text-blue-500"
                        on:click={() => labels = [...labels, { name: '', value: '' }]}
                      >
                        <Plus class="w-5 h-5" />
                        Get started by adding your first label
                      </button>
                    </div>
                  </div>
                {:else}
                  <!-- Show inputs when we have labels -->
                  <div class="flex flex-col gap-4">
                    {#each labels as label}
                      <div class="flex items-center gap-4">
                        <input 
                          type="text" 
                          placeholder="Name of the label"
                          class="flex-1 p-2 border rounded-md"
                        />
                        <input 
                          type="text" 
                          placeholder="Input field"
                          class="flex-1 p-2 border rounded-md"
                        />
                      </div>
                    {/each}
                    
                    <!-- Add new button -->
                    <button 
                      class="flex items-center gap-2 text-blue-500 hover:bg-gray-50 p-2 rounded"
                      on:click={() => labels = [...labels, { name: '', value: '' }]}
                    >
                      <Plus class="w-4 h-4" />
                      Add new
                    </button>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
        <!-- Add similar blocks for other tabs -->
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-3 p-4 border-t">
      <Button variant="outline" on:click={() => (dialogOpen = false)}>
        Cancel
      </Button>
      <Button on:click={editCamera} disabled={user?.role === "admin"}>
        Save
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  /* Add if needed for custom scrollbar or other styles */
  :global(.dialog-content) {
    max-height: 90vh;
  }
</style>
