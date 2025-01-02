<script lang='ts'>
import * as Card from "@/components/ui/card";
export let node;
export let index: number
export let checkedIndices: number[]
import { Webcam } from 'lucide-svelte'
</script>

<Card.Root
  class="bg-[#f9f9f9] hover:scale-105 max-w-[250px] min-w-[220px] h-max  sm:scale-100 rounded-2xl {$checkedIndices.includes(index) ? 'animate-gradient-border border-4 scale-110 shadow-md' : 'border-black/[.18] border-solid border-[1px]'}"
>
  <Card.Content class=" h-full w-full flex items-start p-0 gap-4">
    <span class="flex flex-col gap-1.5 w-full ">
        <img src="/images/nodecard.png" alt="cardnodeimg" class='w-full h-[85px] rounded-t-xl'>
        <div class='p-4 pt-2 flex flex-col gap-2'>
            <span class="font-semibold text-lg">{node.name}</span>
            <span class='flex items-center text-[#434343] gap-2'>
                <Webcam class='size-4'/>
                <p class='text-[#434343] text-sm flex items-center gap-2'>
                    No. of Cameras <span class='text-[#00A569] font-semibold'>
                        {node.camera.length}
                    </span>
                </p>
            </span>
        </div>
    </span>
  </Card.Content>
</Card.Root>
