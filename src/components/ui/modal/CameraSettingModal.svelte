<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/stores";
  import { Switch } from "@/components/ui/switch";
  import axios from "axios";
  import {
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
  export let token;
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

  let activeTab = "theft-detection";

  const tabs = [
    { id: "theft-detection", label: "Theft Detection", icon: ScanFace },
    { id: "heatmap", label: "Heatmap", icon: Activity },
    {
      id: "person-count",
      label: "Person Count",
      icon: ShieldAlert,
    },
    { id: "kitchen-safety", label: "Kitchen Safety", icon: PersonStanding },
    { id: "employee-safety", label: "Employee Safety", icon: Siren },
  ];

  $: {
    if (dialogOpen) {
      isSettingsDialogOpen.set(true);
    } else {
      isSettingsDialogOpen.set(false);
    }
  }

  let labels = {
    "employee-safety": [],
    "theft-detection": [],
    heatmap: [],
    "person-count": [],
    "kitchen-safety": [],
  };

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

    // New Camera settings modal api

    // Initialize customer variable objects
    const mobileCustomerVars = {};
    const theftCustomerVars = {};
    const heatmapCustomerVars = {};
    const peopleCustomerVars = {};
    const kitchenCustomerVars = {};

    // Populate the customer variable objects based on the labels for all tabs
    for (const tab of tabs) {
      labels[tab.id].forEach((label) => {
        if (label.name && label.value) {
          if (tab.id === "employee-safety") {
            mobileCustomerVars[label.name] = label.value;
          } else if (tab.id === "theft-detection") {
            theftCustomerVars[label.name] = label.value;
          } else if (tab.id === "heatmap") {
            heatmapCustomerVars[label.name] = label.value;
          } else if (tab.id === "person-count") {
            peopleCustomerVars[label.name] = label.value;
          } else if (tab.id === "kitchen-safety") {
            kitchenCustomerVars[label.name] = label.value;
          }
        }
      });
    }

    // Construct the payload based on which customer vars are populated
    const customerVarsPayload = {
      lensCameraId: cameraId,
      triggerDeployment: true,
      storeId: $selectedNode?.moksaId,
    };

    // Add customer vars to the payload only if they have values
    if (Object.keys(mobileCustomerVars).length > 0) {
      customerVarsPayload.mobileCustomerVars = {
        isEnabled: "True",
        ...mobileCustomerVars,
      };
    }
    if (Object.keys(theftCustomerVars).length > 0) {
      customerVarsPayload.theftCustomerVars = {
        isEnabled: "True",
        ...theftCustomerVars,
      };
    }
    if (Object.keys(heatmapCustomerVars).length > 0) {
      customerVarsPayload.heatmapCustomerVars = {
        isEnabled: "True",
        ...heatmapCustomerVars,
      };
    }
    if (Object.keys(peopleCustomerVars).length > 0) {
      customerVarsPayload.peopleCustomerVars = {
        isEnabled: "True",
        ...peopleCustomerVars,
      };
    }
    if (Object.keys(kitchenCustomerVars).length > 0) {
      customerVarsPayload.kitchenCustomerVars = {
        isEnabled: "True",
        ...kitchenCustomerVars,
      };
    }

    await axios
      .post(
        `https://dev.api.moksa.ai/store/updateCustomerVars/${$selectedNode?.moksaId}`,
        customerVarsPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("Customer variables updated:", response.data);
      })
      .catch((error) => {
        console.error(
          "Error updating customer variables:",
          error.response?.data || error.message
        );
      });
  };
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
        {#each tabs as tab}
          {#if activeTab === tab.id}
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold">{tab.label}</h3>
                  <p class="text-gray-500">
                    Save camera feed directly to your device
                  </p>
                </div>
                <Switch bind:checked={save} />
              </div>

              {#if save}
                <div class="mt-8">
                  {#if labels[activeTab].length === 0}
                    <!-- Empty state when no labels -->
                    <div
                      class="border-2 border-dashed border-gray-200 rounded-lg p-8"
                    >
                      <div class="text-center text-gray-500">
                        <button
                          class="flex items-center gap-2 mx-auto text-blue-500"
                          on:click={() =>
                            (labels[activeTab] = [
                              ...labels[activeTab],
                              { name: "", value: "" },
                            ])}
                        >
                          <Plus class="w-5 h-5" />
                          Get started by adding your first label
                        </button>
                      </div>
                    </div>
                  {:else}
                    <!-- Show inputs when we have labels -->
                    <div class="flex flex-col gap-4">
                      {#each labels[activeTab] as label, index}
                        <div class="flex items-center gap-4">
                          <input
                            type="text"
                            placeholder="Name of the label"
                            class="flex-1 p-2 border rounded-md"
                            bind:value={label.name}
                          />
                          <input
                            type="text"
                            placeholder="Input field"
                            class="flex-1 p-2 border rounded-md"
                            bind:value={label.value}
                          />
                        </div>
                      {/each}

                      <!-- Add new button -->
                      <button
                        class="flex items-center gap-2 text-blue-500 hover:bg-gray-50 p-2 rounded"
                        on:click={() =>
                          (labels[activeTab] = [
                            ...labels[activeTab],
                            { name: "", value: "" },
                          ])}
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
        {/each}
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
