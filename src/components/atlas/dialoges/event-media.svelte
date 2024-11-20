<script lang="ts">
    import * as Dialog from "@/components/ui/dialog";
    import { Dialog as DialogPrimitive } from "bits-ui";
    import { X } from "lucide-svelte";
  
    let dialogOpen: boolean = false;
  
    export let imageUrls: string[] = [];
    export let videoPath: string;
  
    let view = "images";
  </script>
  
  <Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content
     class="sm:max-w-[720px] max-h-[650px] z-[70] scale-90 sm:scale-100 p-0"
      closeButton={false}
      roundedLarge={true}
    >
      <Dialog.Header>
        <div class="h-4 w-full bg-brand rounded-t-3xl"></div>
        <Dialog.Title class="flex justify-between w-full items-center px-6 pt-4"
          >Event Media
          <DialogPrimitive.Close
            class="rounded-full p-1 bg-gray-300 dark:bg-gray-800"
          >
            <X class="size-5 font-thin" />
          </DialogPrimitive.Close>
        </Dialog.Title>
      </Dialog.Header>
        <div
          class="flex items-center justify-evenly rounded-lg border-black/[.13] border-solid border-[1px] p-1 w-[250px] mx-auto mt-4 dark:border-white/[.13] dark:bg-white/10"
        >
          <button
            on:click={() => (view = "images")}
            class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/2 h-full  ${view === "images" ? "text-white bg-brand-foreground dark:bg-black" : "bg-transparent"}`}
            >Images</button>
          <button
            on:click={() => (view = "videos")}
            class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/2 h-full ${view === "videos" ? "text-white bg-brand-foreground dark:bg-black" : "bg-transparent"}`}
            >Videos</button>
        </div>
      <div class="grid gap-4 {imageUrls.length > 2 || videoPath !== '' ? 'overflow-y-auto' : ''} max-h-[400px] m-5" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
        {#if view === "images"}
            {#each imageUrls as imageUrl}
              <img src={"data:image/jpeg;base64," + imageUrl} alt="Event" class="w-full h-auto max-h-[350px]" loading="lazy"/>
            {/each}
        {:else if view === "videos"}
            {#if videoPath === ""}
              <p class="text-center text-gray-500">Video saving was not started at this moment.</p>
            {:else}
              <!-- svelte-ignore a11y-media-has-caption -->
              <!-- <video src={videoPath} controls class="w-full h-auto" autoplay={false} /> -->
               <div class="w-full h-auto max-h-[400px] ">
                <video autoplay preload="auto" width="100%" height="90%" controls><source src={videoPath} class="w-full h-auto max-h-[200px]"/></video>
               </div>
            {/if}
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
  