<script lang="ts">
  export let dialogOpen = false;
  export let initialTab: string = "display-settings";
  export let camera: any;
  import PocketBase from "pocketbase";
  let save: boolean = camera.save ?? true;
  let face: boolean = camera.face ?? false;
  let faceDetectionThreshold: number = camera.faceDetThresh ?? 0.92;
  let personDetectionThreshold: number = camera.personDetThreshold ?? 0.6;
  let faceSearchThreshold: number = camera.faceMatchThresh ?? 0.3;
  let saveDuration: number =
    camera.saveDuration === 0 ? 7 : camera.saveDuration;
  console.log("saveDuration", saveDuration);
  let streamType: "Default" | "Mainstream" | "Substream" =
    camera.streamType ?? "Default";
  let recordQuality: "Mainstream" | "Substream" =
    camera.recordQuality ?? "Substream";
  let motionThresh: number = camera.motionThresh ?? 1000;
  let fps: number = camera.fps ?? 1;
  let person: boolean = camera.person ?? false;
  let timeZone: string = camera.timeZone ?? "America/New_York";
  import * as Dialog from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { Input } from "@/components/ui/input";
  import * as Select from "@/components/ui/select";
  import Icon from "@iconify/svelte";

  import { Slider } from "@/components/ui/slider";
  import { Button } from "@/components/ui/button";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import {
    Activity,
    FileVideo2,
    Airplay,
    Tv,
    Disc3,
    TrendingUp,
    FolderSearch,
    Merge,
    PersonStanding,
    ScanFace,
    MonitorCog,
    Plus,
    Minus,
    Dot
  } from "lucide-svelte";
  import pb from "@/lib/pb";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import { onDestroy } from "svelte";
  import StreamTile from "@/components/live/streams/StreamTile.svelte";
  import getStreamURL from "@/lib/url";
  const streamTypes = [
    { value: "Default", label: "Default" },
    { value: "Mainstream", label: "Mainstream" },
    { value: "Substream", label: "Substream" },
  ];
  let selectedStreamType = streamTypes.find((m) => m.value === streamType);
  const recordQualities = [
    { value: "Mainstream", label: "Mainstream" },
    { value: "Substream", label: "Substream" },
  ];
  let selectedRecordQuality = recordQualities.find(
    (m) => m.value === recordQuality
  );
  const items = [
    {
      value: 30,
      label: "Monthly",
    },
    {
      value: 7,
      label: "Weekly",
    },
    {
      value: 1,
      label: "Daily",
    },
  ];
  const STREAM_URL = getStreamURL();

  let selectedOverwriteInterval = items.find((m) => m.value === saveDuration);
  let activeTab = initialTab ?? "display-settings";
  const isProd = import.meta.env.PUBLIC_ENV === "production";
  const timeZones = [
    { value: "Pacific/Midway", label: "(GMT-11:00) Midway Island" },
    { value: "Pacific/Niue", label: "(GMT-11:00) Niue" },
    { value: "Pacific/Pago_Pago", label: "(GMT-11:00) Pago Pago" },
    { value: "America/Adak", label: "(GMT-10:00) Adak" },
    {
      value: "America/Los_Angeles",
      label: "(GMT-08:00) Pacific Time (US & Canada)",
    },
    {
      value: "America/Denver",
      label: "(GMT-07:00) Mountain Time (US & Canada)",
    },
    {
      value: "America/Chicago",
      label: "(GMT-06:00) Central Time (US & Canada)",
    },
    {
      value: "America/New_York",
      label: "(GMT-05:00) Eastern Time (US & Canada)",
    },
    { value: "America/Halifax", label: "(GMT-04:00) Atlantic Time (Canada)" },
    {
      value: "America/Argentina/Buenos_Aires",
      label: "(GMT-03:00) Buenos Aires",
    },
    { value: "America/Sao_Paulo", label: "(GMT-03:00) São Paulo" },
    { value: "Atlantic/Azores", label: "(GMT-01:00) Azores" },
    { value: "Europe/London", label: "(GMT+00:00) London" },
    { value: "Europe/Berlin", label: "(GMT+01:00) Berlin" },
    { value: "Europe/Paris", label: "(GMT+01:00) Paris" },
    { value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
    { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
    { value: "Asia/Kabul", label: "(GMT+04:30) Kabul" },
    { value: "Asia/Tehran", label: "(GMT+03:30) Tehran" },
    { value: "Asia/Karachi", label: "(GMT+05:00) Karachi" },
    { value: "Asia/Calcutta", label: "(GMT+05:30) Kolkata" },
    { value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
    { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
    { value: "Asia/Hong_Kong", label: "(GMT+08:00) Hong Kong" },
    { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
    { value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
    { value: "Australia/Adelaide", label: "(GMT+09:30) Adelaide" },
    { value: "Australia/Perth", label: "(GMT+08:00) Perth" },
    { value: "Pacific/Auckland", label: "(GMT+13:00) Auckland" },
    { value: "Pacific/Fiji", label: "(GMT+12:00) Fiji" },
    { value: "Pacific/Chatham", label: "(GMT+13:45) Chatham Islands" },
  ];
  let selectedTimezone = timeZones.find((m) => m.value === timeZone);
  const pb_online = new PocketBase(import.meta.env.PUBLIC_POCKETBASE_URL);
  
  let index = writable(null);
  let status = writable(null);
  let presets = writable([]);
  let zoomSpeed = writable("");
  let isPtzOpen = writable(false);

  // Function to save camera settings
  const saveCameraSettings = async () => {
    // Log all values before sending
    console.log("Saving camera settings with the following values:", {
      save,
      face,
      faceDetectionThreshold,
      personDetectionThreshold,
      faceSearchThreshold,
      motionThresh,
      fps,
      person,
      timeZone,
    });

    try {
      const data = {
        save,
        face,
        faceDetThresh: faceDetectionThreshold,
        personDetThreshold: personDetectionThreshold,
        faceMatchThresh: faceSearchThreshold,
        saveDuration,
        motionThresh,
        fps,
        person,
        timeZone,
        streamType: selectedStreamType?.value,
        recordQuality: selectedRecordQuality?.value,
        streamToCloud: camera.streamToCloud,
        isLocalNetwork: camera.isLocalNetwork,
      };
      // if (window.api || isCurrentUrlLocalhost()) {
      //   const record = await pb_online.collection("camera").update(camera?.id, );

      //   if (record) await pb.collection("camera").update(camera?.id, );
      //   else await pb.collection("camera").create(data);
      // } else {
      //   const record = await pb.collection("camera").create(data);
      // }
      await pb.collection("camera").update(camera?.id, data);
      // Optionally, you can close the dialog or show a success message
      dialogOpen = false; // Close the dialog after saving
    } catch (error) {
      toast.error(
        error?.message || "something went wrong while updating camera settings"
      );
      console.error("Error updating camera settings:", error);
      // Optionally, show an error message to the user
    }
  };

  function isCurrentUrlLocalhost(): boolean {
    const hostname = window.location.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  }

  async function getStatus() {
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/status/${$index}`, {
      method: "GET",
    })
      .then(async (res) => {
        const data = await res.json();
        // console.log(data)
        status.set(data);
      })
      .catch((err) => console.log(err));
  }
  async function getPresets() {
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/presets/${$index}`, {
      method: "GET",
    })
      .then(async (res) => {
        const data = await res.json();
        // console.log(data)
        const presetArray = Object.entries(data).map(([name, token]) => ({
          name,
          token,
        }));

        presets.set(presetArray);
      })
      .catch((err) => console.log(err));
  }
  async function setPreset() {
    try {
      await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/set-preset/${$index}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          presetName: `Preset ${$presets.length}`,
          // presetToken: `Preset ${$presets.length}`
        }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res?.ok) {
          throw new Error(data?.message);
        }
        await getPresets();
        toast.success(`Preset Saved Successfully!`);
      });
    } catch (error) {
      toast.error(
        error?.message || "Something went wrong while intializing onvif!"
      );
      console.log(error?.message, "err");
    }
  }
  async function move(move: any, zoomValue: number) {
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/relative-move/${$index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        x: move === "left" ? -0.2 : move === "right" ? 0.2 : 0,
        y: move === "up" ? 0.2 : move === "down" ? -0.2 : 0,
        zoom: zoomValue === undefined ? $status.position.zoom : zoomValue,
        speed: {
          x: move[0],
          y: move[0],
          zoom: zoomValue,
        },
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        await getStatus();
      })
      .catch((err) => console.log(err));
  }

  async function moveSpeed(move: any, zoomValue: number) {
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/relative-move/${$index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        speed: {
          x: move[0],
          y: move[0],
          zoom: zoomValue,
        },
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        await getStatus();
      })
      .catch((err) => console.log(err));
  }
  async function gotoPreset(preset) {
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/goto-preset/${$index}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        preset: preset.token,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        toast.success(`Moved to preset: ${preset.name}`);
      })
      .catch((err) => console.log(err));
  }

  onDestroy(async () => {
    console.log("stop called");
    await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/stop/${index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pantilt: true,
        zoom: true,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
      })
      .catch((err) => console.log(err));
  });
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[800px] pl-0 pb-0 gap-0">
    <Dialog.Header class="border-b pb-2 pl-6 mb-0">
      <Dialog.Title>Camera Settings</Dialog.Title>
      <Dialog.Description></Dialog.Description>
    </Dialog.Header>

    <!-- Dialog Content -->
    <div class="main-content mt-0">
      <Tabs
        value={activeTab}
        onValueChange={(value) => (activeTab = value)}
        class="w-full flex"
      >
        <!-- Left Side tabs -->
        <div class="h-[32rem] bg-neutral-100 dark:bg-black dark:text-white">
          <TabsList
            class="flex p-5 flex-col gap-y-4 justify-start items-start w-full mx-auto bg-[#F3F3F3]  dark:bg-black"
          >
            <TabsTrigger
              value="display-settings"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <Tv size={16} class="mr-2" />Display Settings
            </TabsTrigger>
            <TabsTrigger
              value="video-saving"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <FileVideo2 size={16} class="mr-2" />Video Saving
            </TabsTrigger>
            <TabsTrigger
              value="cloud-stream"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <Icon icon="mdi:cloud" class="text-xl mr-2" />Cloud Streaming
            </TabsTrigger>
            <TabsTrigger
              value="face-scanning"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <ScanFace size={16} class="mr-2" />Face Detection
            </TabsTrigger>
            <TabsTrigger
              value="person-detection"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <PersonStanding size={16} class="mr-2" />Person Detection
            </TabsTrigger>
            <TabsTrigger
              value="motion-sensitivity"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <Activity size={16} class="mr-2" />Motion Sensitivity
            </TabsTrigger>
            <TabsTrigger
              value="fps"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <TrendingUp size={16} class="mr-2" />AI Frame Ratio
            </TabsTrigger>
            <TabsTrigger
              value="ptz"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <MonitorCog size={16} class="mr-2" />PTZ Controls
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Tab Content Right side -->
        <div class="h-[35rem] relative px-3">
          <!-- display settings -->
          <TabsContent value="display-settings">
            <div class="space-y-4 w-full">
              <div
                class="flex items-center justify-between p-2 gap-x-[23rem] border-b pb-2"
              >
                <Label class="text-nowrap">Display Settings</Label>
              </div>
              <div class="flex items-center space-x-4 pt-3">
                <Airplay />
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    Stream Type: 'Mainstream', 'Substream', or 'Default'
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Mainstream offers higher quality, while substream provides
                    lower quality for reduced bandwidth. 'Default' auto-switches
                    to 'Mainstream' when 5 or more cameras are connected. Also
                    reverts to mainstream on fullscreen.
                  </p>
                </div>
                <Select.Root
                  onSelectedChange={(e: {
                    value: "Default" | "Mainstream" | "Substream";
                  }) => (streamType = e.value)}
                  items={streamTypes}
                  bind:selected={selectedStreamType}
                >
                  <Select.Trigger class="w-[180px]">
                    <Select.Value
                      placeholder={streamTypes.find(
                        (m) => m.value === streamType
                      )?.label || "Select Stream Type"}
                    />
                  </Select.Trigger>
                  <Select.Content>
                    {#each streamTypes as fruit}
                      <Select.Item
                        value={fruit.value}
                        label={fruit.label}
                        class="truncate max-w-xs inline-block"
                      >
                        {fruit.label}
                      </Select.Item>
                    {/each}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          </TabsContent>
          <!-- video saving -->
          <TabsContent value="video-saving">
            <div class="space-y-4 w-[32.7rem]">
              <div
                class="flex items-center justify-between p-2 gap-x-[23rem
                  ] border-b pb-2"
              >
                <Label class="text-nowrap">Video Saving</Label>
                <Switch bind:checked={save} />
              </div>

              {#if save}
                <!-- Add other video saving options here -->
                {#if !isProd}
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
                      class="w-[180px] placeholder:dark:text-gray-400"
                      disabled
                      placeholder="./PlayBack"
                    />
                  </div>
                {/if}
                <div class="flex items-center space-x-4 pt-3">
                  <Disc3 />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      Stream Type: 'Mainstream' or 'Substream'
                    </p>
                    <p class="text-xs text-muted-foreground">
                      Mainstream offers higher quality video recording, while
                      substream provides lower quality for reduced bandwidth.
                    </p>
                  </div>
                  <Select.Root
                    onSelectedChange={(e: {
                      value: "Mainstream" | "Substream";
                    }) => (recordQuality = e.value)}
                    items={recordQualities}
                    bind:selected={selectedRecordQuality}
                  >
                    <Select.Trigger class="w-[180px]">
                      <Select.Value
                        placeholder={recordQualities.find(
                          (m) => m.value === streamType
                        )?.label || "Select Stream Type"}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {#each recordQualities as fruit}
                        <Select.Item
                          value={fruit.value}
                          label={fruit.label}
                          class="truncate max-w-xs inline-block"
                        >
                          {fruit.label}
                        </Select.Item>
                      {/each}
                    </Select.Content>
                  </Select.Root>
                </div>
                <div class="flex items-center space-x-4 pt-3">
                  <Merge />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-medium leading-none">
                      Overwrite Interval
                    </p>
                    <p class="text-sm text-muted-foreground">
                      Duration until the saved video is overwritten.
                    </p>
                  </div>
                  <Select.Root
                    onSelectedChange={(e) => (saveDuration = e.value)}
                    {items}
                    bind:selected={selectedOverwriteInterval}
                  >
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

                <!-- Timezone Selector -->
                <div class="mt-4">
                  <Label
                    for="timezone"
                    class="block text-sm font-medium text-gray-700 my-3"
                    >Select Timezone</Label
                  >
                  <Select.Root
                    bind:selected={selectedTimezone}
                    items={timeZones}
                    onSelectedChange={(e) => (timeZone = e.value)}
                  >
                    <Select.Trigger class="w-[280px] my-3">
                      <Select.Value
                        placeholder={items.find((m) => m.value === timeZone)
                          ?.label || "Select Duration"}
                      />
                    </Select.Trigger>
                    <Select.Content class="h-60 overflow-y-auto">
                      <Select.Group>
                        {#each timeZones as zone}
                          <Select.Item value={zone.value} label={zone.label}
                            >{zone.label}</Select.Item
                          >
                        {/each}
                      </Select.Group>
                    </Select.Content>
                    <Select.Input name="favoriteFruit" />
                  </Select.Root>
                </div>
              {/if}
            </div>
          </TabsContent>

          <!-- cloud streaming -->
          <TabsContent value="cloud-stream">
            <div class="space-y-4 w-full">
              <div
                class="flex items-center justify-between p-2 gap-x-[23rem] border-b pb-2"
              >
                <Label class="text-nowrap">Cloud Streaming</Label>
              </div>

              <div class="flex items-center space-x-4 pt-3">
                <div class="flex-1 space-y-1">
                  <p class="text-sm font-medium leading-none">
                    Status: {camera.streamToCloud
                      ? camera.streamToCloudStatus === "active"
                        ? "Connected and streaming"
                        : camera.streamToCloudStatus === "broadcasting"
                          ? "Broadcasting to cloud"
                          : camera.streamToCloudStatus === "receiving"
                            ? "Receiving from cloud"
                            : "Enabled - Waiting for connection"
                      : "Disabled"}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Enable cloud streaming to access your camera feed remotely
                    and use AI features
                  </p>
                </div>
                <Switch
                  checked={camera.streamToCloud}
                  onCheckedChange={async (checked) => {
                    if (window.api || isCurrentUrlLocalhost()) {
                      const record = await pb_online
                        .collection("camera")
                        .update(camera?.id, {
                          streamToCloud: checked,
                        });

                      if (record)
                        await pb.collection("camera").update(camera?.id, {
                          streamToCloud: checked,
                        });
                    } else {
                      const record = await pb
                        .collection("camera")
                        .update(camera?.id, {
                          streamToCloud: checked,
                        });
                    }
                  }}
                />
              </div>

              {#if camera.streamToCloud}
                <div
                  class="mt-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg"
                >
                  <h4 class="text-sm font-medium mb-2">Connection Details</h4>
                  <div class="space-y-2 text-xs text-muted-foreground">
                    <p>
                      • Status: <span
                        class={camera.streamToCloudStatus === "active"
                          ? "text-green-500"
                          : camera.streamToCloudStatus === "broadcasting" ||
                              camera.streamToCloudStatus === "receiving"
                            ? "text-blue-500"
                            : "text-yellow-500"}
                      >
                        {camera.streamToCloudStatus === "active"
                          ? "Connected"
                          : camera.streamToCloudStatus === "broadcasting"
                            ? "Broadcasting"
                            : camera.streamToCloudStatus === "receiving"
                              ? "Receiving"
                              : "Connecting..."}
                      </span>
                    </p>
                    <p>
                      • Last connected: {camera?.lastCloudConnection || "Never"}
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          </TabsContent>

          <!-- face scanning -->
          <TabsContent value="face-scanning">
            <div class="space-y-4 w-full">
              <div
                class="flex items-center justify-between p-2 gap-x-[23rem] border-b pb-2"
              >
                <Label class="text-nowrap">Face Scanning</Label>
                <Switch bind:checked={face} />
              </div>
              {#if face}
                <Label>Face Detection Threshold</Label>
                <p class="text-sm text-muted-foreground mt-1 mb-4">
                  Adjust the threshold to accommodate smaller or larger faces
                </p>
                <div class="flex items-center gap-x-2">
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[faceDetectionThreshold]}
                    onValueChange={(e) => (faceDetectionThreshold = e[0])}
                    class="w-[50%]"
                  />
                  <div class="relative flex items-center max-w-[8rem] ml-2">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      type="button"
                      id="decrement-button"
                      class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                      on:click={() => {
                        faceDetectionThreshold = Math.max(
                          0,
                          faceDetectionThreshold - 0.1
                        ); // Step of 0.01
                      }}
                    >
                      <svg
                        class="w-3 h-3 text-gray-900 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 2"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M1 1h16"
                        />
                      </svg>
                    </button>
                    <input
                      type="text"
                      id="quantity-input"
                      class="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={faceDetectionThreshold}
                      on:input={(e) => {
                        const value = Math.min(Math.max(e.target.value, 0), 10);
                        faceDetectionThreshold = value / 10;
                      }}
                      placeholder="0"
                      required
                    />
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      type="button"
                      id="increment-button"
                      class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                      on:click={() => {
                        faceDetectionThreshold = Math.min(
                          1,
                          faceDetectionThreshold + 0.1
                        ); // Step of 0.01
                      }}
                    >
                      <svg
                        class="w-3 h-3 text-gray-900 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 1v16M1 9h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Face Matching Threshold</Label>
                  <p class="text-sm text-muted-foreground mt-1 mb-4">
                    Adjust the threshold to accomodate smaller or larger faces
                  </p>
                  <div class="flex items-center gap-x-2">
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[faceSearchThreshold]}
                      onValueChange={(e) => (faceSearchThreshold = e[0])}
                      class="w-[60%]"
                    />
                    <div class="relative flex items-center max-w-[8rem] ml-2">
                      <!-- svelte-ignore a11y_consider_explicit_label -->
                      <button
                        type="button"
                        id="decrement-button"
                        class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                        on:click={() => {
                          faceSearchThreshold = Math.max(
                            0,
                            faceSearchThreshold - 0.1
                          ); // Step of 0.01
                        }}
                      >
                        <svg
                          class="w-3 h-3 text-gray-900 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 18 2"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M1 1h16"
                          />
                        </svg>
                      </button>
                      <input
                        type="text"
                        id="quantity-input"
                        class="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={faceSearchThreshold}
                        on:input={(e) => {
                          const value = Math.min(
                            Math.max(e.target.value, 0),
                            10
                          );
                          faceSearchThreshold = value / 10;
                        }}
                        placeholder="0"
                        required
                      />
                      <!-- svelte-ignore a11y_consider_explicit_label -->
                      <button
                        type="button"
                        id="increment-button"
                        class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                        on:click={() => {
                          faceSearchThreshold = Math.min(
                            1,
                            faceSearchThreshold + 0.1
                          ); // Step of 0.01
                        }}
                      >
                        <svg
                          class="w-3 h-3 text-gray-900 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 18 18"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 1v16M1 9h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </TabsContent>

          <!-- person detection -->
          <TabsContent value="person-detection">
            <div class="space-y-4 w-full">
              <div class="border-b pb-2 p-2">
                <div class="flex items-center justify-between gap-x-[20rem]">
                  <Label
                    class="text-nowrap text-base
                    ">Person Detection</Label
                  >
                  <Switch bind:checked={person} />
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  Parameters for identifying persons
                </p>
              </div>
              {#if person}
                <div class="flex items-center gap-x-2">
                  <Label class="my-3">Person Detection Threshold</Label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[personDetectionThreshold]}
                    onValueChange={(e) => (personDetectionThreshold = e[0])}
                    class="w-[60%]"
                  />
                  <div class="relative flex items-center max-w-[8rem] ml-2">
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      type="button"
                      id="decrement-button"
                      class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                      on:click={() => {
                        personDetectionThreshold = Math.max(
                          0,
                          personDetectionThreshold - 0.1
                        ); // Step of 0.01
                      }}
                    >
                      <svg
                        class="w-3 h-3 text-gray-900 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 2"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M1 1h16"
                        />
                      </svg>
                    </button>
                    <input
                      type="text"
                      id="quantity-input"
                      class="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={personDetectionThreshold}
                      on:input={(e) => {
                        const value = Math.min(Math.max(e.target.value, 0), 10);
                        personDetectionThreshold = value;
                      }}
                      placeholder="0"
                      required
                    />
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button
                      type="button"
                      id="increment-button"
                      class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                      on:click={() => {
                        personDetectionThreshold = Math.min(
                          1,
                          personDetectionThreshold + 0.1
                        ); // Step of 0.01
                      }}
                    >
                      <svg
                        class="w-3 h-3 text-gray-900 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 1v16M1 9h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </TabsContent>

          <!-- motion sensitivity -->
          <TabsContent value="motion-sensitivity">
            <div
              class="rounded-md p-2 my-2 flex items-center justify-between w-[33rem]"
            >
              <div class="flex items-center space-x-4 mx-4">
                <Activity />
                <p class="text-sm font-medium leading-none">
                  Motion Sensitivity
                </p>
              </div>
              <div class="flex items-center gap-8 w-52">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[motionThresh]}
                  class="w-32"
                  onValueChange={(e) => {
                    motionThresh = e[0];
                  }}
                />
                <div class="relative flex items-center max-w-[8rem] ml-2">
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button
                    type="button"
                    id="decrement-button"
                    class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    on:click={() => {
                      if (motionThresh > 0) {
                        motionThresh = Math.max(0, motionThresh - 1); // Step of 1
                      }
                    }}
                  >
                    <svg
                      class="w-3 h-3 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 2"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 1h16"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    id="quantity-input"
                    class="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={motionThresh}
                    on:input={(e) => {
                      const value = Math.min(Math.max(e.target.value, 0), 10);
                      motionThresh = value;
                    }}
                    placeholder="0"
                    required
                  />
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button
                    type="button"
                    id="increment-button"
                    class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    on:click={() => {
                      if (motionThresh < 10) {
                        motionThresh = Math.min(10, motionThresh + 1); // Step of 1
                      }
                    }}
                  >
                    <svg
                      class="w-3 h-3 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 18"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 1v16M1 9h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-2 p-2 mx-4">
              {`Increase in Motion Sensitivity might cause decrease in ${isProd ? "cost" : "CPU Usage"}.`}
            </p>
          </TabsContent>

          <!-- frames performance settings -->
          <TabsContent value="fps">
            <div
              class="rounded-md p-2 my-2 flex items-center justify-between w-[33rem]"
            >
              <div class="flex items-center space-x-4 mx-4">
                <TrendingUp />
                <p class="text-sm font-medium leading-none">
                  Frames Per Second
                </p>
              </div>
              <div class="flex items-center gap-8 w-52">
                <Slider
                  min={1}
                  max={25}
                  step={1}
                  value={[fps]}
                  class="w-32"
                  onValueChange={(e) => {
                    fps = e[0];
                  }}
                />
                <div class="relative flex items-center max-w-[8rem] ml-2">
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button
                    type="button"
                    id="decrement-button"
                    class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    on:click={() => {
                      if (fps > 0) {
                        fps = Math.max(0, fps - 1); // Step of 1
                      }
                    }}
                  >
                    <svg
                      class="w-3 h-3 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 2"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 1h16"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    id="quantity-input"
                    class="bg-gray-50 border-x-0 border-gray-300 h-11 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={fps}
                    on:input={(e) => {
                      const value = Math.min(Math.max(e.target.value, 0), 25);
                      fps = value;
                    }}
                    placeholder="0"
                    required
                  />
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button
                    type="button"
                    id="increment-button"
                    class="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg p-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-none"
                    on:click={() => {
                      if (fps < 25) {
                        fps = Math.min(25, fps + 1); // Step of 1
                      }
                    }}
                  >
                    <svg
                      class="w-3 h-3 text-gray-900 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 18"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 1v16M1 9h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-2 p-2 mx-4">
              {`Increase in FPS might cause high ${isProd ? "cost" : "CPU Usage"}.`}
            </p>
          </TabsContent>

          <!-- Ptz controls -->
          <TabsContent value="ptz">
            <div class="w-[33rem]">
              <!-- Streaming container -->
             <div class="w-full h-48">
              <StreamTile
              name={camera?.name}
              id={camera?.id}
              url={`${STREAM_URL}/api/ws?src=${camera?.id}`}
            ></StreamTile>
             </div>
              <div class="flex items-center justify-evenly mt-6">
                <span class="flex flex-col items-center justify-center gap-2">
                  <span
                    class="h-[75px] w-[35px] p-2 rounded-2xl bg-[#202020] interior text-white flex flex-col items-center justify-between"
                  >
                    <button on:click={() => moveSpeed("", 0.1)}
                      ><Plus size="16" /></button
                    >
                    <button on:click={() => moveSpeed("", 0.1)}
                      ><Minus size="16" /></button
                    >
                  </span>
                  <p class="text-sm text-white">Focus</p>
                </span>
                <span>
                  <span
                    class="size-[120px] p-2 rounded-full bg-gradient-to-b border border-gray-800 shadow-custom-inset drop-shadow-3xl drop-shadow-gray-200 dark:border-gray-600 dark:shadow-gray-600 text-white flex flex-col items-center justify-center relative"
                  >
                    <span
                      class="size-[80px] rounded-full bg-gradient-to-b shadow-lg drop-shadow-md shadow-gray-700 dark:border-gray-600 dark:shadow-gray-600 text-white border border-solid relative"
                    >
                      <!-- <Tooltip.Root>
                      <Tooltip.Trigger asChild let:builder> -->
                      <Button
                        on:click={() => setPreset()}
                        class="absolute text-white bg-gradient-to-b from-[#202020] to-[#141414] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        <Plus size="20" />
                      </Button>
                      <!-- </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>Add Preset</p>
                      </Tooltip.Content>
                    </Tooltip.Root> -->
                    </span>
      
                    <button
                      class="absolute text-white top-1/2 left-1 -translate-y-1/2"
                      on:click={() => move("left", 0)}
                    >
                      <Dot size="20" />
                    </button>
                    <button
                      class="absolute text-white top-1 left-1/2 -translate-x-1/2"
                      on:click={() => move("up", 0)}
                    >
                      <Dot size="20" />
                    </button>
                    <button
                      class="absolute text-white top-1/2 right-1 -translate-y-1/2"
                      on:click={() => move("right", 0)}
                    >
                      <Dot size="20" />
                    </button>
                    <button
                      class="absolute text-white bottom-1 right-1/2 translate-x-1/2"
                      on:click={() => move("down", 0)}
                    >
                      <Dot size="20" />
                    </button>
                  </span>
                </span>
                <span class="flex flex-col items-center justify-center gap-2">
                  <span
                    class="h-[75px] w-[35px] p-2 rounded-2xl bg-[#202020] text-white flex flex-col items-center justify-between"
                  >
                    <button on:click={() => move("", 0.1)}><Plus size="16" /></button>
                    <button on:click={() => move("", -0.1)}
                      ><Minus size="16" /></button
                    >
                  </span>
                  <p class="text-sm text-white">Zoom</p>
                </span>
              </div>
              <div class="flex flex-col items-start justify-center gap-2 my-2 px-4">
                <p class="text-sm text-white">Camera speed</p>
                <Slider
                  class="w-full bg-[#181818]"
                  rangeBg="bg-[red]"
                  max={1}
                  step={0.1}
                  onValueChange={(v) => moveSpeed(v, 0)}
                />
              </div>
              <div class="flex flex-col items-start justify-center gap-1 my-2 px-4">
                <p class="text-sm text-[#202020] dark:text-white">Presets</p>
                <Select.Root portal={null}>
                  <Select.Trigger class="w-full bg-[#202020] text-white">
                    <Select.Value placeholder="Select a Preset" />
                  </Select.Trigger>
                  <Select.Content class="bg-[#202020]">
                    <Select.Group>
                      <Select.Label class="text-white">Presets</Select.Label>
                      {#if $presets.length > 0}
                        {#each $presets as preset}
                          <Select.Item
                            class="text-white"
                            on:click={() => gotoPreset(preset)}
                            value={preset?.token}
                            label={preset?.name}>{preset?.name}</Select.Item
                          >
                        {/each}
                      {:else}
                        <Select.Item class="text-white" value={null} label={null}
                          >No Presets</Select.Item
                        >
                      {/if}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          </TabsContent>

          <div class="flex justify-end items-end absolute bottom-0 w-full">
            <div class="border-t py-4 w-full text-right">
              <Button
                variant="brand"
                type="button"
                on:click={saveCameraSettings}>Save Changes</Button
              >
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  </Dialog.Content>
</Dialog.Root>
