<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import { Switch } from "@/components/ui/switch";
  import * as Select from "@/components/ui/select";
  import { Slider } from "@/components/ui/slider";

  import {
    FileVideo2,
    Merge,
    FolderSearch,
    Pipette,
    ScanFace,
    Activity,
    Siren,
    PersonStanding,
    Drama,
    FireExtinguisher,
    ShieldAlert,
    TabletSmartphone,
    Heater,
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
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger class="flex items-center gap-2"><slot /></Dialog.Trigger>
  <Dialog.Content
    class="sm:max-w-[720px] scale-90 2xl:scale-100 max-h-[90%] overflow-y-scroll"
  >
    <Dialog.Header>
      <Dialog.Title>Camera Settings</Dialog.Title>
      <Dialog.Description>
        Change settings for <span class="font-semibold">{cameraName}</span>
        camera
      </Dialog.Description>
    </Dialog.Header>
    <div class="rounded-md border p-4 my-2">
      <div class="flex items-center space-x-4">
        <FileVideo2 />
        <div class="flex-1 space-y-1">
          <p class="text-sm font-medium leading-none">Video Saving</p>
          <p class="text-sm text-muted-foreground">
            Save camera feed directly to your device
          </p>
        </div>
        <Switch bind:checked={save} disabled={user?.role === "admin"} />
      </div>
      <div>
        {#if save}
          <div class="flex items-center space-x-4 pt-3">
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
          <div class="flex items-center space-x-4 pt-3">
            <Merge />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">Overwrite Interval</p>
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
    </div>
    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Drama />
        <p class="text-sm font-medium leading-none">Theft Detection</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={theft} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Heater />
        <p class="text-sm font-medium leading-none">Heatmap</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={heatmap} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <PersonStanding />
        <p class="text-sm font-medium leading-none">Person Count</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={person} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <FireExtinguisher />
        <p class="text-sm font-medium leading-none">Kitchen Safety</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={safety} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <ShieldAlert />
        <p class="text-sm font-medium leading-none">Employee Efficiency</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={employeEE} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Siren />
        <p class="text-sm font-medium leading-none">Priority</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={priority} disabled={user?.role === "admin"} />
      </div>
    </div>

    <div class="rounded-md border p-4 my-2 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Activity />
        <p class="text-sm font-medium leading-none">Motion Sensitivity</p>
      </div>
      <div class="flex items-center gap-4">
        <Slider
          disabled={user?.role === "admin"}
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

    <Dialog.Footer>
      <Button
        type="submit"
        on:click={editCamera}
        disabled={user?.role === "admin"}>Change Camera Settings</Button
      >
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
