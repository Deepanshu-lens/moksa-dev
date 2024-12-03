<script lang="ts">
  import {
    Camera,
    Cast,
    Disc2,
    Radio,
    User,
    Router,
    ChevronUp,
  } from "lucide-svelte";

  export let selected;
  export let text: string;
</script>

<div
  class="flex flex-col items-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white"
>
  <button
    class="flex flex-row w-full items-center"
    on:click={() => (selected = "")}
  >
    <Router class="text-[#015a62] mr-4" />
    <span class="text-[#015a62]">{text}</span>
    <ChevronUp class="h-[30px] w-[30px] ml-auto text-[#015a62]" />
  </button>
  <div class="flex flex-col items-center gap-2 my-4">
    <span class="flex flex-col justify-center">
      <img
        src="/images/error.png"
        alt="err"
        class=" aspect-square h-[45px] w-[45px] flex-shrink-0"
      />
      <span class="text-base font-semibold text-center text-black">
        Error
      </span>
    </span>
    <p class="text-black/[.7] font-xs font-medium text-center">
      No Internet connectivity found. This setup is remote incompatible.
    </p>
  </div>
</div>
