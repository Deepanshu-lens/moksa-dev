<script lang="ts">
    import { QrCode } from "lucide-svelte";

</script>

<div
  class="bg-transparent rounded-lg flex border scale-100 w-max min-w-[300px] h-[120px] cardShad relative px-2"
>
<span class='w-2/3 border-r border-dashed border-[#727272] relative p-2 h-full flex flex-col gap-1'>
<p class='text-sm text-[#2C2C2C] font-semibold'>VIP Pass</p>
<p class='text-xs text-[#2C2C2C] font-medium'>No. of Passes: <span class='text-[#727272] font-normal'>
    02
</span></p>
<p class='font-medium text-[#2C2C2C] text-xs'>Timings: <span class='text-[#727272] font-normal'>
    10:00 AM - 3:00 PM
</span></p>
<p class='absolute text-sm text-white font-medium left-0 bottom-0 rounded-tr-lg rounded-bl-lg bg-[#015a62] p-2'>₹ 400</p>
<p class='text-[8px] text-[#727272] absolute right-1 bottom-1'>
01 July, 09:41 AM
</p>
</span>
<span class='w-1/3 flex items-center justify-center flex-col gap-1 h-full'>
<QrCode size={40}/>
<p class='text-xs text-[#727272]'>
    QR002
</p>
</span>
<span class='bg-[#E8E8E8] size-[10px] absolute top-1/2 left-0 rounded-r-full  -translate-y-1/2'/>
<span class='bg-[#E8E8E8] size-[10px] absolute top-1/2 right-0 rounded-l-full  -translate-y-1/2'/>


</div>

<style>

    .cardShad {
        box-shadow: 0px -1px 11.4px 0px #00000017;
        
    }
    </style>