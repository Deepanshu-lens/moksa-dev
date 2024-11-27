<script lang="ts">
  import * as Card from "@/components/ui/card";
  import * as Carousel from "@/components/ui/carousel";
  import Autoplay from "embla-carousel-autoplay";

  export let event: any;
</script>

<Card.Root class="bg-[#333] text-white border-none">
  <Card.Content class="h-[80%] min-w-24 flex items-start py-1">
    <Carousel.Root
      opts={{
        align: "start",
      }}
      class="w-20"
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      <Carousel.Content class="m-0">
        {#each event?.images as galleryImage}
          <Carousel.Item class="p-0">
            <img
              class="inline-block h-16 w-32 rounded-sm ring-2 ring-black 3xl:w-16 3xl:h-16"
              src={"data:image/jpeg;base64," + galleryImage}
              alt=""
            />
          </Carousel.Item>
          <!-- <Render of={cell.render()} /> -->
        {/each}
      </Carousel.Content>
    </Carousel.Root>
    <span class="flex flex-col w-full m-3">
      <span class="font-semibold">{event.name}</span>
      <span class="2xl:text-xs text-[10px] leading-tight">
        Last Seen:
        {#if event.lastSeen.length === 0}
          Not yet
        {:else}
          {new Date(event?.lastSeen).toLocaleString()}
        {/if}
      </span>
    </span>
  </Card.Content>
</Card.Root>
