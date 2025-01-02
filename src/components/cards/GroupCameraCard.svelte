<script lang='ts'>
import * as Card from "@/components/ui/card";
export let cam;
export let index: number
export let checkedCameraIds: string[]
export let nodename: string
import { Cctv, Webcam } from 'lucide-svelte'

// $: console.log($checkedCameraIds)
</script>

<Card.Root
  class="bg-[#f9f9f9] hover:scale-105 w-[210px] h-[150px] sm:scale-100 rounded-lg {$checkedCameraIds.includes(cam.id) ? 'animate-gradient-border border-4 scale-110 shadow-md' : ''}"
>
  <Card.Content class=" h-full w-full flex flex-col p-3 gap-1">
   <span class='flex items-center gap-2 w-full mb-2'>
    <span class='flex items-center justify-center p-1 size-14 flex-shrink-0 bg-[#186AFD] rounded-lg'>
        <Cctv class='size-10 text-white'/>
    </span>
<p class="text-lg font-semibold">
    {cam.name}
</p>
   </span>
   <p class='text-[#000000B2]'>Store: {nodename}</p>
   <p class='text-[#186AFD] font-medium text-lg'> {(() => {
        const splitResult = cam.url
          ?.split("@")?.[1]
          ?.split("/")?.[0]
          ?.split(":")?.[0];
        return splitResult?.length > 15
          ? splitResult.substring(0, 15) + "..."
          : splitResult;
      })()}</p>
  </Card.Content>
</Card.Root>
