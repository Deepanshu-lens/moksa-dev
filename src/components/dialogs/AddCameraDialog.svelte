<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import { Slider } from "@/components/ui/slider";
  import Switch from "../ui/switch/switch.svelte";
  import { ChevronDown, PlusCircle } from "lucide-svelte";
  import * as Select from "@/components/ui/select/index";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  export let user;
  let cameraName = "";
  let cameraNumber: number | null = null;
  let cameraURL = "";
  let subURL = "";
  let cameraUsername = "";
  let cameraPass = "";
  let cameraIp = "";
  let saving: boolean = false;
  let vehicle: boolean = false;
  let face: boolean = false;
  let dialogOpen: boolean = false;
  let company: number = 0;
  let disabled: string | null = null;
  let priority: boolean = true;
  let motionThresh: number = 0;
  let nvrName = "";
  let sparshID = "";
  let personCount = false;
  let nvrPersonCount = false;

  let mode = 2;
  let uploadMode = 1;
  let addMode = 1;
  let modeAdd = 3;
  let addNodeCounter = 1;
  let subNodeCounter = 1;
  let addDevice = 1;
  let nodeName = [];
  let nodeAddress = [];
  let nodePin = [];
  let nodeCountry = [];
  let nodeManager = [];
  let subNodeNames = [];
  let chosenNode: any;
  let httpPort: null | number = null;
  let nvrUserId;
  let nvrPass;
  let nvrIp;
  let nvrPort;
  let camCount = 0;
  let nvrSaving: boolean = false;
  let nvrFace: boolean = false;
  let storeOpenTime;
  let storeCloseTime;
  let isStore24hr;
  let selectedTimezone;
  let hasKitchen = false;
  const timezones = ["EST", "PST", "MST", "CST"];

  export let sNode;
  export let nodes;

  // $: console.log($selectedNode?.allCameraNumbers)
  // $: console.log($selectedNode.moksaId)

  const onSubmit = () => {
    console.log($selectedNode?.allCameraNumbers);
    console.log(cameraNumber);
    console.log(typeof cameraNumber);
    if (
      cameraNumber === null ||
      cameraNumber === "" ||
      cameraNumber === undefined
    ) {
      toast.error("Camera number is required");
      return;
    }
    if ($selectedNode?.allCameraNumbers?.includes(parseInt(cameraNumber))) {
      toast.error("Camera number already exists");
      return;
    }
    console.log(mode);
    if (addMode === 1) {
      let modifiedCameraURL = cameraURL;
      let modifiedSubURL = subURL;
      const urlParts = cameraURL.split("@");
      console.log(urlParts);

      if (urlParts.length > 2) {
        modifiedCameraURL = urlParts[0] + "%40" + urlParts.slice(1).join("@");
      }

      const subUrlParts = subURL.split("@");
      console.log(subUrlParts);
      if (subUrlParts.length > 2) {
        modifiedSubURL =
          subUrlParts[0] + "%40" + subUrlParts.slice(1).join("@");
      }
      console.log(modifiedCameraURL);
      console.log(modifiedSubURL);

      fetch("/api/camera/addCamera", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cameraName,
          url: modifiedCameraURL,
          subUrl: modifiedSubURL,
          nodeId: sNode ? sNode.id : $selectedNode.id,
          face: face,
          save: saving,
          saveFolder: "./PlayBack/",
          saveDuration: 30 * 60 * 24,
          vehicle: vehicle,
          faceDetThresh: 0.93,
          faceMatchThresh: 0.3,
          vehicleDetThresh: 0.4,
          vehiclePlateThresh: 0.5,
          vehicleOCRThresh: 0.6,
          priority: priority === true ? 1 : 0,
          motionThresh:
            motionThresh === 0 ? 1000 : motionThresh === 50 ? 2500 : 5000,
          personCount: personCount,
          cameraNumber: parseInt(cameraNumber),
          moksaId: $selectedNode.moksaId,
        }),
      }).then((response) => {
        if (response.ok) {
          dialogOpen = false;
          toast("Camera added!");
        } else {
          toast.error(`error adding camera`);
        }
      });
    } else {
      const onvifUrl = `onvif://${cameraUsername}:${cameraPass}@${cameraIp}${httpPort ? `:${httpPort}` : ""}`;
      console.log(onvifUrl);

      let onvifData;

      fetch(`http://localhost:8084/api/onvif?url=${onvifUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            onvifData = data;
            if (onvifData) {
              const main =
                onvifData[0].stream_type === "MainStream"
                  ? onvifData[0].url
                  : onvifData[1].url;
              const sub =
                onvifData[1].stream_type === "SubStream"
                  ? onvifData[1].url
                  : onvifData[0].url;

              if (main && sub) {
                fetch("/api/camera/addCamera", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: cameraName,
                    url: main,
                    subUrl: sub,
                    nodeId: sNode ? sNode.id : $selectedNode.id,
                    face: face,
                    save: saving,
                    saveFolder: "./PlayBack/",
                    saveDuration: 30 * 60 * 24,
                    vehicle: vehicle,
                    faceDetThresh: 0.93,
                    faceMatchThresh: 0.3,
                    vehicleDetThresh: 0.4,
                    vehiclePlateThresh: 0.5,
                    vehicleOCRThresh: 0.6,
                    priority: priority === true ? 1 : 0,
                    motionThresh:
                      motionThresh === 0
                        ? 1000
                        : motionThresh === 50
                          ? 2500
                          : 5000,
                    sparshID: sparshID,
                    personCount: personCount,
                    cameraNumber: parseInt(cameraNumber),
                    moksaId: $selectedNode.moksaId,
                  }),
                }).then((response) => {
                  if (response.ok) {
                    dialogOpen = false;
                    toast("Camera added!");
                  } else {
                    toast.error(`error adding camera`);
                  }
                });
              }
            }
          } else {
            toast("Failed to add camera via ONVIF");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast("Error adding camera via ONVIF");
        });
    }
  };

  const onSubmitNVR = async () => {
    console.log("camCount", camCount);
    console.log(nvrFace);
    console.log(nvrSaving);
    await fetch("/api/nvr/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nvrName,
        password: nvrPass,
        user_id: nvrUserId,
        http_port: nvrPort,
        ip: nvrIp,
        node: $selectedNode.id,
        nodeName: $selectedNode.name,
        camCount: camCount,
        nvrSaving: nvrSaving,
        nvrFace: nvrFace,
        host: $page.url.host,
        nvrPersonCount: personCount,
        moksaId: $selectedNode.moksaId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          dialogOpen = false;
          toast("NVR added!");
        }
        nvrName = "";
        nvrPass = "";
        nvrPort = "";
        nvrIp = "";
        camCount = 0;
        nvrSaving = false;
        nvrFace = false;
        personCount = false;
      })
      .catch((err) => console.log(err));
  };

  async function handleAddNode() {
    // Check all nodeNames for underscores first
    const invalidNodes = nodeName.filter((node) => node.includes("_"));

    if (invalidNodes.length > 0) {
      toast.error(
        '"_" are not allowed for Node names, please try with some other name!',
      );
      return;
    }

    for (let i = 0; i < nodeName.length; i++) {
      await fetch("/api/node/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nodeName[i],
          sessionId: $selectedNode?.session,
          address: nodeAddress[i],
          pin: nodePin[i],
          country: nodeCountry[i],
          manager: nodeManager[i],
          timezone: selectedTimezone,
          storeOpenTime: storeOpenTime,
          storeCloseTime: storeCloseTime,
          isStore24hr: isStore24hr,
          hasKitchen: hasKitchen,
        }),
      }).catch((err) => console.log(err));
    }
    nodeName = [];
    nodeAddress = [];
    nodePin = [];
    nodeCountry = [];
    nodeManager = [];
    toast.success("Store Added");
    dialogOpen = false;
    selectedTimezone = "";
    storeOpenTime = "";
    storeCloseTime = "";
    isStore24hr = false;
  }

  async function handleAddSubNodes() {
    // Check all subNodeNames for underscores first
    const invalidSubNodes = subNodeNames.filter((sub) => sub.includes("_"));

    if (invalidSubNodes.length > 0) {
      toast.error(
        '"_" are not allowed for subNode names, please try with some other name!',
      );
      return;
    }

    for (let subs of subNodeNames) {
      await fetch("/api/node/subnode/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subNode: subs,
          node: chosenNode.name,
          sessionId: $selectedNode.session,
        }),
      });
      dialogOpen = false;
    }
  }

  $: {
    if (
      cameraUsername?.length > 0 ||
      cameraPass?.length > 0 ||
      cameraIp?.length > 0
    ) {
      disabled = "url";
    } else if (cameraURL?.length > 0) {
      disabled = "other";
    } else {
      disabled = null;
    }
  }
  // $: {
  //   console.log(selectedTimezone)
  //   console.log(storeOpenTime)
  //   console.log(storeCloseTime)
  // }
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    class="sm:max-w-[720px] scale-90 sm:scale-100 z-[70] max-h-[95%] sm:max-h-auto overflow-y-scroll"
  >
    <Dialog.Header>
      <Dialog.Title>Add Network</Dialog.Title>
    </Dialog.Header>
    {#if user.role !== "Operators" && user.role !== "admin" && user.role !== "storeManager" && user.role !== "storeEmployee"}
      <div class="flex items-center justify-between w-full">
        <!-- disabled={$page.url.pathname.includes("frs")} -->
        <button
          on:click={() => (modeAdd = 1)}
          class={`${modeAdd === 1 ? "bg-white dark:bg-slate-700" : "bg-[#f5f5f5] dark:bg-slate-800"} w-full text-[#4f4f4f] dark:text-slate-200 font-medium text-lg border-r border-black/.13 disabled:cursor-not-allowed`}
          >Add Store</button
        >
        <!-- disabled={$page.url.pathname.includes("frs")} -->
        <!-- <button
        on:click={() => (modeAdd = 2)}
        class={`${modeAdd === 2 ? "bg-white dark:bg-slate-700" : "bg-[#f5f5f5] dark:bg-slate-800"} w-full text-[#4f4f4f] dark:text-slate-200 font-medium text-lg border-r border-black/.13 disabled:cursor-not-allowed`}
        >Add SubStore</button
      > -->

        <button
          on:click={() => (modeAdd = 3)}
          class={`${modeAdd === 3 ? "bg-white dark:bg-slate-700" : "bg-[#f5f5f5] dark:bg-slate-800"} w-full text-[#4f4f4f] dark:text-slate-200 font-medium text-lg border-r border-black/.13 `}
          >Add Devices</button
        >
      </div>
    {/if}
    {#if modeAdd === 3}
      <div class=" drop-shadow-md px-2">
        <div class="w-full flex flex-col items-start justify-center py-4 gap-4">
          <div
            class="flex items-center justify-center rounded-lg border-black/[.13] border-solid border-[1px] p-1 w-[200px] h-[40px] mx-auto"
          >
            <button
              on:click={() => (addDevice = 1)}
              class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/2 h-full ${addDevice === 1 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
              >Camera</button
            >
            <!-- disabled={$page.url.pathname.includes("frs")} -->
            <button
              on:click={() => (addDevice = 2)}
              class={`disabled:cursor-not-allowed rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/2 h-full ${addDevice === 2 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
              >NVR</button
            >
          </div>
          {#if addDevice === 1}
            <span class="w-full flex items-center justify-between pb-4">
              <p class="text-base font-semibold text-muted-foreground">
                Insert a new camera in <span class="font-bold text-primary"
                  >{sNode ? sNode.name : $selectedNode.name}</span
                >
                node and its parent nodes.
              </p>
            </span>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="camera-name" class="col-span-1">Name</Label>
                <Input
                  id="camera-name"
                  type="text"
                  placeholder={"Home-Porch"}
                  class="col-span-3"
                  bind:cameraName
                  on:change={(e) => (cameraName = e.target.value)}
                />
              </div>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="camera-Number" class="col-span-1">Camera No.</Label>
                <Input
                  id="camera-Number"
                  placeholder={"26"}
                  class="col-span-3"
                  type="number"
                  bind:cameraNumber
                  on:change={(e) => (cameraNumber = e.target.value)}
                />
              </div>
              <!-- <div class="grid grid-cols-4 items-center gap-4">
                <Label for="camera-name">Sparsh ID</Label>
                <Input
                  id="camera-name"
                  placeholder={"ID-sparshCamera"}
                  class="col-span-3"
                  bind:sparshID
                  on:change={(e) => (sparshID = e.target.value)}
                />
              </div> -->

              {#if mode === 2}
                <div
                  class="w-full border-b border-black/[.1] pb-2 flex items-center justify-start gap-10"
                >
                  <button
                    on:click={() => (addMode = 1)}
                    class={`${addMode !== 1 ? "text-[#5F6064] font-medium" : "text-primary font-semibold"} font-medium text-sm relative`}
                    >Using RTSP
                    {#if addMode === 1}
                      <span
                        class="h-[2px] w-full absolute bg-primary -bottom-2.5 left-0"
                      />{/if}</button
                  >
                  <button
                    on:click={() => (addMode = 2)}
                    class={`${addMode === 1 ? "text-[#5F6064] font-medium" : "text-primary font-semibold"}  text-sm relative disabled:cursor-not-allowed`}
                    >Using Onvif{#if addMode !== 1}
                      <span
                        class="h-[2px] w-full absolute bg-primary -bottom-2.5 left-0"
                      />{/if}</button
                  >
                </div>
                {#if addMode === 1}
                  <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label for="camera-url">Main URL</Label>
                      <Input
                        id="camera-url"
                        class="col-span-3"
                        disabled={disabled === "url"}
                        placeholder={"rtsp://admin:password@123.123.123.123/stream/1"}
                        bind:cameraURL
                        on:change={(e) => (cameraURL = e.target.value)}
                      />
                    </div>
                    <div class="grid grid-cols-4 items-center gap-4">
                      <Label for="camera-url">Sub URL</Label>
                      <Input
                        id="camera-url"
                        class="col-span-3"
                        disabled={disabled === "url"}
                        placeholder={"rtsp://admin:password@123.123.123.123/sub-stream/1"}
                        bind:subURL
                        on:change={(e) => (subURL = e.target.value)}
                      />
                    </div>
                  </div>
                {:else}
                  <div class="grid gap-4 py-4">
                    <div class="grid gap-4 py-4">
                      <div class="grid grid-cols-4 items-center gap-4">
                        <Label for="camera-username">Username</Label>
                        <Input
                          id="camera-username"
                          class="col-span-3"
                          placeholder={"Camera portal username"}
                          disabled={disabled === "other"}
                          bind:cameraUsername
                          on:change={(e) => (cameraUsername = e.target.value)}
                        />
                        <Label for="camera-pass">Password</Label>
                        <Input
                          autocomplete="new-password"
                          id="camera-pass"
                          class="col-span-3"
                          placeholder={"Camera portal password"}
                          type="password"
                          disabled={disabled === "other"}
                          bind:cameraPass
                          on:change={(e) => (cameraPass = e.target.value)}
                        />
                        <Label for="camera-ip">IP Address</Label>
                        <Input
                          id="camera-ip"
                          class="col-span-3"
                          placeholder={"address associated with camera"}
                          disabled={disabled === "other"}
                          bind:cameraIp
                          on:change={(e) => (cameraIp = e.target.value)}
                        />
                        <Label for="camera-ip">HTTP Port</Label>
                        <Input
                          id="camera-port"
                          class="col-span-3"
                          placeholder={"Port"}
                          disabled={disabled === "other"}
                          bind:httpPort
                          on:change={(e) => (httpPort = e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                {/if}
                <span class="text-xl font-semibold pt-2">Features</span>
                <div class="grid grid-cols-4 items-center gap-4 py-2">
                  <span
                    class="block text-sm font-medium leading-6 dark:text-white text-[#2c2c2c]"
                  >
                    Camera Features
                  </span>
                  <div
                    class="flex flex-row items-center gap-3 my-auto col-span-3 flex-wrap sm:flex-nowrap"
                  >
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label
                      class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                    >
                      <Switch bind:checked={saving} class="scale-90" />
                      Feed Saving
                    </label>
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <!-- <label
                      class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                    >
                      <Switch bind:checked={vehicle} class="scale-90" />
                      Vehicle Scan
                    </label> -->
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label
                      class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                    >
                      <Switch bind:checked={face} class="scale-90" />
                      Face Scan
                    </label>
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label
                      class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                    >
                      <Switch bind:checked={personCount} class="scale-90" />
                      Person Count
                    </label>

                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label
                      class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                    >
                      <Switch bind:checked={priority} class="scale-90" />
                      Priority
                    </label>
                  </div>
                </div>
                <div class="grid grid-cols-4 items-center gap-4 py-2">
                  <span
                    class="block text-sm font-medium leading-6 dark:text-white text-[#2c2c2c]"
                  >
                    Motion Sensitivity
                  </span>
                  <div class="flex items-center gap-4 grid-cols-3">
                    <Slider
                      min={0}
                      value={[motionThresh]}
                      max={100}
                      step={50}
                      class="w-32"
                      onValueChange={(e) => {
                        motionThresh = e[0];
                      }}
                    />
                    {motionThresh === 0
                      ? "Low"
                      : motionThresh === 50
                        ? "Mid"
                        : "High"}
                  </div>
                </div>

                <Dialog.Footer>
                  <Button type="submit" on:click={onSubmit}>Add Camera</Button>
                </Dialog.Footer>
              {:else}
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="camera-name">Name</Label>
                    <Input
                      id="camera-name"
                      placeholder={"Home-Porch"}
                      class="col-span-3"
                      bind:cameraName
                      on:change={(e) => (cameraName = e.target.value)}
                    />
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="camera-url">URL</Label>
                    <Input
                      id="camera-url"
                      class="col-span-3"
                      disabled={disabled === "url"}
                      placeholder={"rtsp://admin:password@123.123.123.123/sub-stream/1"}
                      bind:cameraURL
                      on:change={(e) => (cameraURL = e.target.value)}
                    />
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <div class="grid w-full gap-4 py-4">
              <p class="text-base font-semibold text-muted-foreground">
                Insert a new NVR in <span class="text-primary font-bold">
                  {$selectedNode.name}
                </span> node and its parent nodes.
              </p>
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="nvr-name">NVR Name</Label>
                <Input
                  id="nvr-name"
                  placeholder={"Home-Porch"}
                  class="col-span-3"
                  bind:nvrName
                  on:change={(e) => (nvrName = e.target.value)}
                />
              </div>

              <div class="grid gap-4 py-4">
                <div class="grid gap-4 py-4">
                  <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="nvr-userid">User ID</Label>
                    <Input
                      id="nvr-userId"
                      class="col-span-3"
                      placeholder={"Camera portal username"}
                      bind:nvrUserId
                      on:change={(e) => (nvrUserId = e.target.value)}
                    />
                    <Label for="nvr-pass">Password</Label>
                    <Input
                      autocomplete="nvr-pass"
                      id="camera-pass"
                      class="col-span-3"
                      placeholder={"Camera portal password"}
                      type="password"
                      bind:nvrPass
                      on:change={(e) => (nvrPass = e.target.value)}
                    />
                    <Label for="nvr-ip">IP Address</Label>
                    <Input
                      id="nvr-ip"
                      class="col-span-3"
                      placeholder={"address associated with camera"}
                      bind:nvrIp
                      on:change={(e) => (nvrIp = e.target.value)}
                    />
                    <Label for="camera-ip">RTSP Port</Label>
                    <Input
                      id="camera-port"
                      class="col-span-3"
                      placeholder={"Port"}
                      bind:nvrPort
                      on:change={(e) => (nvrPort = e.target.value)}
                    />
                    <Label for="camCount">Number of Cameras</Label>
                    <Input
                      id="camCount"
                      class="col-span-3"
                      placeholder={"Number of Cameras"}
                      type="number"
                      bind:camCount
                      on:change={(e) => (camCount = e.target.value)}
                    />
                  </div>
                  <div class="grid grid-cols-4 items-center gap-4 py-2">
                    <span
                      class="block text-sm font-medium leading-6 dark:text-white text-[#2c2c2c]"
                    >
                      Features for All Cameras
                    </span>
                    <div
                      class="flex flex-row items-center gap-3 my-auto col-span-3 flex-wrap sm:flex-nowrap"
                    >
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <label
                        class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                      >
                        <Switch bind:checked={nvrSaving} class="scale-90" />
                        Feed Saving
                      </label>
                      <!-- svelte-ignore a11y-label-has-associated-control -->
                      <label
                        class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                      >
                        <Switch bind:checked={nvrFace} class="scale-90" />
                        Face Scan
                      </label>
                      <label
                        class=" text-xs 2xl:text-sm font-medium leading-6 dark:text-white text-[#2c2c2c] flex items-center gap-1"
                      >
                        <Switch
                          bind:checked={nvrPersonCount}
                          class="scale-90"
                        />
                        Person Count
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <Dialog.Footer>
                <Button on:click={onSubmitNVR} type="submit">Add Nvr</Button>
              </Dialog.Footer>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if modeAdd === 1}
      <div class="flex flex-col px-2">
        <p class="text-[#212123] dark:text-slate-200 font-medium text-xl mt-2">
          Add New Store
        </p>
        <p
          class="text-base text-black/[.7] dark:text-white/[.7] leading-[22px] py-2"
        >
          Add New Store to start monitoring
        </p>
        <span
          class=" h-[1px] w-full bg-[#919EAB] border-opacity-15 mt-4 mb-6"
        />
        {#each Array(addNodeCounter) as _, index (index)}
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-name-${index}`}>Store {index + 1} Name</Label>
            <Input
              id={`node-name-${index}`}
              placeholder={`Store ${index + 1}`}
              class="col-span-3"
              bind:value={nodeName[index]}
              on:change={(e) => (nodeName[index] = e.target.value)}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-address-${index}`}>Address</Label>
            <Input
              id={`node-address-${index}`}
              placeholder={`Address`}
              class="col-span-3"
              bind:value={nodeAddress[index]}
              on:change={(e) => (nodeAddress[index] = e.target.value)}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-pin-${index}`}>Zip</Label>
            <Input
              id={`node-pin-${index}`}
              placeholder={`Zip`}
              class="col-span-3"
              bind:value={nodePin[index]}
              on:change={(e) => (nodePin[index] = e.target.value)}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-country-${index}`}>Country</Label>
            <Input
              id={`node-country-${index}`}
              placeholder={`Country`}
              class="col-span-3"
              bind:value={nodeCountry[index]}
              on:change={(e) => (nodeCountry[index] = e.target.value)}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-manager-${index}`}>Manager</Label>
            <Input
              id={`node-manager-${index}`}
              placeholder={`Manager`}
              class="col-span-3"
              bind:value={nodeManager[index]}
              on:change={(e) => (nodeManager[index] = e.target.value)}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`node-has-kitchen-${index}`}>Has Kitchen</Label>
            <div class="col-span-3">
              <Switch
                id={`node-has-kitchen-${index}`}
                bind:checked={hasKitchen}
              />
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-timezone-${index}`}>Timezone</Label>
            <Select.Root>
              <Select.Trigger class="col-span-3">
                <Select.Value placeholder="Select timezone" />
              </Select.Trigger>
              <Select.Content>
                {#each timezones as timezone}
                  <Select.Item
                    on:click={() => (selectedTimezone = timezone)}
                    value={timezone}>{timezone}</Select.Item
                  >
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-24hr-${index}`}>24-Hour Operation</Label>
            <div class="col-span-3">
              <Switch id={`store-24hr-${index}`} bind:checked={isStore24hr} />
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-open-time-${index}`}>Open Time</Label>
            <Input
              id={`store-open-time-${index}`}
              type="time"
              class="col-span-3"
              bind:value={storeOpenTime}
              disabled={isStore24hr}
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-close-time-${index}`}>Close Time</Label>
            <Input
              id={`store-close-time-${index}`}
              type="time"
              class="col-span-3"
              bind:value={storeCloseTime}
              disabled={isStore24hr}
            />
          </div>
        {/each}
      </div>
      <!-- <Button
        class="w-1/2 mx-auto flex items-center gap-4"
        variant="secondary"
        on:click={() => (addNodeCounter += 1)}
        >Add Another Store <PlusCircle class="text-primary" size={18} /></Button
      > -->
      <Button class="w-1/2 mx-auto" on:click={() => handleAddNode()}
        >Submit</Button
      >
    {/if}
  </Dialog.Content>
</Dialog.Root>

<style>
  .shad {
    box-shadow: 0px 4px 11.2px 0px #00000030;
  }
</style>
