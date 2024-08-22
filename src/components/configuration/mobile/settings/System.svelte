<script lang="ts">
  import { Cast, ChevronUp } from "lucide-svelte";

  export let selected;
  export let text;
</script>

<div
  class="flex flex-col justify-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white"
>
  <button class="flex flex-row items-center" on:click={() => (selected = "")}>
    <Cast class="text-[#015a62] mr-4 h-[30px] w-[30px]" />
    <span class="text-[#015a62]">{text}</span>
    <ChevronUp class="h-[30px] w-[30px] ml-auto text-[#015a62]" />
  </button>
  <div>
    <p class="text-black font-medium text-sm py-4 my-2">Maintenance settings</p>
    <span class="flex flex-row items-center justify-between">
      <p class="text-black/[.7] text-xs font-medium">Firmware Update</p>
      <span class="flex items-center gap-2">
        <button
          class="py-1 px-3 bg-[#d9d9d9] text-[#505050] rounded-[4px] text-xs font-semibold w-[75px]"
        >
          Browse
        </button>
        <button
          class="py-1 px-3 bg-white text-[#505050] font-semibold rounded-[4px] text-xs border-[1px] border-solid border-[#d9d9d9] w-[75px]"
        >
          Upgrade
        </button>
      </span>
    </span>
    <p class="text-xs text-[#979797] w-[320px] pt-4">
      <span class="text-xs text-[#505050] font-medium">Note: </span> The upgrading
      process will be 1 to 10 minutes, please don't disconnect power to the device
      during the process
    </p>
    <p class="text-black font-medium text-sm py-4 my-2">Diagnostics</p>
    <p class="text-black font-medium text-sm py-4 my-2">System Logs</p>
    <p class="text-black font-medium text-sm py-4 my-2">Reboot</p>
    <span class="flex items-center justify-between">
      <p class="text-sm text-[#505050]">Reboot the device</p>
      <button
        class="py-1 px-3 bg-[#d9d9d9] text-[#505050] rounded-[4px] text-xs font-semibold w-[75px]"
      >
        Reboot
      </button>
    </span>
  </div>
</div>
