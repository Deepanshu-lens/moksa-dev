<script lang="ts">
  import { Dot, Minus, Plus, X } from "lucide-svelte";
  import { Slider } from "../ui/slider";
  import * as Select from "@/components/ui/select/index.js";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";
  import * as Tooltip from "@/components/ui/tooltip";
  import Button from "../ui/button/button.svelte";
    import { toast } from "svelte-sonner";
  export let ptzControl;

  let id = $ptzControl.id;
  let url = $ptzControl.url;
  let username = $ptzControl.url?.split("rtsp://")?.[1]?.split(":")?.[0];
  let pass = $ptzControl.url?.split(":")?.[2]?.split("@")?.[0];
  let ip = $ptzControl.url?.split("@")?.[1]?.split("/")?.[0]?.split(":")?.[0];
  let dbPresets = $ptzControl.preset;
  let lastCords = $ptzControl.lastCords;
  let index = writable(null);
  let status = writable(null);
  let presets = writable([]);

  onMount(async () => {
    await fetch("http://localhost:3000/onvif/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostname: ip,
        username: username,
        password: pass,
        port: 80,
        timeout: 1000,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        index.set(data.index);
        await getStatus();
        await getPresets();
      })
      .catch((err) => console.log(err));
  });

  async function getStatus() {
    await fetch(`http://localhost:3000/onvif/status/${$index}`, {
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
    await fetch(`http://localhost:3000/onvif/presets/${$index}`, {
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
    await fetch(`http://localhost:3000/onvif/set-preset/${$index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        presetName: `Preset ${$presets.length}`,
        // presetToken: `Preset ${$presets.length}`
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
        await getPresets();
        toast.success(`Preset Saved Successfully!`)
      })
      .catch((err) => console.log(err));
  }
  async function move(move: string, zoomValue: number) {
    console.log(zoomValue);
    console.log($status.position.zoom);
    await fetch(`http://localhost:3000/onvif/relative-move/${$index}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        x: move === "left" ? -0.2 : move === "right" ? 0.2 : 0,
        y: move === "up" ? 0.2 : move === "down" ? -0.2 : 0,
        zoom: zoomValue === undefined ? $status.position.zoom : zoomValue,
        speed: {
          x: 1,
          y: 1,
          zoom: 0,
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
    await fetch(`http://localhost:3000/onvif/goto-preset/${$index}`,{
      method: 'POST', headers: {
        'Content-type': 'application/json'
      }, body: JSON.stringify({
        preset:preset.token
      })
    }).then(async(res) => {const data = await res.json()
      console.log(data)
      toast.success(`Moved to preset: ${preset.name}`)
    }).catch((err) => console.log(err))
  }

  onDestroy(async () => {
    console.log("stop called");
    await fetch(`http://localhost:3000/onvif/stop/${index}`, {
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

<article
  class="absolute z-20 bottom-0 w-full left-0 h-[300px] bg-gradient-to-b pb-4 from-[#E9EAEC] via-[#D5D6D9] via-[#D5D6D8] to-[#959699]"
>
  <span class="bg-black text-white flex px-1 items-center justify-between">
    <p class="text-white font-semibold">PTZ Control</p>
    <button on:click={() => ptzControl.set("")}>
      <X />
    </button>
  </span>
  <div class="flex items-center justify-evenly mt-6">
    <span class="flex flex-col items-center justify-center gap-2">
      <span
        class="h-[75px] w-[35px] p-2 rounded-2xl bg-[#202020] interior text-white flex flex-col items-center justify-between"
      >
        <button disabled class="disabled:cursor-not-allowed"
          ><Plus size="16" /></button
        >
        <button disabled class="disabled:cursor-not-allowed"
          ><Minus size="16" /></button
        >
      </span>
      <p class="text-sm">Focus</p>
    </span>
    <span>
      <span
        class="size-[120px] p-2 rounded-full bg-gradient-to-b from-[#202020] to-[#141414] text-white flex flex-col items-center justify-center relative"
      >
        <span
          class="size-[80px] rounded-full bg-gradient-to-b from-[#202020] to-[#141414] text-white border border-solid border-black relative"
        >
          <Tooltip.Root>
            <Tooltip.Trigger asChild let:builder>
              <Button
                on:click={() => setPreset()}
                class="absolute text-white bg-gradient-to-b from-[#202020] to-[#141414] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Plus size="20" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Add Preset</p>
            </Tooltip.Content>
          </Tooltip.Root>
        </span>

        <button
          class="absolute text-white top-1/2 left-1 -translate-y-1/2"
          on:click={() => move("left")}
        >
          <Dot size="20" />
        </button>
        <button
          class="absolute text-white top-1 left-1/2 -translate-x-1/2"
          on:click={() => move("up")}
        >
          <Dot size="20" />
        </button>
        <button
          class="absolute text-white top-1/2 right-1 -translate-y-1/2"
          on:click={() => move("right")}
        >
          <Dot size="20" />
        </button>
        <button
          class="absolute text-white bottom-1 right-1/2 translate-x-1/2"
          on:click={() => move("down")}
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
        <button on:click={() => move("", -0.1)}><Minus size="16" /></button>
      </span>
      <p class="text-sm">Zoom</p>
    </span>
  </div>
  <div class="flex flex-col items-start justify-center gap-2 my-2 px-4">
    <p class="text-sm text-[#202020]">Camera speed</p>
    <Slider class="w-full" bg="bg-[#181818]" rangeBg="bg-[red]" />
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
                value={preset.token}
                label={preset.name}>{preset.name}</Select.Item
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

<style>
  .interior {
    box-shadow: 0px 0px 0.22px 0px #000000e5 inset;
    box-shadow: 0px -0.22px 0.22px 0px #ffffff2b inset;
    box-shadow: 0px 0.45px 0.22px 0px #ffffff73;
    box-shadow: 0px -0.45px 0.45px 0px #ffffff26;
  }
</style>
