<script lang="ts">
  import { Dot, Minus, Plus, X } from "lucide-svelte";
    import { Slider } from "../ui/slider";
  import * as Select from "@/components/ui/select/index.js";
  export let ptzControl;

      const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes" },
    { value: "pineapple", label: "Pineapple" }
  ];
</script>

<article class='absolute z-20 bottom-0 w-full left-0 h-[300px] bg-gradient-to-b pb-4 from-[#E9EAEC] via-[#D5D6D9] via-[#D5D6D8] to-[#959699]'>
  <span class="bg-black text-white flex px-1 items-center justify-between ">
    <p class='text-white font-semibold'>PTZ Control</p>
    <button on:click={() => ptzControl.set('')}>
      <X />
    </button>
  </span>
  <div class='flex items-center justify-evenly mt-6'>
    <span class='flex flex-col items-center justify-center gap-2'>

        <span class='h-[75px] w-[35px] p-2 rounded-2xl bg-[#202020] interior text-white flex flex-col items-center justify-between'>
            <button><Plus size=16/></button>
            <button><Minus size=16/></button>
        </span>
        <p class='text-sm'>Focus</p>
    </span>
    <span>
        <span class='size-[120px] p-2 rounded-full bg-gradient-to-b from-[#202020] to-[#141414] text-white flex flex-col items-center justify-center relative'>
<span class='size-[80px] rounded-full bg-gradient-to-b from-[#202020] to-[#141414] text-white border border-solid border-black relative'>
<button class='absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
    <Plus size=20/>
</button>
</span>

<button class='absolute text-white top-1/2 left-1 -translate-y-1/2'>
    <Dot size=20/>
</button>
<button class='absolute text-white top-1 left-1/2 -translate-x-1/2'>
    <Dot size=20/>
</button>
<button class='absolute text-white top-1/2 right-1 -translate-y-1/2'>
    <Dot size=20/>
</button>
<button class='absolute text-white bottom-1 right-1/2 translate-x-1/2'>
    <Dot size=20/>
</button>

        </span>
    </span>
    <span class='flex flex-col items-center justify-center gap-2'>
        <span class='h-[75px] w-[35px] p-2 rounded-2xl bg-[#202020] text-white flex flex-col items-center justify-between'>
            <button><Plus size=16/></button>
            <button><Minus size=16/></button>
        </span>
        <p class='text-sm'>Zoom</p>
    </span>

  </div>
  <div class='flex flex-col items-start justify-center gap-2 my-2 px-4'>
    <p class='text-sm text-[#202020]'>Camera speed</p>
    <Slider class='w-full' bg='bg-[#181818]' rangeBg='bg-[red]' />
  </div>
  <div class='flex flex-col items-start justify-center gap-1 my-2 px-4'>
    <p class='text-sm text-[#202020]'>Presets</p>
<Select.Root portal={null}>
  <Select.Trigger class="w-full bg-[#202020] text-white">
    <Select.Value placeholder="Select a Preset" />
  </Select.Trigger>
  <Select.Content class='bg-[#202020]'>
    <Select.Group>
      <Select.Label class='text-white'>Presets</Select.Label>
      {#each fruits as fruit}
        <Select.Item class='text-white' value={fruit.value} label={fruit.label}
          >{fruit.label}</Select.Item
        >
      {/each}
    </Select.Group>
  </Select.Content>
  <Select.Input name="favoriteFruit" />
</Select.Root>
  </div>
</article>


<style>
    .interior {
        box-shadow: 0px 0px 0.22px 0px #000000E5 inset;
box-shadow: 0px -0.22px 0.22px 0px #FFFFFF2B inset;
box-shadow: 0px 0.45px 0.22px 0px #FFFFFF73;
box-shadow: 0px -0.45px 0.45px 0px #FFFFFF26;

    }
    /* .exterior {

    } */
</style>

