<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { Button } from "../ui/button";
  export let seen;
  export let title;
  export let time;
  export let description;
  export let actions;

</script>

<Card.Root
  class={`border ${seen ? "bg-[#FAFAFA]" : "bg-[#3D81FC1A]"} rounded-md min-h-[100px]  w-full`}
>
  <Card.Content class="p-2 w-full flex items-start gap-4">
    <span class="flex items-center gap-1 flex-shrink-0">
      {#if !seen}
        <span class="flex-shrink-0 size-1 bg-red-500 rounded-full" />{/if}
        <span class='grid place-items-center bg-[#050F41] rounded-md'>
            <img
            src="/images/notification.png"
            alt="notification-thumbnail"
            class="size-[32px] flex-shrink-0 mt-1 object-contain"
            />
        </span>
    </span>
    <span class="flex flex-col gap-2 w-full">
      <span class="flex items-center justify-between"
        ><h2 class="font-medium text-black">{title}</h2>
        <p class="text-[#686868] text-xs mr-1">{time}</p></span
      >
      <p class="text-[#686868] text-xs">{description}</p>
      {#if actions}
      <span class='flex items-center gap-1'>
          <Button class="scale-90 bg-[#3D81FC] text-white" size="sm">Confirm</Button>
          <Button class="scale-90" variant="outline" size="sm">Reject</Button>
        </span>
      {/if}
    </span>
  </Card.Content>
</Card.Root>
