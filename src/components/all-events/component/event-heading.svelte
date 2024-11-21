<script lang="ts">
    export let color: string;
    export let heading: string;
    //expiry and start date 
    export let start: string | Date = new Date().toLocaleDateString();
    export let end: string | Date = new Date().toLocaleDateString();
    import { mode } from "mode-watcher";
  </script>
  
  <div
    class={`relative h-[65px] bg-[#F2F2F2] dark:bg-[#333] w-full py-2 px-6 ${$mode === "dark" ? "pointy-dark" : "pointy-right"}`}
  >
    <span
      class={`absolute left-0 top-0 w-1 h-full`}
      style="background-color: {color}"
    >
    </span>
    <p class="text-[#2c2c2c] dark:text-slate-200 font-bold">{heading}</p>
    <p class="text-[#727272] dark:text-slate-400 text-sm font-medium">
      {start} - 24 Hrs
    </p>
  </div>
  
  <style>
    .pointy-right {
      position: relative;
    }
  
    .pointy-right::after {
      content: "";
      position: absolute;
      right: -15px;
      top: 50%;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 33px 0 33px 15px;
      border-color: transparent transparent transparent #f2f2f2;
      transform: translateY(-50%);
    }
  
    .pointy-dark {
      position: relative;
    }
  
    .pointy-dark::after {
      content: "";
      position: absolute;
      right: -15px;
      top: 50%;
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 33px 0 33px 15px;
      border-color: transparent transparent transparent #333;
      transform: translateY(-50%);
    }
  </style>
  