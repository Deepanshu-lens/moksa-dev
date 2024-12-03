<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import Input from "@/components/ui/input/input.svelte";
  import { Switch } from "@/components/ui/switch";
  import * as Select from "@/components/ui/select";
  import { Button } from "@/components/ui/button";
  import { Slider } from "@/components/ui/slider";
  import { selectedNode } from "@/lib/stores";
  import {
    FileVideo2,
    ScanFace,
    Activity,
    Siren,
    Footprints,
    Construction,
    Radar,
    PersonStanding,
    X,
    Pipette,
    ToggleLeftIcon,
    Drama,
    Heater,
    FireExtinguisher,
    ShieldAlert,
  } from "lucide-svelte";
  import { FolderSearch, Merge } from "lucide-svelte";
  import clsx from "clsx";

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
  let dialogOpen = false;
  let currentTab = "Video Saving";
  // Array of tabs
  let tabs = [
    { id: 1, icon: FileVideo2, label: "Video Saving" },
    { id: 2, icon: Drama, label: "Theft Detection" },
    { id: 3, icon: Heater, label: "Heatmap" },
    { id: 4, icon: PersonStanding, label: "Person Count" },
    { id: 5, icon: FireExtinguisher, label: "Kitchen Safety" },
    { id: 6, icon: ShieldAlert, label: "Employee Efficiency" },
    { id: 7, icon: Siren, label: "Priority" },
    { id: 8, icon: Activity, label: "Motion Sensitivity" },
  ];

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

  // handle select current tab
  const handleSelectTab = (tab: string) => {
    currentTab = tab;
  };

  $: {
    if (dialogOpen) {
      isSettingsDialogOpen.set(true);
    } else {
      isSettingsDialogOpen.set(false);
    }
  }

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
    console.log(enabledFeatures);
    await fetch(`/api/camera/updateFeatures`, {
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
  };
</script>

<!-- markup (zero or more items) goes here -->
<!-- this is static true value and needs to be updated ****** -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    closeButton={false}
    class="sm:max-w-[920px] p-0 pb-4 scale-90 2xl:scale-100 max-h-[90%] overflow-y-scroll hide-scrollbar"
  >
    <Dialog.Header class="bg-[#050F40] p-3 rounded-t-lg">
      <Dialog.Title class="text-2xl font-medium text-white p-2 relative"
        >Camera Settings</Dialog.Title
      >
      <button
        class="absolute top-4 right-4 p-2 grid place-items-center rounded-full text-[#fff] bg-[#fff]/15 cursor-pointer"
        on:click={() => (dialogOpen = false)}
      >
        <X class="h-4 w-4" />
      </button>
      <Dialog.Description class="font-normal text-lg ml-2">
        Change settings for <strong>{cameraName}</strong>
        camera
      </Dialog.Description>
    </Dialog.Header>
    <div class="flex left-container">
      <div class="flex flex-col bg-blue-100/40 p-5">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        {#each tabs as tab}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span
            on:click={() => handleSelectTab(tab?.label)}
            class={clsx("my-1 p-3 flex gap-x-3 rounded-md cursor-pointer", {
              "bg-[#3D81FC] text-white": currentTab === tab?.label,
            })}
          >
            <svelte:component this={tab.icon} />
            <span class="text-lg">{tab?.label}</span>
          </span>
        {/each}
      </div>
      <div class="right-container p-5 w-[570px]">
        {#if currentTab === "Video Saving"}
          <div
            class="flex items-center justify-between border-b border-b-gray-300 p-3 space-x-4"
          >
            <div>
              <h2 class="text-xl font-medium">Video Saving</h2>
              <p class="text-gray-500">Adjust video Saving settings</p>
            </div>
            <Switch bind:checked={save} />
          </div>
          <div class="w-full">
            {#if save}
              <div class="flex items-center space-x-4 py-6">
                <FolderSearch />
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">Save Here</p>
                  <p class="text-sm text-muted-foreground">
                    Point your video to its future home.
                  </p>
                </div>
                <Input
                  id="picture"
                  type="text"
                  class="w-[180px]"
                  disabled
                  placeholder="./PlayBack"
                />
              </div>
              <div class="flex items-center space-x-4 py-3">
                <Merge />
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    Overwrite Interval
                  </p>
                  <p class="text-sm text-muted-foreground">
                    Duration until the saved video is overwritten.
                  </p>
                </div>
                <Select.Root onSelectedChange={(e) => (saveDuration = e.value)}>
                  <Select.Trigger class="w-[180px]">
                    <Select.Value
                      placeholder={items.find((m) => m.value === saveDuration)
                        ?.label || "Select Duration"}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {#each items as fruit}
                        <Select.Item value={fruit.value} label={fruit.label}
                          >{fruit.label}</Select.Item
                        >
                      {/each}
                    </Select.Group>
                  </Select.Content>
                  <Select.Input name="favoriteFruit" />
                </Select.Root>
              </div>
            {/if}
          </div>
        {:else if currentTab === "Theft Detection"}
         <div
            class="rounded-md flex items-center justify-between border p-4 my-2"
          >
            <div class="flex items-center space-x-4">
              <Drama />
              <p class="text-sm font-medium leading-none">Theft Detection</p>
            </div>
            <div class="flex items-center gap-4">
              <Switch bind:checked={theft} />
            </div>
          </div>
        {:else if currentTab === "Heatmap"}
          <div
            class="rounded-md flex items-center justify-between border p-4 my-2"
          >
            <div class="flex items-center space-x-4">
              <Heater />
              <p class="text-sm font-medium leading-none">Heatmap</p>
            </div>
            <div class="flex items-center gap-4">
              <Switch bind:checked={heatmap} />
            </div>
          </div>
       {:else if currentTab === "Person Count"}
          <div
            class="rounded-md flex items-center justify-between border p-4 my-2"
          >
            <div class="flex items-center space-x-4">
              <PersonStanding />
              <p class="text-sm font-medium leading-none">Person Count</p>
            </div>
            <div class="flex items-center gap-4">
              <Switch bind:checked={personCount} />
            </div>
          </div>
       {:else if currentTab === "Kitchen Safety"}
          <div
            class="rounded-md flex items-center justify-between border p-4 my-2"
          >
            <div class="flex items-center space-x-4">
              <FireExtinguisher />
              <p class="text-sm font-medium leading-none">Kitchen Safety</p>
            </div>
            <div class="flex items-center gap-4">
              <Switch bind:checked={safety} />
            </div>
          </div>
          {:else if currentTab === "Employee Efficiency"}
          <div class="rounded-md border p-4 my-2">
            <div class="flex items-center space-x-4">
              <ShieldAlert />
              <div class="flex-1 space-y-1">
                <p class="text-sm font-medium leading-none">
                  Employee Efficiency
                </p>
                <p class="text-sm text-muted-foreground">
                  Parameters for adjusting employee efficiency
                </p>
              </div>
              <Switch bind:checked={employeEE} />
            </div>
            <div>
              {#if intrusionDetection}
                <div class="flex items-center space-x-4 pt-3">
                  <ToggleLeftIcon />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      Person intrusion Detection
                    </p>
                  </div>
                  <Switch bind:checked={intrusionPerson} />
                </div>
                {#if intrusionPerson}
                  <div class="flex items-center space-x-4 pt-3">
                    <Pipette />
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium leading-none">Threshold</p>
                      <p class="text-sm text-muted-foreground">
                        Adjust the threshold
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <Slider
                        min={10}
                        value={[intrusionPersonThresh * 100]}
                        max={95}
                        step={5}
                        class="w-32"
                        onValueChange={(e) => {
                          intrusionPersonThresh = e[0] / 100;
                        }}
                      />
                      {intrusionPersonThresh}
                    </div>
                  </div>
                {/if}
                <div class="flex items-center space-x-4 pt-3">
                  <ToggleLeftIcon />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      Vehicle intrusion Detection
                    </p>
                  </div>
                  <Switch bind:checked={intrusionVehicle} />
                </div>
                {#if intrusionVehicle}
                  <div class="flex items-center space-x-4 pt-3">
                    <Pipette />
                    <div class="flex-1 space-y-1">
                      <p class="text-sm font-medium leading-none">
                        Running Detection Threshold
                      </p>
                      <p class="text-sm text-muted-foreground">
                        Adjust the threshold
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <Slider
                        min={10}
                        value={[intrusionVehicleThresh * 100]}
                        max={95}
                        step={5}
                        class="w-32"
                        onValueChange={(e) => {
                          intrusionVehicleThresh = e[0] / 100;
                        }}
                      />
                      {intrusionVehicleThresh}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        {:else if currentTab === "Priority"}
          <div
            class="rounded-md flex items-center justify-between border p-4 my-2"
          >
            <div class="flex items-center space-x-4">
              <Siren />
              <p class="text-sm font-medium leading-none">Priority</p>
            </div>
            <div class="flex items-center gap-4">
              <Switch bind:checked={priority} />
            </div>
          </div>
        {:else if currentTab === "Motion Sensitivity"}
          <div
            class="rounded-md border p-4 my-2 flex items-center justify-between"
          >
            <div class="flex items-center space-x-4">
              <Activity />
              <p class="text-sm font-medium leading-none">Motion Sensitivity</p>
            </div>
            <div class="flex items-center gap-4">
              <Slider
                min={0}
                value={[motion === 1000 ? 0 : motion]}
                max={5000}
                step={2500}
                class="w-32"
                onValueChange={(e) => {
                  motion = e[0];
                }}
              />
              {motion === 5000 ? "High" : motion === 2500 ? "Mid" : "Low"}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={editCamera} class="bg-[#3D81FC] mr-4"
        >Save Changes</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
