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
  export let subUrl:string
  let dialogOpen = false;

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

  const editCamera = () => {
    fetch("/api/camera/editCamera", {
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
        // vehiclePlateThreshold,
        // vehicleOCRThreshold,
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
        personCount
      }),
    }).then(() => {
      toast("Camera settings updated.");
      dialogOpen = false;
    });
  };
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger class='flex items-center gap-2'><slot /></Dialog.Trigger>
  <Dialog.Content
    class="sm:max-w-[720px] scale-90 2xl:scale-100 max-h-[90%] overflow-y-scroll "
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
        <Switch bind:checked={save} />
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

    <div class="rounded-md border p-4 my-2">
      <div class="flex items-center space-x-4">
        <ScanFace />
        <div class="flex-1 space-y-1">
          <p class="text-sm font-medium leading-none">Face Scanning</p>
          <p class="text-sm text-muted-foreground">
            Parameters for adjusting facial recognition
          </p>
        </div>
        <Switch bind:checked={face} />
      </div>
      <div>
        {#if face}
          <div class="flex items-center space-x-4 pt-3">
            <Pipette />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                Face Detection Threshold
              </p>
              <p class="text-sm text-muted-foreground">
                Adjust the threshold to accomodate smaller or larger faces
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Slider
                min={10}
                value={[faceDetectionThreshold * 100]}
                max={95}
                step={1}
                class="w-32"
                onValueChange={(e) => {
                  faceDetectionThreshold = e[0] / 100;
                }}
              />
              {faceDetectionThreshold}
            </div>
          </div>
          <div class="flex items-center space-x-4 pt-3">
            <Pipette />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                Face Search Threshold
              </p>
              <p class="text-sm text-muted-foreground">
                Adjust the threshold to accomodate smaller or larger faces
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Slider
                min={10}
                value={[faceSearchThreshold * 100]}
                max={95}
                step={10}
                class="w-32"
                onValueChange={(e) => {
                  faceSearchThreshold = e[0] / 100;
                }}
              />
              {faceSearchThreshold}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- <div class="rounded-md border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Footprints />
        <div class="flex-1 space-y-1">
          <p class="text-sm font-medium leading-none">Running Detection</p>
          <p class="text-sm text-muted-foreground">
            Parameters for adjusting running detection
          </p>
        </div>
        <Switch bind:checked={running} />
      </div>
      <div>
        {#if running}
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
                value={[runningDetectionThreshold * 100]}
                max={95}
                step={5}
                class="w-32"
                onValueChange={(e) => {
                  runningDetectionThreshold = e[0] / 100;
                }}
              />
              {runningDetectionThreshold}
            </div>
          </div>
        {/if}
      </div>
    </div> -->

    <!-- <div class="rounded-md border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Construction />
        <div class="flex-1 space-y-1">
          <p class="text-sm font-medium leading-none">Line Crossing</p>
          <p class="text-sm text-muted-foreground">
            Parameters for adjusting line crossing detection
          </p>
        </div>
        <Switch bind:checked={lineCrossing} />
      </div>
      <div>
        {#if lineCrossing}
          <div class="flex items-center space-x-4 pt-3">
            <ToggleLeftIcon />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                Person Line Detection
              </p>
            </div>
            <Switch bind:checked={linePerson} />
          </div>
             {#if linePerson}
            <div class="flex items-center space-x-4 pt-3">
            <Pipette />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                 Threshold
              </p>
              <p class="text-sm text-muted-foreground">
                Adjust the threshold
              </p>
            </div>
            <div class="flex items-center gap-2">
              <Slider
                min={10}
                value={[linePersonThresh * 100]}
                max={95}
                step={5}
                class="w-32"
                onValueChange={(e) => {
                  linePersonThresh = e[0] / 100;
                }}
              />
              {linePersonThresh}
            </div>
            </div>
          {/if}
          <div class="flex items-center space-x-4 pt-3">
            <ToggleLeftIcon />
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium leading-none">
                Vehicle Line Detection
              </p>
            </div>
            <Switch bind:checked={lineVehicle} />
          </div>
          {#if lineVehicle}
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
                value={[lineVehicleThresh * 100]}
                max={95}
                step={5}
                class="w-32"
                onValueChange={(e) => {
                  lineVehicleThresh = e[0] / 100;
                }}
              />
              {lineVehicleThresh}
            </div>
          </div>
          {/if}
        {/if}
      </div>
    </div> -->

    <!-- <div class="rounded-md border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Radar />
       <div class="flex-1 space-y-1">
          <p class="text-sm font-medium leading-none">Intrusion Detection</p>
          <p class="text-sm text-muted-foreground">
            Parameters for adjusting intrusion detection
          </p>
        </div>
        <Switch bind:checked={intrusionDetection} />
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
              <p class="text-sm font-medium leading-none">
                 Threshold
              </p>
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
    </div> -->

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <PersonStanding />
        <p class="text-sm font-medium leading-none">Person Count</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={personCount}/>
      </div>
    </div>

    <div class="rounded-md flex items-center justify-between border p-4 my-2">
      <div class="flex items-center space-x-4">
        <Siren />
        <p class="text-sm font-medium leading-none">Priority</p>
      </div>
      <div class="flex items-center gap-4">
        <Switch bind:checked={priority} />
      </div>
    </div>

    <div class="rounded-md border p-4 my-2 flex items-center justify-between">
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

    <Dialog.Footer>
      <Button type="submit" on:click={editCamera}>Change Camera Settings</Button
      >
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
