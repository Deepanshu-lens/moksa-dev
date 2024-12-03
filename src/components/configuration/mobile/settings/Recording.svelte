<script lang="ts">
  import Switch from "./../../../ui/switch/switch.svelte";
  import { Disc2, ChevronUp } from "lucide-svelte";
  import * as Select from "@/components/ui/select";
  export let text;
  export let selected;

  let checked = false;

  const delayOptions = [
    { value: "no-delay", label: "No delay" },
    { value: "shortest-delay", label: "Shortest delay" },
    { value: "best-quality", label: "Best quality" },
    { value: "custom", label: "Custom" },
  ];

  const framesOptions = [
    { value: "5", label: "5 fps" },
    { value: "15", label: "15 fps" },
    { value: "20", label: "20 fps" },
    { value: "25", label: "25 fps" },
    { value: "30", label: "30 fps" },
  ];
</script>

<div
  class="flex flex-col justify-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white"
>
  <button class="flex flex-row items-center" on:click={() => (selected = "")}>
    <Disc2 class="text-[#015a62] mr-4 h-[30px] w-[30px]" />

    <span class="text-[#015a62]">{text}</span>

    <ChevronUp class="text-[#015a62] ml-auto h-[30px] w-[30px]" />
  </button>
  <div>
    <p class="text-black font-medium text-sm py-4 mt-2">
      Recording mode settings
    </p>
    <div class="flex flex-col gap-1">
      <span class="flex items-center justify-between">
        <p class="text-[#505050] text-xs font-medium">Continuous</p>
        <input type="radio" name="mode" />
      </span>
      <span class="flex justify-between items-center">
        <p class="text-[#505050] text-xs font-medium">Motion Triggered</p>
        <input type="radio" name="mode" />
      </span>
      <span class="flex justify-between items-center">
        <p class="text-[#505050] text-xs font-medium">Scheduled</p>
        <input type="radio" name="mode" />
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <p class="text-black font-medium text-sm py-2 mt-2">Recording buffer</p>
      <p class="text-[#505050] text-xs font-medium">
        Select recording buffer time
      </p>
      <Select.Root portal={null}>
        <Select.Trigger class="w-[200px] text-sm ">
          <Select.Value placeholder={delayOptions[0].label} />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Types</Select.Label>
            {#each delayOptions as option}
              <Select.Item value={option.value} label={option.label}
                >{option.label}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex flex-col gap-2">
      <p class="text-black font-medium text-sm py-2 mt-2">
        Video Quality setting
      </p>
      <p class="text-[#505050] text-xs font-medium">Select video quality</p>
      <Select.Root portal={null}>
        <Select.Trigger class="w-[200px] text-sm ">
          <Select.Value placeholder={framesOptions[0].label} />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Types</Select.Label>
            {#each framesOptions as option}
              <Select.Item value={option.value} label={option.label}
                >{option.label}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
    <p class="text-black font-medium text-sm py-2 mt-2">Audio setting</p>
    <span class="flex items-center justify-between mb-2">
      <p class="text-[#505050] text-xs font-medium">Record live sound</p>
      <!-- <ReactSwitch
      onHandleColor="#3B7C26"
      onColor={theme === "dark" ? "#242424" : "#fff"}
      offColor={theme === "dark" ? "#242424" : "#999"}
      checkedIcon={<span class="text-xs ml-2">ON</span>}
      uncheckedIcon={<span class="text-xs ml-1">OFF</span>}
      height={26}
      onChange={() => setChecked(!checked)}
      checked={checked}
      /> -->
      <Switch bind:checked class="scale-110" />
    </span>
  </div>
</div>
