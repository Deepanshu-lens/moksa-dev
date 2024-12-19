<script lang="ts">
  let dialogOpen = false;
  export let save: boolean = true;
  export let face: boolean;
  export let faceDetectionThreshold: number = 0.9;
  export let personDetectionThreshold: number = 0.6;
  export let faceSearchThreshold: number = 0.3;
  export let saveDuration: number;
  export let camera: any;
  export let motionThresh: number = 1000;
  export let fps: number = 1;
  export let person: boolean;
  import * as Dialog from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { Input } from "@/components/ui/input";
  import * as Select from "@/components/ui/select";
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
    TrendingUp,
    FolderSearch,
    Merge,
    PersonStanding,
    ScanFace,
  } from "lucide-svelte";
  import pb from "@/lib/pb";
  import { toast } from "svelte-sonner";
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
  let activeTab = "video-saving";
  const isProd = import.meta.env.PUBLIC_ENV === "production";
  let timeZone = ""; // Variable to hold the selected timezone
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
      await pb.collection("camera").update(camera?.id, {
        // Replace "cameraId" with the actual ID or reference
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
      });
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
        <!-- Right Side tabs -->
        <div class="h-[30rem] bg-neutral-100 dark:bg-black dark:text-white">
          <TabsList
            class="flex p-5 flex-col gap-y-4 justify-start items-start w-full mx-auto bg-[#F3F3F3]  dark:bg-black"
          >
            <TabsTrigger
              value="video-saving"
              class="w-full flex items-center justify-start dark:hover:bg-neutral-700"
            >
              <FileVideo2 size={16} class="mr-2" />Video Saving
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
          </TabsList>
        </div>

        <!-- Tab Content Left side -->
        <div class="h-[29rem] relative px-3">
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
                    bind:value={timeZone}
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
                    class="w-[60%]"
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
                  min={0}
                  max={25}
                  step={1}
                  value={[fps]}
                  class="w-32"
                  onValueChange={(e) => {
                    fps = e[0];
                  }}
                />
                <div class="relative flex items-center max-w-[8rem] ml-2">
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

          <div class="flex justify-end items-end absolute bottom-0 w-full">
            <div class="border-t pt-4 w-full text-right">
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
