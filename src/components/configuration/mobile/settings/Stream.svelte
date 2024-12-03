<script lan="ts">
  import { ChevronUp, Radio } from "lucide-svelte";
  export let text;
  export let selected;
  import * as Select from "@/components/ui/select";
  const streamOptions = [
    { value: "240", label: "240p" },
    { value: "360", label: "360p" },
    { value: "480", label: "480p" },
    { value: "720", label: "720p" },
    { value: "1080", label: "1080p" },
    { value: "default", label: "default" },
  ];
</script>

<div
  class="flex flex-col justify-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white"
>
  <button class="flex flex-row items-center" on:click={() => (selected = "")}>
    <Radio class="text-[#015a62] mr-4 h-[30px] w-[30px]" />
    <span class="text-[#015a62]">{text}</span>
    <ChevronUp class="h-[30px] w-[30px] ml-auto text-[#015a62]" />
  </button>
  <p class="text-black font-medium text-sm py-4 mt-2">Live mode</p>
  <div class="flex flex-col gap-1">
    <span class="flex items-center justify-between">
      <p class="text-[#505050] text-xs font-medium">no delay</p>
      <input type="radio" name="mode" />
    </span>
    <span class="flex justify-between items-center">
      <p class="text-[#505050] text-xs font-medium">Shortest delay</p>
      <input type="radio" name="mode" />
    </span>
    <span class="flex justify-between items-center">
      <p class="text-[#505050] text-xs font-medium">Best quality</p>
      <input type="radio" name="mode" />
    </span>
  </div>
  <p class="text-black font-medium text-sm py-4 mt-2">Resolution</p>

  <Select.Root portal={null}>
    <Select.Trigger class="w-[200px] text-sm ">
      <Select.Value placeholder={streamOptions[5].label} />
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>Types</Select.Label>
        {#each streamOptions as option}
          <Select.Item value={option.value} label={option.label}
            >{option.label}</Select.Item
          >
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
</div>
