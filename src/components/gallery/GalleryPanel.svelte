<script lang="ts">
  import { mode } from "mode-watcher";
  import { cn } from "@/lib/utils";
  import type { Gallery } from "@/types";
  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  import { List, ScanFace } from "lucide-svelte";
  import GalleryTable from "./GalleryTable.svelte";
  import RegisterFaceDialog from "../live/faceRegister/register-face-dialog.svelte";
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");
  export let gallery: Gallery;
  let view: number = 1;
</script>

<section class="w-full h-full flex flex-row-reverse">
  <div
    class="flex flex-col gap-4 items-center justify-center px-4 h-[calc(100vh-75px)] my-auto"
  >
    <RegisterFaceDialog>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          class={`text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        >
          <ScanFace class="h-[22px] w-[22px]" />
        </button>
        <p
          class="text-xs group-hover:text-[#015a62] dark:group-hover:text-[#258d9d] text-black/[.23] dark:text-white"
        >
          Register
        </p>
      </span>
    </RegisterFaceDialog>

    <span class="group flex-col flex items-center justify-center gap-0.5">
      <!-- svelte-ignore a11y_consider_explicit_label -->
      <button
        on:click={() => (view = 1)}
        class={view !== 1
          ? `text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
          : `relative border-none rounded-full shadow-md h-[40px] w-[40px] text-white bg-[#015a62] grid place-items-center dark:bg-[#258d9d]`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22px"
          height="22px"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M19.75 4A2.25 2.25 0 0 1 22 6.25v11.505a2.25 2.25 0 0 1-2.25 2.25H4.25A2.25 2.25 0 0 1 2 17.755V6.25A2.25 2.25 0 0 1 4.25 4zm0 1.5H4.25a.75.75 0 0 0-.75.75v11.505c0 .414.336.75.75.75h15.5a.75.75 0 0 0 .75-.75V6.25a.75.75 0 0 0-.75-.75m-10 7a.75.75 0 0 1 .75.75v.493l-.008.108c-.163 1.113-1.094 1.65-2.492 1.65s-2.33-.537-2.492-1.65l-.008-.11v-.491a.75.75 0 0 1 .75-.75zm3.502.496h4.498a.75.75 0 0 1 .102 1.493l-.102.007h-4.498a.75.75 0 0 1-.102-1.493zh4.498zM8 8.502a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m5.252.998h4.498a.75.75 0 0 1 .102 1.493L17.75 11h-4.498a.75.75 0 0 1-.102-1.493zh4.498z"
          ></path>
        </svg>
      </button>
      <p
        class={`text-xs ${view !== 1 ? "group-hover:text-[#015a62] whitespace-nowrap text-black/[.23] dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d] whitespace-nowrap  text-[#015a62]"}`}
      >
        Card View
      </p>
    </span>

    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 2)}
        class={view !== 2
          ? `text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
          : `relative border-none rounded-full shadow-md h-[40px] w-[40px] text-white bg-[#015a62] grid place-items-center dark:bg-[#258d9d]`}
      >
        <List class="h-[22px] w-[22px]" />
      </button>
      <p
        class={`text-xs ${view !== 2 ? "group-hover:text-[#015a62] whitespace-nowrap text-black/[.23] dark:text-white dark:group-hover:text-[#258d9d]" : "dark:text-[#258d9d] whitespace-nowrap  text-[#015a62]"}`}
      >
        List View
      </p>
    </span>
  </div>
  <div class="flex flex-col px-8 pt-8 h-full w-full gap-4">
    <h1 class="text-2xl font-semibold text-black/[.87] dark:text-white/[.87]">
      Gallery / Registered People
    </h1>
    {#if view === 1}
      <div
        class="flex flex-wrap gap-6 h-full w-full overflow-y-scroll pb-10 pt-3"
      >
        {#if gallery && gallery?.length > 0}
          {#each gallery as person}
            <div
              class={`w-[290px] h-[12rem] bg-white dark:bg-[#333] ${$mode !== "dark" && "shad"} rounded-lg p-3`}
            >
              <span class="flex items-center justify-between">
                <p class="text-base font-semibold">{person.name}</p>
                <span
                  class="text-[#559C36] bg-[#559C36] bg-opacity-15 px-2 py-1 rounded-md text-sm"
                  >Active</span
                >
              </span>
              <span class="text-xs mt-2">
                <span class="font-medium"> Created at: </span>
                {new Date(person?.created).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', hour12: true })}
              </span>
              <div class="flex -space-x-2 overflow-hidden my-2">
                {#each person?.images as galleryImage}
                  <img
                    class={cn(
                      `inline-block h-10 w-10 rounded-full ring-2 ring-white`,
                      "3xl:w-16 3xl:h-16"
                    )}
                    src={"data:image/jpeg;base64," + galleryImage}
                    alt=""
                  />
                {/each}
              </div>
              <span class="text-sm">
                Updated {timeAgo?.format(new Date(person?.updated))}
              </span>
            </div>
          {/each}
        {:else}
          <div class="flex flex-col h-full p-4 my-auto z-10 relative">
            <p class="text-center text-xl font-medium">
              No registered people found, Register to add people to your gallery
            </p>
          </div>
        {/if}
      </div>
    {:else}
      <div class="h-full w-full">
        <GalleryTable data={gallery} />
      </div>
    {/if}
  </div>
</section>

<style>
  .shad {
    box-shadow: 0px 3.24px 6.47px 0px #d3dae2;
  }
</style>
