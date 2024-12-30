<script lang="ts">
  import { cn } from "@/lib/utils";
  import { MoreVertical } from "lucide-svelte";
  export let event: any;
</script>

<div
  class="bg-transparent rounded-md p-2 flex flex-col gap-3 border border-[#e4e4e4] dark:border-[#333] scale-100 w-full"
>
  <p class="text-sm font-semibold hover:underline cursor-pointer">
    {event.title}
  </p>
  <p class="text-xs text-[#727272] dark:text-slate-300">
    {new Date(event.created).toLocaleString()}
  </p>
  <div class="flex items-center justify-between">
    <img
      class={cn(
        `inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-black`
      )}
      src={"data:image/jpeg;base64," + event.frameImage}
      alt="thumbnail"
    />
    <!-- <button class="text-[#015a62] dark:text-[#258d9d] text-xs font-medium"
        >View Details</button
      > -->
  </div>
  <MoreVertical class="absolute top-2 right-2 text-black h-5 w-5" />
</div>
