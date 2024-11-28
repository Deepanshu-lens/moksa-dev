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
  import { CloudCog } from "lucide-svelte";
  import { writable } from "svelte/store";

  export let cameraName = "";
  export let mainUrl = "";
  export let subUrl = "";
  export let doneSubmit = false;
  let cameraMethod = writable("automatic");
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
      await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/initialize`, {
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
              port: 443,
              timeout: 10000,
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
    // await fetch(`${import.meta.env.PUBLIC_ONVIF_URL}/initialize`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     name: "",
    //     hostname: ipAddress,
    //     username: userName,
    //     password: password,
    //     port: 443,
    //     timeout: 10000,
    //   }),
    // })
    //   .then(async (res) => {
    //     const data = await res.json();
    //     await streamUri(data.index);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     toast.error("Failed to add camera via ONVIF", {
    //       description: "Incompatible SOAP version",
    //     });
    //     doneSubmit = false;
    //   });
  };

  import {
    Render,
    Subscribe,
    createRender,
    createTable,
  } from "svelte-headless-table";
  import {
    addHiddenColumns,
    addPagination,
    addSelectedRows,
    addSortBy,
    addTableFilter,
  } from "svelte-headless-table/plugins";
  import { readable } from "svelte/store";
  // import Actions from "./data-table/data-table-actions.svelte";
  import DataTableCheckbox from "./data-table-checkbox.svelte";
  import * as Table from "@/components/ui/table/index";
  import { cn } from "@/lib/utils";
  import { onMount } from "svelte";
  import { getDataEntryById } from "astro:content";

  let discoveryData = writable<[]>([]);

  // let data = [
  //   {
  //     urn: "uuid:66f52bf6-dd69-4aa7-b50e-21617afcfcb5",
  //     name: "CPPLUS",
  //     hardware: "CP-UNC-DA21PL3-Y",
  //     location: "India",
  //     types: ["dn:NetworkVideoTransmitter", "tds:Device"],
  //     xaddrs: ["http://10.20.30.14/onvif/device_service"],
  //     scopes: [
  //       "onvif://www.onvif.org/location/country/India",
  //       "onvif://www.onvif.org/name/CPPLUS",
  //       "onvif://www.onvif.org/hardware/CP-UNC-DA21PL3-Y",
  //       "onvif://www.onvif.org/Profile/Streaming",
  //       "onvif://www.onvif.org/type/Network_Video_Transmitter",
  //       "onvif://www.onvif.org/extension/unique_identifier/1",
  //       "onvif://www.onvif.org/Profile/T",
  //     ],
  //   },
  //   {
  //     urn: "uuid:74f7e627-c54f-49fb-84ed-6de9b7f588a5",
  //     name: "Dahua",
  //     hardware: "DH-IPC-HDW1230T2",
  //     location: "china",
  //     types: ["dn:NetworkVideoTransmitter", "tds:Device"],
  //     xaddrs: ["http://10.20.30.11/onvif/device_service"],
  //     scopes: [
  //       "onvif://www.onvif.org/location/country/china",
  //       "onvif://www.onvif.org/name/Dahua",
  //       "onvif://www.onvif.org/hardware/DH-IPC-HDW1230T2",
  //       "onvif://www.onvif.org/Profile/Streaming",
  //       "onvif://www.onvif.org/type/Network_Video_Transmitter",
  //       "onvif://www.onvif.org/extension/unique_identifier/1",
  //       "onvif://www.onvif.org/Profile/T",
  //     ],
  //   },
  //   {
  //     urn: "uuid:801d1cdf-81f5-482c-8b0b-d4175bb79996",
  //     name: "CP PLUS",
  //     hardware: "CP-UNC-DA21PL3C-V3",
  //     location: "India",
  //     types: ["dn:NetworkVideoTransmitter", "tds:Device"],
  //     xaddrs: ["http://10.20.30.16/onvif/device_service"],
  //     scopes: [
  //       "onvif://www.onvif.org/location/country/India",
  //       "onvif://www.onvif.org/name/CP_PLUS",
  //       "onvif://www.onvif.org/hardware/CP-UNC-DA21PL3C-V3",
  //       "onvif://www.onvif.org/Profile/Streaming",
  //       "onvif://www.onvif.org/type/Network_Video_Transmitter",
  //       "onvif://www.onvif.org/extension/unique_identifier/1",
  //     ],
  //   },
  //   {
  //     urn: "uuid:ee5f9cae-3cd9-4cff-8d42-e7d129ef5489",
  //     name: "CP PLUS",
  //     hardware: "CP-UNC-DA21PL3C-V3",
  //     location: "India",
  //     types: ["dn:NetworkVideoTransmitter", "tds:Device"],
  //     xaddrs: ["http://10.20.30.15/onvif/device_service"],
  //     scopes: [
  //       "onvif://www.onvif.org/location/country/India",
  //       "onvif://www.onvif.org/name/CP_PLUS",
  //       "onvif://www.onvif.org/hardware/CP-UNC-DA21PL3C-V3",
  //       "onvif://www.onvif.org/Profile/Streaming",
  //       "onvif://www.onvif.org/type/Network_Video_Transmitter",
  //       "onvif://www.onvif.org/extension/unique_identifier/1",
  //     ],
  //   },
  //   {
  //     urn: "uuid:421ac7a7-91f8-e2c5-b5cf-eb3b46df91f8",
  //     name: "CPPlus",
  //     hardware: "CP-UNP-D2521L10-DP",
  //     location: "India",
  //     types: ["dn:NetworkVideoTransmitter", "tds:Device"],
  //     xaddrs: ["http://10.20.30.12/onvif/device_service"],
  //     scopes: [
  //       "onvif://www.onvif.org/location/country/India",
  //       "onvif://www.onvif.org/name/CPPlus",
  //       "onvif://www.onvif.org/hardware/CP-UNP-D2521L10-DP",
  //       "onvif://www.onvif.org/Profile/Streaming",
  //       "onvif://www.onvif.org/type/Network_Video_Transmitter",
  //       "onvif://www.onvif.org/extension/unique_identifier",
  //       "onvif://www.onvif.org/Profile/T",
  //     ],
  //   },
  // ];

  const selectedRows = writable([]);

  const toggleRowSelection = (row: any) => {
    row = row?.original;
    selectedRows.update((rows) =>
      rows?.includes(row) ? rows?.filter((r) => r !== row) : [...rows, row]
    );
  };

  const table = createTable(discoveryData||[], {
    sort: addSortBy({ disableMultiSort: true }),
    page: addPagination(),
    filter: addTableFilter({
      fn: ({ filterValue, value }) => value.includes(filterValue),
    }),
    select: addSelectedRows(),
    hide: addHiddenColumns(),
  });

  const columns = table.createColumns([
    table.column({
      header: (_, { pluginStates }) => {
        const { allPageRowsSelected } = pluginStates.select;
        return createRender(DataTableCheckbox, {
          checked: allPageRowsSelected,
        });
      },
      accessor: "id",
      cell: ({ row }, { pluginStates }) => {
        const { getRowState } = pluginStates.select;
        const { isSelected } = getRowState(row);

        return createRender(DataTableCheckbox, {
          checked: isSelected,
        });
      },
      plugins: {
        sort: {
          disable: true,
        },
        filter: {
          exclude: true,
        },
      },
    }),
    table.column({
      header: "Model",
      accessor: "hardware",
      plugins: { sort: { disable: true }, filter: { exclude: true } },
    }),
    table.column({
      header: "IP",
      accessor: "xaddrs",
      cell: ({ value }) => value[0]?.split("//")[1]?.split("/")[0],
      plugins: {
        filter: {},
      },
    }),
  ]);

  const {
    headerRows,
    pageRows,
    tableAttrs,
    tableBodyAttrs,
    flatColumns,
    pluginStates,
    rows,
  } = table.createViewModel(columns);

  const { hiddenColumnIds } = pluginStates.hide;
  const ids = flatColumns.map((c) => c.id);
  let hideForId = Object.fromEntries(ids.map((id) => [id, true]));

  $: $hiddenColumnIds = Object.entries(hideForId)
    .filter(([, hide]) => !hide)
    .map(([id]) => id);

  const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;

  const { selectedDataIds } = pluginStates.select;

  onMount(()=>{
    getCameraDiscoveryList();
  })

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
</script>

<form use:form class="space-y-4 mt-4 max-h-[80vh] overflow-auto p-4 rounded-md">
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
        <Tabs.Trigger value="details">Using Details</Tabs.Trigger>
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
        class="flex flex-col md:flex-row items-start md:items-center justify-between md:justify-start pb-4 w-full gap-2 md:gap-1"
      >
        <Label class="text-left mb-2 text-nowrap">Motion Sensitivity</Label>
        <Slider value={[33]} max={100} step={1} class="text-left w-full" />
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
          <Table.Root {...$tableAttrs}>
            <Table.Header>
              {#each $headerRows as headerRow}
                <Subscribe rowAttrs={headerRow.attrs()}>
                  <Table.Row>
                    {#each headerRow.cells as cell (cell.id)}
                      <Subscribe
                        attrs={cell.attrs()}
                        let:attrs
                        props={cell.props()}
                        let:props
                      >
                        <Table.Head
                          {...attrs}
                          class={cn("[&:has([role=checkbox])]:pl-3")}
                        >
                          {#if cell.id === "amount"}
                            <div class="text-right">
                              <Render of={cell.render()} />
                            </div>
                          {:else if cell.id === "email"}
                            <Button
                              variant="ghost"
                              on:click={props.sort.toggle}
                            >
                              <Render of={cell.render()} />
                            </Button>
                          {:else}
                            <Render of={cell.render()} />
                          {/if}
                        </Table.Head>
                      </Subscribe>
                    {/each}
                  </Table.Row>
                </Subscribe>
              {/each}
            </Table.Header>
            <Table.Body {...$tableBodyAttrs}>
              {#each $pageRows as row (row.id)}
                <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
                  <Table.Row
                    {...rowAttrs}
                    data-state={$selectedDataIds[row.id] && "selected"}
                    on:click={() => toggleRowSelection(row)}
                  >
                    {#each row.cells as cell (cell.id)}
                      <Subscribe attrs={cell.attrs()} let:attrs>
                        <Table.Cell
                          class="[&:has([role=checkbox])]:pl-3"
                          {...attrs}
                        >
                          {#if cell.id === "amount"}
                            <div class="text-right font-medium">
                              <Render of={cell.render()} />
                            </div>
                          {:else}
                            <Render of={cell.render()} />
                          {/if}
                        </Table.Cell>
                      </Subscribe>
                    {/each}
                  </Table.Row>
                </Subscribe>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
        <div class="flex items-center justify-end space-x-2 py-4">
          <div class="text-muted-foreground flex-1 text-sm">
            {Object.keys($selectedDataIds).length} of {$rows.length} row(s) selected.
          </div>
          <Button
            variant="outline"
            size="sm"
            on:click={() => ($pageIndex = $pageIndex - 1)}
            disabled={!$hasPreviousPage}>Previous</Button
          >
          <Button
            variant="outline"
            size="sm"
            disabled={!$hasNextPage}
            on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
          >
        </div>
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
      <div class="flex flex-col mx-auto">
        <Button
          variant="brand"
          type="submit"
          class="font-semibold"
          on:click={addCameraAutomatic}>Confirm</Button
        >
      </div>
    </div>
  {/if}
</form>
