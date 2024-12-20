<script lang="ts">
  import * as Select from "@/components/ui/select";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import * as Tabs from "@/components/ui/tabs";
  import { Slider } from "@/components/ui/slider";
  import * as Table from "@/components/ui/table/index";
  import pb from "@/lib/pb";
  import { selectedNode, user } from "@/stores";

  import { createForm } from "felte";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import Checkbox from "../ui/checkbox/checkbox.svelte";
  import { Loader2 } from "lucide-svelte";
  import getOnvifUrl from "@/lib/onvif";
  import getPlaybackURL from "@/lib/playback";

  export let cameraName = "";
  export let mainUrl = "";
  export let subUrl = "";
  export let doneSubmit = false;
  export let modalOpen;
  let cameraMethod = writable("manual");
  let userName = "";
  let password = "";
  let ipAddress = "";
  let ipAddress1 = "";
  let ipAddress2 = "";
  let ipAddress3 = "";
  let ipAddress4 = "";
  let endIpAddress1 = "";
  let endIpAddress2 = "";
  let endIpAddress3 = "";
  let endIpAddress4 = "";
  let httpPort = "";
  let tabValue = "rtsp";
  let isBulk = writable(true);
  let discoveryData = writable<[]>([]);
  const selectedRows = writable([]);
  let onvifCamerasList: {
    ipAddress: string;
    cameraName: string;
    brandName: string;
    hardwareId: number;
    serialNumber: string;
  }[] = [];
  let fetchingCamers: boolean = false;
  let gettingRtsp: boolean = false;
  let clickedSubmit = writable(false);
  interface OnvifCamera {
    ipAddress: string;
    cameraName: string;
    brandName: string;
    hardwareId: number;
    serialNumber: string;
  }
  let selectedOnvifCameras = writable<OnvifCamera[]>([]);

  let rangeStart = 1;
  let rangeEnd = 255;

  const { form, errors, reset, isSubmitting } = createForm({
    initialValues: { name: "", url: "", subUrl: "" },
    //todo:this needs to be implimented asap
    // extend: validator({
    //   schema: cameraSchema.schema.omit({
    //     id: true,
    //   save: true,
    //   url:true
    //   }),
    // }),
    onSubmit: async (values: any) => {
      addCamera();
      reset();
    },
    onError: (err: any) => {
      console.error("Form validation failed:", err);
    },
  });

  const streamUri = async (index: any) => {
    const res = await fetch(
      `${import.meta.env.PUBLIC_ONVIF_URL}/stream-uri/${index}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (data.uri) {
      const url = data.uri.split("//");
      const url1 = url[0];
      const url2 = url[1];

      const urlLink = `${url1}//${userName}:${password}@${url2}`;
      console.log(urlLink, "urlLink");
      try {
        const data = {
          name: cameraName,
          url: urlLink,
          subUrl: urlLink,
          motionSensitivity: 33, // Example value
          node: $selectedNode,
          save: true,
        };
        pb.autoCancellation(false);
        const record = await pb.collection("camera").create(data);
        toast.success("Camera added successfully");
        doneSubmit = true;
      } catch (error) {
        console.error("Failed to add camera:", error);
      }
    }
  };

  const addCamera = async () => {
    if (tabValue === "rtsp") {
      try {
        const data = {
          name: cameraName,
          url: mainUrl,
          subUrl,
          node: $selectedNode,
          save: true,
          session: $user?.session[0],
        };

        const record = await pb.collection("camera").create(data);
        console.log("Camera added:", record);
        doneSubmit = true;
        modalOpen.set(false);
        toast.success("Camera added successfully");
      } catch (error) {
        console.error("Failed to add camera:", error);
      }
    } else if (tabValue === "spectra") {
      if (password?.includes("@")) {
        password = password.replace("@", "%40");
      } else if (password?.includes("#")) {
        password = password.replace("#", "%23");
      } else if (password?.includes("&")) {
        password = password.replace("&", "%26");
      } else if (password?.includes("?")) {
        password = password.replace("?", "%3F");
      } else if (password?.includes("/")) {
        password = password.replace("/", "%2F");
      } else if (password?.includes("$")) {
        password = password.replace("$", "%24");
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        let rtspUrl = `rtsp://${userName}:${password}@${ipAddress1}.${ipAddress2}.${ipAddress3}.${i}:${Number(httpPort)}/lkm/live/1/1`;
        let rtspSubUrl = `rtsp://${userName}:${password}@${ipAddress1}.${ipAddress2}.${ipAddress3}.${i}:${Number(httpPort)}/lkm/live/1/2`;

        try {
          const data = {
            name: `camera-${i}`,
            hostname: ipAddress,
            username: userName,
            password: password,
            port: Number(httpPort),
            url: rtspUrl,
            subUrl: rtspSubUrl,
            node: $selectedNode,
            save: true,
            session: $user?.session[0],
          };

          const record = await pb.collection("camera").create(data);
          console.log("Camera added:", record);
          doneSubmit = true;
        } catch (error) {
          console.error("Failed to add camera:", error);
        }
      }
      doneSubmit = true;
      modalOpen.set(false);
      toast.success("Camera added successfully");
    } else {
      setRtspToDb();
      // console.log(tabValue)
    }
  };

  const ONVIF_URL = getOnvifUrl();

  const fetchONVIFCams = async () => {
    fetchingCamers = true;
    try {
      if ($isBulk) {
        if (ipAddress4 >= endIpAddress4)
          throw new Error("Start IP can not be less than end IP");
      }

      let response;

      if ($isBulk) {
        response = await fetch(
          `${ONVIF_URL}/discover-cameras?startIp=${ipAddress1}.${ipAddress2}.${ipAddress3}.${ipAddress4}&endIp=${endIpAddress1}.${endIpAddress2}.${endIpAddress3}.${endIpAddress4}&username=${userName}&password=${password}&port=${httpPort}`
        );
      } else {
        response = await fetch(
          `${ONVIF_URL}/discover-cameras?startIp=${ipAddress1}.${ipAddress2}.${ipAddress3}.${ipAddress4}&endIp=${ipAddress1}.${ipAddress2}.${ipAddress3}.${ipAddress4}&username=${userName}&password=${password}&port=${httpPort}`
        );
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data?.cameras?.length === 0) {
        toast.error("No cameras found");
      }

      onvifCamerasList = data.cameras || [];
    } catch (error) {
      console.error("Failed to fetch ONVIF cameras:", error);
      toast.error(error?.message || "Failed to fetch ONVIF cameras");
    } finally {
      fetchingCamers = false;
    }
  };

  const addCameraAutomatic = async () => {
    // Create an array of promises based on selectedRows
    const promises = $selectedRows?.map(async (row) => {
      try {
        const res = await fetch(
          `${import.meta.env.PUBLIC_ONVIF_URL}/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "",
              hostname: row?.xaddrs[0]?.split("//")[1]?.split("/")[0],
              username: userName,
              password: password,
              port: row?.xaddrs[0]?.includes("https") ? 443 : 80,
              timeout: 10000,
              session: $user?.session[0],
            }),
          }
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        await streamUri(data.index); // Call your streamUri function with the index
      } catch (err) {
        console.log(err);
        toast.error("Failed to add camera via ONVIF", {
          description: "Incompatible SOAP version",
        });
        doneSubmit = false; // Handle submission state as needed
      }
    });

    // Execute all promises concurrently
    await Promise.all(promises);
  };

  // row selection
  const toggleRowSelection = (row: any) => {
    selectedRows.update((rows) =>
      rows?.includes(row) ? rows?.filter((r) => r !== row) : [...rows, row]
    );
  };

  const getCameraDiscoveryList = async () => {
    try {
      await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/discovery/start`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (res) => {
        const data = await res.json();
        discoveryData.set(data?.devices || data);
      });
    } catch (error) {
      toast.error(
        error?.message || "Something went wrong while intializing onvif!"
      );
      console.log(error?.message, "err");
    }
  };

  $: {
    if ($cameraMethod === "automatic") {
      getCameraDiscoveryList();
    }
  }

  const setRtspToDb = async () => {
    gettingRtsp = true;

    console.log(JSON.stringify($selectedOnvifCameras, null, 2));
    const promises = $selectedOnvifCameras.map(async (camera) => {
      const url = `${ONVIF_URL}/get-stream-uris?ip=${camera.ipAddress}&username=${userName}&password=${password}&port=${httpPort}`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return { camera: camera.cameraName, data };
      } catch (error) {
        console.error(
          `Failed to fetch stream URIs for ${camera.cameraName}:`,
          error
        );
        return { camera: camera.cameraName, error: error.message };
      }
    });

    const results = await Promise.all(promises);

    const transformCameraData = (cameraResults) => {
      return cameraResults.map((cameraResult, i) => {
        const streams = cameraResult.data.streams;
        if (selectedOnvifCameras?.length > 1) {
          return {
            name: cameraName,
            url: streams[0]?.streamUri || "",
            subUrl: streams[1]?.streamUri || "",
            motionSensitivity: 33,
            node: $selectedNode,
            save: true,
          };
        } else {
          return {
            name: cameraName + `-${i + 1}`,
            url: streams[0]?.streamUri || "",
            subUrl: streams[1]?.streamUri || "",
            motionSensitivity: 33,
            node: $selectedNode,
            save: true,
          };
        }
      });
    };

    const transformedData = transformCameraData(results);

    // Loop over transformed data and create records
    const createPromises = transformedData.map(async (data: any) => {
      try {
        const record = await pb.collection("camera").create(data);
      } catch (error) {
        console.error("Failed to add camera:", error);
      }
    });

    await Promise.all(createPromises);
    gettingRtsp = false;
    toast.success("Camera added successfully");
    modalOpen.set(false);
    location.reload();
  };

  const handleIpInput = (event: Event | KeyboardEvent, nextInputId: string) => {
    // Handle dot key press
    if ("key" in event && event.key === ".") {
      event.preventDefault();
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
      return;
    }

    // Don't process further if it's a deletion
    if (
      "key" in event &&
      (event.key === "Backspace" || event.key === "Delete")
    ) {
      return;
    }

    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Ensure only numbers are entered
    value = value.replace(/[^\d]/g, "");

    // Limit to 3 digits
    if (value.length > 3) {
      value = value.slice(0, 3);
    }

    // Update the input value
    input.value = value;

    // Move to next input if we have 3 digits and the number is <= 255
    if (value.length === 3 && parseInt(value) <= 255) {
      const nextInput = document.getElementById(nextInputId);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
</script>

<form
  use:form
  class="space-y-4 mt-4 w-full h-96 overflow-y-auto p-4 rounded-md"
>
  <!-- Manual/Automatic Mode -->
  <div
    class="flex flex-col sm:flex-row items-center justify-between border-b pb-8"
  >
    <Label class="text-left mb-2">Select method of adding camera</Label>
    <Select.Root onSelectedChange={(v) => cameraMethod.set(v?.value)}>
      <Select.Trigger class="w-full sm:w-1/3">
        <Select.Value placeholder="Manual" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="manual">Manual</Select.Item>
        <Select.Item value="automatic">Automatic</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  {#if $cameraMethod === "manual"}
    <!-- Single/Bulk Upload -->
    <div class="flex flex-col sm:flex-row items-center justify-between pb-4">
      <Label class="text-left mb-2">Insert a new camera to node</Label>
      <div class="flex items-center space-x-2">
        <Label for="single" class="text-xs font-normal">Single Upload</Label>
        <Switch
          id="bulk"
          bind:checked={$isBulk}
          onCheckedChange={() => isBulk.set(!$isBulk)}
        />
        <Label for="bulk" class="text-xs font-normal">Bulk Upload</Label>
      </div>
    </div>

    <!-- Camera Name -->
    <div class="flex flex-col pb-4">
      <Label class="text-left mb-2">Camera Name</Label>
      <Input
        type="text"
        name="name"
        placeholder="Home-Garage"
        bind:value={cameraName}
      />
      <div class="text-rose-500 text-xs pt-2">
        {#if $errors.name}
          {$errors.name}
        {/if}
      </div>
    </div>

    <Tabs.Root bind:value={tabValue}>
      <Tabs.List class="grid w-full grid-cols-3">
        <Tabs.Trigger value="onvif">ONVIF</Tabs.Trigger>
        <Tabs.Trigger value="rtsp">RTSP</Tabs.Trigger>
        <Tabs.Trigger value="spectra">Custom</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="rtsp" class="p-3">
        <div class="flex flex-col pb-4">
          <Label class="text-left mb-2">Main URL</Label>
          <Input
            type="text"
            name="url"
            placeholder="rtsp://admin:password@123.123.123.123/stream/1"
            bind:value={mainUrl}
          />
          <div class="text-rose-500 text-xs pt-2">
            {#if $errors.url}
              {$errors.url}
            {/if}
          </div>
        </div>
        <div class="flex flex-col pb-4">
          <Label class="text-left mb-2">Sub URL</Label>
          <Input
            type="text"
            name="subUrl"
            placeholder="rtsp://admin:password@123.123.123.123/stream/2"
            bind:value={subUrl}
          />
          <div class="text-rose-500 text-xs pt-2">
            {#if $errors.subUrl}
              {$errors.subUrl}
            {/if}
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value="spectra" class="p-3">
        <div class="flex items-center space-x-2 pb-4 gap-x-16 w-full">
          <Label class="text-left mb-2">Select Client</Label>
          <Select.Root>
            <Select.Trigger class="w-full sm:w-1/3">
              <Select.Value placeholder="Spectra" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="spectra">Spectra</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>

        <div class="flex items-center justify-between pb-4">
          <Label>User Name</Label>
          <div class="w-[75%]">
            <Input
              type="text"
              name="userName"
              placeholder="Camera portal username"
              class=" text-xs"
              bind:value={userName}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.userName}
                {$errors.userName}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Label>Password</Label>
          <div class="w-[75%]">
            <Input
              type="password"
              name="password"
              placeholder="Camera portal password"
              class="text-xs"
              bind:value={password}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.password}
                {$errors.password}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-x-[7rem] pb-4">
          <Label>Base IP</Label>
          <div class="flex items-center space-x-4">
            <Input
              type="number"
              bind:value={ipAddress1}
              class="text-xs"
              placeholder="192"
            />
            <span>.</span>
            <Input
              type="number"
              class="text-xs"
              placeholder="168"
              bind:value={ipAddress2}
            />
            <span>.</span>
            <Input
              type="number"
              class="text-xs"
              placeholder="1"
              bind:value={ipAddress3}
            />
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Label>HTTP Port</Label>
          <div class="w-[75%]">
            <Input
              type="text"
              name="httpPort"
              placeholder="Port"
              class=" text-xs"
              bind:value={httpPort}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.httpPort}
                {$errors.httpPort}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-x-[7rem]">
          <Label class="text-left mb-2">Range</Label>
          <div class="flex items-center space-x-4">
            <div class="flex-1">
              <Label class="text-xs mb-1">Start Host</Label>
              <Input
                type="number"
                min={0}
                max={rangeEnd}
                bind:value={rangeStart}
                class="text-xs w-16"
                placeholder="Min value"
              />
            </div>
            <!-- <div class="flex items-center">
              <span class="text-sm">to</span>
            </div> -->
            <div class="flex-1">
              <Label class="text-xs mb-1">End Host</Label>
              <Input
                type="number"
                min={rangeStart}
                max={255}
                bind:value={rangeEnd}
                class="text-xs w-16"
                placeholder="Max value"
              />
            </div>
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value="onvif" class="p-3">
        <div class="flex items-center justify-between pb-4">
          <Label>User Name</Label>
          <div class="w-[75%]">
            <Input
              type="text"
              name="userName"
              placeholder="Camera portal username"
              class=" text-xs"
              bind:value={userName}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.userName}
                {$errors.userName}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Label>Password</Label>
          <div class="w-[75%]">
            <Input
              type="password"
              name="password"
              placeholder="Camera portal password"
              class="text-xs"
              bind:value={password}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.password}
                {$errors.password}
              {/if}
            </div>
          </div>
        </div>
        <div>
          <Label class="mb-3">Base IP</Label>
          <div class="flex items-center gap-3 w-full">
            <div class="flex items-center space-x-3 w-full mt-3">
              <Input
                id="ip1"
                type="text"
                bind:value={ipAddress1}
                class="text-xs"
                placeholder="192"
                on:input={(e) => handleIpInput(e, "ip2")}
                on:keydown={(e) => handleIpInput(e, "ip2")}
                maxlength="3"
              />
              <span>.</span>
              <Input
                id="ip2"
                type="text"
                class="text-xs"
                placeholder="168"
                bind:value={ipAddress2}
                on:input={(e) => handleIpInput(e, "ip3")}
                on:keydown={(e) => handleIpInput(e, "ip3")}
                maxlength="3"
              />
              <span>.</span>
              <Input
                id="ip3"
                type="text"
                class="text-xs"
                placeholder="1"
                bind:value={ipAddress3}
                on:input={(e) => handleIpInput(e, "ip4")}
                on:keydown={(e) => handleIpInput(e, "ip4")}
                maxlength="3"
              />
              <span>.</span>
              <Input
                id="ip4"
                type="text"
                class="text-xs"
                placeholder="1"
                bind:value={ipAddress4}
                maxlength="3"
              />
            </div>
          </div>
        </div>
        {#if $isBulk}
          <div class="mt-3">
            <Label class="mb-3">End IP</Label>
            <div class="flex items-center gap-3 w-full">
              <div class="flex items-center space-x-3 w-full mt-3">
                <Input
                  id="endIp1"
                  type="text"
                  bind:value={endIpAddress1}
                  class="text-xs"
                  placeholder="192"
                  on:input={(e) => handleIpInput(e, "endIp2")}
                  on:keydown={(e) => handleIpInput(e, "endIp2")}
                  maxlength="3"
                />
                <span>.</span>
                <Input
                  id="endIp2"
                  type="text"
                  class="text-xs"
                  placeholder="168"
                  bind:value={endIpAddress2}
                  on:input={(e) => handleIpInput(e, "endIp3")}
                  on:keydown={(e) => handleIpInput(e, "endIp3")}
                  maxlength="3"
                />
                <span>.</span>
                <Input
                  id="endIp3"
                  type="text"
                  class="text-xs"
                  placeholder="1"
                  bind:value={endIpAddress3}
                  on:input={(e) => handleIpInput(e, "endIp4")}
                  on:keydown={(e) => handleIpInput(e, "endIp4")}
                  maxlength="3"
                />
                <span>.</span>
                <Input
                  id="endIp4"
                  type="text"
                  class="text-xs"
                  placeholder="1"
                  bind:value={endIpAddress4}
                  maxlength="3"
                />
              </div>
            </div>
          </div>
        {/if}
        <div
          class="flex flex-col items-start justify-between pb-4 gap-y-3 mt-2"
        >
          <Label>HTTP Port</Label>
          <div class="w-full">
            <Input
              type="text"
              name="httpPort"
              placeholder="Port"
              class=" text-xs"
              bind:value={httpPort}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.httpPort}
                {$errors.httpPort}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Button
            variant="brand"
            type="button"
            class="font-semibold w-full"
            on:click={fetchONVIFCams}
          >
            {#if !fetchingCamers}
              <p>Fetch Cameras</p>
            {:else}
              <Loader2 class="animate-spin" size={14} />
              <p class="text-xs">Fetching Cameres...</p>
            {/if}
          </Button>
        </div>
        {#if onvifCamerasList.length > 0}
          <div
            class="flex flex-col items-stretch justify pb-4 gap-4 w-full h-[15rem] overflow-auto"
          >
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="w-[50px]">
                    <Checkbox
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedOnvifCameras.set(
                            onvifCamerasList.map((camera) => ({
                              ipAddress: camera.ipAddress,
                              cameraName: camera.cameraName,
                              brandName: camera.brandName,
                              hardwareId: camera.hardwareId,
                              serialNumber: camera.serialNumber,
                            }))
                          );
                          console.log($selectedOnvifCameras);
                        } else {
                          selectedOnvifCameras.set([]);
                        }
                      }}
                    />
                  </Table.Head>
                  <Table.Head>Camera Name</Table.Head>
                  <Table.Head>IP Address</Table.Head>
                  <Table.Head>Brand</Table.Head>
                  <Table.Head>Hardware ID</Table.Head>
                  <Table.Head>Serial Number</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each onvifCamerasList as camera}
                  <Table.Row>
                    <Table.Cell class="font-medium">
                      <Checkbox
                        onCheckedChange={(v) =>
                          v
                            ? selectedOnvifCameras.update((current) => [
                                ...current,
                                camera,
                              ])
                            : selectedOnvifCameras.update((current) =>
                                current.filter(
                                  (c) => c.ipAddress !== camera.ipAddress
                                )
                              )}
                        checked={$selectedOnvifCameras
                          .map((cam) => cam.ipAddress)
                          .includes(camera.ipAddress)}
                      />
                    </Table.Cell>
                    <Table.Cell>{camera.cameraName}</Table.Cell>
                    <Table.Cell>{camera.ipAddress}</Table.Cell>
                    <Table.Cell>{camera.brandName}</Table.Cell>
                    <Table.Cell>{camera.hardwareId}</Table.Cell>
                    <Table.Cell>{camera.serialNumber}</Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
            <!-- <Button
              disabled={$selectedOnvifCameras.length === 0 || gettingRtsp}
              on:click={setRtspToDb}
              class="text-end"
            >
              {#if gettingRtsp}
                <Loader2 class="animate-spin" />
                Adding...
              {:else}
                Add Cameras
              {/if}
            </Button> -->
          </div>
        {/if}
      </Tabs.Content>
    </Tabs.Root>

    <div class="flex flex-col pb-4">
      <Label class="text-left mb-2">Features</Label>
      <div class="flex flex-wrap py-4 justify-between gap-x-10 items-start">
        <div class="flex items-center gap-1">
          <Switch id="feedSaving" />
          <Label for="feedSaving" class="text-xs font-normal text-nowrap"
            >Feed Saving</Label
          >
        </div>
        <div class="flex items-center gap-1">
          <Switch id="vehicleScan" />
          <Label for="vehicleScan" class="text-xs font-normal text-nowrap"
            >Vehicle Scan</Label
          >
        </div>
        <div class="flex items-center gap-1">
          <Switch id="faceScan" />
          <Label for="faceScan" class="text-xs font-normal text-nowrap"
            >Face Scan</Label
          >
        </div>
        <div class="flex items-center gap-1 mr-6 md:mr-auto">
          <Switch id="priority" />
          <Label for="priority" class="text-xs font-normal text-nowrap"
            >Priority</Label
          >
        </div>
      </div>
      <div
        class="flex flex-col items-start justify-between md:justify-start pb-4 w-full gap-4 mt-5"
      >
        <Label class="text-left mb-2 text-nowrap">Motion Sensitivity</Label>
        <Slider value={[0]} max={255} step={1} class="text-left w-[80%]" />
      </div>
    </div>
    <div class="flex flex-col mx-auto">
      <Button variant="brand" type="submit" class="font-semibold"
        >Confirm</Button
      >
    </div>
  {:else}
    <div>
      <h4 class="mb-5">Select the cameras you want to register</h4>
      <div class="w-full">
        <div class="rounded-md border">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-[100px]"></Table.Head>
                <Table.Head>Model</Table.Head>
                <Table.Head>IP</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each $discoveryData as row, i (i)}
                <Table.Row>
                  <Table.Cell class="font-medium"
                    ><Checkbox
                      onCheckedChange={() => toggleRowSelection(row)}
                    /></Table.Cell
                  >
                  <Table.Cell>{row?.hardware}</Table.Cell>
                  <Table.Cell
                    >{row.xaddrs[0]?.split("//")[1]?.split("/")[0]}</Table.Cell
                  >
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </div>

      <div class="flex items-center justify-between py-4">
        <Label>User Name</Label>
        <div class="w-[75%]">
          <Input
            type="text"
            name="userName"
            placeholder="Camera portal username"
            class=" text-xs"
            bind:value={userName}
          />
          <div class="text-rose-500 text-xs pt-2">
            {#if $errors.userName}
              {$errors.userName}
            {/if}
          </div>
        </div>
      </div>
      <div class="flex items-center justify-between pb-4">
        <Label>Password</Label>
        <div class="w-[75%]">
          <Input
            type="password"
            name="password"
            placeholder="Camera portal password"
            class="text-xs"
            bind:value={password}
          />
          <div class="text-rose-500 text-xs pt-2">
            {#if $errors.password}
              {$errors.password}
            {/if}
          </div>
        </div>
      </div>
      <div class="flex flex-col mx-auto">
        <Button
          variant="brand"
          class="font-semibold"
          on:click={() => {
            clickedSubmit.set(true);
            addCamera().then(() => console.log("Hey"));
            console.log("Hey2");
          }}
        >
          {#if $clickedSubmit}
            <Loader2 class="animate-spin" />
            Adding...
          {:else}
            Add Cameras
          {/if}
        </Button>
      </div>
    </div>
  {/if}
</form>
