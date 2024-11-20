<script lang="ts">
  import * as Card from "@/components/ui/card";
  export let color;
  export let status;
  export let checkIn;
  export let checkOut;
  export let checkInImage;
  export let checkOutImage;
</script>

<Card.Root
  class="bg-[#f9f9f9]  dark:bg-[#333] w-[335px] h-[175px] attendance-cardshad "
>
  <Card.Content class=" h-full w-full flex flex-col p-3 relative">
    <span class='w-[3px] h-full rounded-l-lg absolute left-0 top-0 bg-[#4976F4]'/>
    <span class="flex items-center justify-between">
        <p class='text-[#4F4F4F] font-medium'>
            Wed, Jun 01, 2024
        </p>
        <span class={`text-[${color}] bg-[${color}] bg-opacity-10 px-2 rounded-sm text-sm font-medium py-.5`}>
{status}
        </span>
    </span>

    <span class="flex items-center gap-2.5 mt-6">
<img src={'data:image/jpeg;base64,' + checkInImage} alt="photu" class='size-[50px] rounded-md'>
<span>
    <p class='text-[#00000099] font-medium text-xs'>
        Check In
    </p>
    <p class='text-black font-medium text-sm'>{checkIn}</p>
</span>
<img src={'data:image/jpeg;base64,' + checkOutImage} alt="photu" class='size-[50px] rounded-md'>
<span>
    <p class='text-[#00000099] font-medium text-xs'>
        Check Out
    </p>
    <p class='text-black font-medium text-sm'>{checkOut}</p></span>
<span>
    <p class='text-[#00000099] font-medium text-sm'>
        Total
    </p>
    <p class='text-black font-medium '>8hr</p></span>
    </span>

    <span class='w-full border-t mt-3 border-[#00000052]'>
        <p class='text-sm pt-2 text-[#00000099]'>
            Notes:
        </p>
    </span>
  </Card.Content>
</Card.Root>



<style>
    .shad{
        box-shadow: 0px 3.28px 5.33px 0px #00000017;
    }

</style>