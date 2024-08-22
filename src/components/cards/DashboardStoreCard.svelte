<script lang="ts">
    import { Store } from "lucide-svelte";
    import { mode } from "mode-watcher";

  export let storeName: string;
  export let cameraCount: number;
  export let managerName: string;
  export let activeCount;
  export let totalCount;
  export let bgColor: string;

  $: percentageActive = totalCount === 0 ? 0 : Math.round((parseInt(activeCount) / parseInt(totalCount)) * 100);
  console.log(totalCount)
</script>

    <!-- <div class="camera-count">
      <span class="count">{cameraCount}</span>
      <span class="label">Cameras :</span>
    </div> -->
<div class="flex items-center justify-between w-full p-4 h-[75px]" style={$mode !== "dark" ? `background-color: ${bgColor};` : ""}>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
<Store size={18}/>
      <div class="font-semibold text-xs">{storeName.length > 12 ? storeName.slice(0, 12) + '...' : storeName}</div>
    </div>
    <div class="flex items-center gap-2">
      <div class=" bg-[#4caf50] h-2 rounded-md w-[25px] flex-shrink-0 flex "/>
      <span class="text-sm">{percentageActive}%</span>
      <span class="text-sm font-semibold">{totalCount}</span>
    </div>
  </div>
  <div class='flex-col items-center justify-center flex gap-1'>
    <span class="flex items-center gap-2 bg-[#FAAD14] rounded-lg px-1 py-.5">
    <span class="text-white text-xs">Cameras:</span>
    <span class="font-medium text-white text-sm">{cameraCount}</span>
</span>
    <span class="text-xs text-[#727272]">Manager</span> 
    <span class=" text-[#323232] font-semibold text-xs">{managerName.length > 12 ? managerName.slice(0, 12) + '...' : managerName}</span>
  </div>
  <!-- <div class="right-section"> -->
   
    <div class="circle-progress">
      <svg viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#FF007A"
          stroke-width="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#FFF900"
          stroke-width="3"
          stroke-dasharray="{parseInt(activeCount) / parseInt(totalCount) * 100}, 100"
        />
      </svg>
      <span class="progress-text">{parseInt(activeCount)}/{parseInt(totalCount)}%</span>
    </div>
  <!-- </div> -->
</div>

<style>

  .circle-progress {
    position: relative;
    width: 60px;
    height: 60px;
  }

  svg {
    transform: rotate(-90deg);
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.8rem;
    font-weight: bold;
  }
</style>