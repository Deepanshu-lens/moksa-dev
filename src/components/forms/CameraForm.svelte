<script lang="ts">
  import * as Select from "@/components/ui/select";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import * as Tabs from "@/components/ui/tabs";
  import { Slider } from "@/components/ui/slider";
  import { cameraSchema } from "@/types";

  import pb from "@/lib/pb";
  import { selectedNode } from "@/stores";

  import { createForm } from "felte";
  import { validator } from "@felte/validator-zod";
  import { toast } from "svelte-sonner";

  export let cameraName = "";
  export let mainUrl = "";
  export let subUrl = "";
  export let doneSubmit = false;
  let userName = "";
  let password = "";
  let ipAddress = "";
  let httpPort = "";
  let tabValue = "url";
  let BASE_URI = "https://vms.lenscorp.cloud/onvif";

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
    },
    onError: (err: any) => {
      console.error("Form validation failed:", err);
    },
  });

  const streamUri = async (index: any) => {
    const res = await fetch(`${BASE_URI}/stream-uri/${index}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    console.log(tabValue, "tabValue");
    if (tabValue === "url") {
      console.log("URL tab api called");
      try {
        const data = {
          name: cameraName,
          url: mainUrl,
          subUrl,
          node: $selectedNode,
          save: true,
        };

        const record = await pb.collection("camera").create(data);
        console.log("Camera added:", record);
        doneSubmit = true;
      } catch (error) {
        console.error("Failed to add camera:", error);
      }
    } else {
      console.log("Details tab api called");
      await fetch(`${BASE_URI}/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cameraName,
          hostname: ipAddress,
          username: userName,
          password: password,
          port: Number(httpPort),
          timeout: 10000,
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          await streamUri(data.index);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to add camera via ONVIF", {
            description: "Incompatible SOAP version",
          });
          doneSubmit = false;
        });
    }
  };
</script>

<form use:form class="space-y-4 mt-4 max-h-[80vh] overflow-auto p-4 rounded-md">
  <!-- Manual/Automatic Mode -->
  <div
    class="flex flex-col sm:flex-row items-center justify-between border-b pb-8"
  >
    <Label class="text-left mb-2">Select method of adding camera</Label>
    <Select.Root>
      <Select.Trigger class="w-full sm:w-1/3">
        <Select.Value placeholder="Manual" />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="manual">Manual</Select.Item>
        <Select.Item value="automatic">Automatic</Select.Item>
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Single/Bulk Upload -->
  <div class="flex flex-col sm:flex-row items-center justify-between pb-4">
    <Label class="text-left mb-2">Insert a new camera to node</Label>
    <div class="flex items-center space-x-2">
      <Label for="single" class="text-xs font-normal">Single Upload</Label>
      <Switch id="bulk" />
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
    <Tabs.List class="grid w-full grid-cols-2">
      <Tabs.Trigger value="url">Using URL</Tabs.Trigger>
      <Tabs.Trigger value="details" disabled>Using Details</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="url" class="py-2">
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
    <Tabs.Content value="details">
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
      <div class="flex items-center justify-between pb-4">
        <Label>IP Address</Label>
        <div class="w-[75%]">
          <Input
            type="text"
            name="ipAddress"
            placeholder="IP associated with camera"
            class="text-xs"
            bind:value={ipAddress}
          />
          <div class="text-rose-500 text-xs pt-2">
            {#if $errors.ipAddress}
              {$errors.ipAddress}
            {/if}
          </div>
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
      <div class="flex items-center space-x-1">
        <Label for="ssl" class="text-xs font-normal w-[25%]">SSL</Label>
        <Switch id="ssl" />
      </div>
    </Tabs.Content>
  </Tabs.Root>

  <div class="flex flex-col pb-4">
    <Label class="text-left mb-2">Features</Label>
    <div class="flex flex-wrap py-4 justify-between items-start gap-2">
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
        <Label for="faceScan" class="text-xs font-normal text-nowrap">Face Scan</Label>
      </div>
      <div class="flex items-center gap-1 mr-6 md:mr-auto">
        <Switch id="priority" />
        <Label for="priority" class="text-xs font-normal text-nowrap"
          >Priority</Label
        >
      </div>
    </div>
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-start pb-4 w-full gap-2 md:gap-1">
      <Label class="text-left mb-2 text-nowrap">Motion Sensitivity</Label>
      <Slider value={[33]} max={100} step={1} class="text-left w-full"/>
    </div>
  </div>

  <div class="flex flex-col mx-auto">
    <Button variant="brand" type="submit" class="font-semibold">
      Confirm
    </Button>
  </div>
</form>
