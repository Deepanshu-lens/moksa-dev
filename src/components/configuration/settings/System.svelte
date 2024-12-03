<script lang="ts">
  import Switch from "@/components/ui/switch/switch.svelte";
  import { ChevronDown, RotateCcw } from "lucide-svelte";
  import { addUserLog } from "@/lib/addUserLog";

  let selected = 1;
  let firmType = 1;
  let firmOptions = [
    { id: 1, label: "Update online using lens view server" },
    {
      id: 2,
      label: "manual update (if you have the update package available)",
    },
  ];
  let checked = false;
  let showRebootModal = false;
  let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
</script>

<div
  class="flex flex-col items-start h-[calc(100vh-75px)] w-full text-black dark:text-white"
>
  <!-- <div
    class="flex w-full justify-start items-center gap-20 font-bold mb-4 px-8"
  >
    {#if selected === 1}
      <div class=" relative">
        <span class="font-bold text-[#015A62] dark:text-white">
          Maintenance
        </span>
        <span
          class=" h-[3px] rounded-full bg-[#0B8995] w-full absolute left-0 -bottom-4"
        />
      </div>
    {:else}
      <button
        class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
        on:click={() => {
          selected = 1;
          addUserLog("user clicked on miantenance button system panel");
        }}
      >
        Maintenance
      </button>
    {/if}
    {#if selected === 2}
      <div class=" relative">
        <span class="font-bold text-[#015A62] dark:text-white"> Time </span>
        <span
          class=" h-[3px] rounded-full bg-[#0B8995] w-full absolute left-0 -bottom-4"
        />
      </div>
    {:else}
      <button
        class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
        on:click={() => {
          selected = 2;
          addUserLog("user clicked on time button system panel");
        }}
      >
        Time
      </button>
    {/if}
    {#if selected === 3}
      <div class=" relative">
        <span class="font-bold text-[#015A62] dark:text-white">
          Diagnostics
        </span>
        <span
          class=" h-[3px] rounded-full bg-[#0B8995] w-full absolute left-0 -bottom-4"
        />
      </div>
    {:else}
      <button
        class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
        on:click={() => {
          selected = 3;
          addUserLog("user clicked on diagnostics button system panel");
        }}
      >
        Diagnostics
      </button>
    {/if}
    {#if selected === 4}
      <div class=" relative">
        <span class="font-bold text-[#015A62] dark:text-white">
          System logs
        </span>
        <span
          class=" h-[3px] rounded-full bg-[#0B8995] w-full absolute left-0 -bottom-4"
        />
      </div>
    {:else}
      <button
        class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
        on:click={() => {
          selected = 4;
          addUserLog("user clicked on system logs button system panel");
        }}
      >
        System logs
      </button>
    {/if}
    {#if selected === 5}
      <div class=" relative">
        <span class="font-bold text-[#015A62] dark:text-white"> Reboot </span>
        <span
          class=" h-[3px] rounded-full bg-[#0B8995] w-full absolute left-0 -bottom-4"
        />
      </div>
    {:else}
      <button
        class="cursor-pointer text-[#212427] dark:text-[rgba(255,255,255,.6)] font-medium"
        on:click={() => {
          selected = 5;
          addUserLog("user clicked on reboot button system panel");
        }}
      >
        Reboot
      </button>
    {/if}
  </div> -->

  <!-- {#if selected === 1} -->
    <div
      class=" w-[94.5%] my-4 pt-4 mx-6 "
    >
      <h2 class="px-6 font-medium mb-4">Firmware Update</h2>
      <!-- <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      /> -->
      <form
        class=" flex flex-col items-start justify-center gap-10 w-[75%] mb-8 px-6"
      >
        {#each firmOptions as { id, label }}
          <div class="flex gap-4 w-full items-center">
            <label>
              <input
                type="radio"
                name="delayOption"
                bind:group={firmType}
                value={id}
              />
              {label}
            </label>
            {#if firmType === 2 && id === 2}
              <div class="relative">
                <select
                  class="bg-white dark:bg-[#1b1b1b] py-4 mt-1 font-semibold px-4 w-[300px] outline-none capitalize text-[#015A62] dark:text-white select border border-1 border-solid border-[#d9d9d9] max-h-[53px] dark:border-[#292929]"
                  name="nodeSelecter"
                >
                  <option>available versions</option>
                </select>
                <span
                  class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <ChevronDown size={18} />
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </form>
      <p class="px-6 dark:text-[#929292] text-sm mb-8 mt-4">
        Note: The upgrading process will be 1 to 10 minutes. please don't
        disconnect power to the device during the process
      </p>
    </div>
  <!-- {/if}
  {#if selected === 5} -->
  <!-- {/if}

  {#if selected === 2} -->
    <div
      class=" w-[94.5%] my-4 pt-4 mx-6"
    >
      <h2 class="font-medium px-6 mb-4">Timezone settings</h2>
      <!-- <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      /> -->
      <div class="flex px-6 items-center gap-4 mb-8">
        <p>Select your timezone :</p>
        <div class="relative">
          <select
            class="bg-white dark:bg-[#1b1b1b] py-4 mt-1 font-semibold px-4 w-[300px] outline-none capitalize text-[#015A62] dark:text-white select border border-1 border-solid border-[#d9d9d9] max-h-[53px] dark:border-[#292929]"
            name="nodeSelecter"
          >
            <option>{selectedTimezone}</option>
          </select>
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <ChevronDown size={18} />
          </span>
        </div>
      </div>
    </div>
    <div
      class=" w-[94.5%] my-4 mx-6"
    >
      <h2 class="font-medium px-6 mb-8 mt-4">Sync your Timeline</h2>
      <!-- <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      /> -->
      <div class="flex px-6 items-center gap-4 mb-8">
        <p>Sync your timezone with server:</p>
        <Switch />
      </div>
    </div>
  <!-- {/if}
  {#if selected === 3} -->
    <!-- <div
      class=" w-[94.5%] my-4 pt-8 shad mx-6 border-black/[.08] border-[1px] border-solid"
    >
      <h2 class="font-medium px-6 mb-4">Diagnostics</h2>
      <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      />
      <div class="flex px-6 items-center justify-center gap-4"></div>
    </div> -->
  <!-- {/if}
  {#if selected === 4} -->
    <!-- <div
      class=" w-[94.5%] my-4 pt-4  mx-6 "
    >
      <h2 class="font-medium px-6 mb-4">System Logs</h2>
      <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      />
      <div class="flex px-6 items-center justify-center gap-4"></div>
    </div> -->
  <!-- {/if} -->

  <!-- {showRebootModal && ( -->
  <!-- //   <RebootModal setShowRebootModal={setShowRebootModal} /> -->
  <!-- )} -->
</div>

<style>
  .shad {
    box-shadow: 0px 4px 4px 0px #0000000f;
  }
</style>
