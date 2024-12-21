<script lang="ts">
  import pb from "@/lib/pb";
  import { selectedNode } from "@/stores";
  import * as Dialog from "@/components/ui/dialog";
  import * as Popover from "@/components/ui/popover";
  import { Button } from "@/components/ui/button";
  import AddCameraForm from "@/components/forms/CameraForm.svelte";

  import { Input } from "@/components/ui/input";
  import * as AlertDialog from "@/components/ui/alert-dialog";
  import { Label } from "@/components/ui/label";
  import { cameraSchema } from "@/types";
  import * as Select from "@/components/ui/select";

  import { createForm } from "felte";

  // start
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import { toast } from "svelte-sonner";
  import { Dot, Minus, Plus, X } from "lucide-svelte";
  import Slider from "@/components/ui/slider/slider.svelte";
  import CameraSettingModal from "@/components/ui/modal/CameraSettingModal.svelte";
  let index = writable(null);
  let status = writable(null);
  let presets = writable([]);
  let zoomSpeed = writable("");
  let isPtzOpen = writable(false);

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
  // end

  export let action: "add" | "edit" | "delete" | "ptz" | "settings";
  export let camera;

  let modalOpen = writable(false);
  let ptzControl = writable("");
  let openPTZ = writable(false);
  let cameraName = writable(camera ? camera.name : "");
  let mainUrl = camera ? camera.url : "";
  let subUrl = camera ? camera.subUrl : "";
  let doneSubmit = false;

  let username = $ptzControl.url?.split("rtsp://")?.[1]?.split(":")?.[0];
  let pass = $ptzControl.url?.split(":")?.[2]?.split("@")?.[0];
  let ip = $ptzControl.url?.split("@")?.[1]?.split("/")?.[0]?.split(":")?.[0];
  let dbPresets = $ptzControl.preset;
  let lastCords = $ptzControl.lastCords;

  const { form, errors, reset, isSubmitting } = createForm({
    initialValues: { name: $cameraName, url: mainUrl, subUrl: subUrl },
    // extend: validator({ schema: cameraSchema.schema.omit({ id: true }) }),
    onSubmit: async (values) => {
      console.log(cameraSchema.schema.omit({ id: true }).safeParse(values));
      console.log("Form submitted with:", values);
      const data = {
        name: $cameraName,
        url: mainUrl,
        subUrl,
        motionSensitivity: 33, // Example value
        node: $selectedNode,
      };

      // Push the data to Pocketbase (to the 'cameras' collection, for example)
      const record = await pb.collection("camera").update(camera.id, data);
      modalOpen.set(false);
      const streamElement = document.getElementById(`stream-${camera.id}`);
      if (streamElement) {
        streamElement.setAttribute(
          "data-url",
          `
wss://view.lenscorp.cloud/api/ws?src=${camera.id}`
        );
      }
    },
    onError: (err) => {
      console.error("Form validation failed:", err);
    },
  });

  const deleteCamera = async () => {
    const record = await pb.collection("camera").delete(camera.id);
  };

  $: {
    if ($modalOpen && camera) {
      cameraName.set(camera?.name || "");
    }
  }

  $: {
    if (doneSubmit) {
      modalOpen.set(false);
      doneSubmit = false;
    }
  }
</script>

{#if action === "add"}
  <Dialog.Root bind:open={$modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content class="!w-2/3 h-92">
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4">Add Camera</Dialog.Title>
      </Dialog.Header>
      <AddCameraForm
        bind:$cameraName
        bind:mainUrl
        bind:subUrl
        bind:doneSubmit
        modalOpen={$modalOpen}
      />
    </Dialog.Content>
  </Dialog.Root>
{:else if action === "edit"}
  <Dialog.Root bind:open={$modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content class="lg:!w-1/2 xl:!w-1/3">
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4">Edit Camera</Dialog.Title>
      </Dialog.Header>
      <form use:form class="space-y-4 mt-4">
        <div class="flex items-center justify-between pb-4">
          <Label>Camera Name</Label>
          <div class="w-full">
            <Input
              type="text"
              name="name"
              placeholder="Home-Garage"
              class=""
              bind:value={$cameraName}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.name}
                {$errors.name}
              {/if}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pb-4">
          <Label>Main URL</Label>
          <div class="w-full">
            <Input
              type="text"
              name="url"
              placeholder="rtsp://admin:password@123.123.123.123/stream/1"
              class="text-xs"
              bind:value={mainUrl}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.url}
                {$errors.url}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pb-4">
          <Label>Sub URL</Label>
          <div class="w-full">
            <Input
              type="text"
              name="subUrl"
              placeholder="rtsp://admin:password@123.123.123.123/stream/2"
              class=" text-xs"
              bind:value={subUrl}
            />
            <div class="text-rose-500 text-xs pt-2">
              {#if $errors.subUrl}
                {$errors.subUrl}
              {/if}
            </div>
          </div>
        </div>
        <div class="flex flex-1 flex-col mx-auto">
          <Button type="submit" variant="brand">Confirm</Button>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{:else if action === "ptz"}
  <Popover.Root bind:open={$isPtzOpen}>
    <Popover.Trigger asChild let:builder>
      <Button
        on:click={() => ptzControl.set(camera)}
        builders={[builder]}
        variant="outline"
        size="sm"
        class="text-xs">Ptz</Button
      >
    </Popover.Trigger>
    <Popover.Content class="w-80 p-0" alignOffset={200}>
      <article
        class="w-full h-full bg-gradient-to-b pb-4 from-[#000000]/60 via-[#000000]/75 to-[#000000]/100"
      >
        <span
          class="bg-black text-white flex px-1 items-center justify-between"
        >
          <p class="text-white font-semibold">PTZ Control</p>
          <button
            on:click={() => {
              ptzControl.set("");
              openPTZ.set(false);
            }}
          >
            <X onclick={() => isPtzOpen.set(false)} />
          </button>
        </span>
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
          <p class="text-sm text-[#202020]">Presets</p>
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
      </article>
    </Popover.Content>
  </Popover.Root>
{:else if action === "settings"}
  <CameraSettingModal {camera}>
    <slot />
  </CameraSettingModal>
{:else}
  <AlertDialog.Root>
    <AlertDialog.Trigger><slot /></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          Deleting a camera cannot be undone. This will permanently delete your
          camera from our servers.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          on:click={deleteCamera}
          class="bg-rose-500 text-white">Delete</AlertDialog.Action
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}
