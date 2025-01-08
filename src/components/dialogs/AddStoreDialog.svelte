<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { ChevronDown, X } from "lucide-svelte";
  import Switch from "../ui/switch/switch.svelte";
  import { addStore } from "@/lib/add-store";

  export let token;
  export let user;
  let dialogOpen = false;
  let nodeName = "";
  let address = "";
  let pincode = "";
  let country = "";
  let manager = "";
  let storeOpenTime;
  let storeCloseTime;
  let isStore24hr;
  let selectedTimezone;
  let hasKitchen = false;

  const timezones = ["EST", "PST", "MST", "UTC", "CST"];

  const handleSubmit = async () => {
    const { success } = await addStore(
      token,
      {
        name: nodeName,
        sessionId: user?.user?.session,
        address: address,
        pin: pincode,
        country: country,
        manager: manager,
        timezone: selectedTimezone,
        storeOpenTime: storeOpenTime,
        storeCloseTime: storeCloseTime,
        isStore24hr: isStore24hr,
        hasKitchen: hasKitchen,
      },
      user?.user
    );

    if (success) {
      dialogOpen = false;
    }
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    closeButton={false}
    class="sm:max-w-[460px] bg-white shadow-lg rounded-xl max-h-[80%] overflow-y-scroll"
  >
    <div class="px-4 py-2">
      <Dialog.Header class="relative">
        <Dialog.Title class="text-2xl font-semibold mb-6"
          >Add New Store</Dialog.Title
        >
        <button
          class="absolute -top-1 right-4 p-2 grid place-items-center rounded-full text-[#E71D36] bg-[#E71D36]/15 cursor-pointer"
          on:click={() => (dialogOpen = false)}
        >
          <X class="h-4 w-4" />
        </button>
      </Dialog.Header>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label
              for="nodeName"
              class="block text-sm font-medium text-gray-700">Store Name</Label
            >
            <Input
              id="nodeName"
              name="nodeName"
              bind:value={nodeName}
              placeholder="Enter store name"
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            />
          </div>
          <div class="space-y-2">
            <Label for="address" class="block text-sm font-medium text-gray-700"
              >Address</Label
            >
            <Input
              id="address"
              name="address"
              bind:value={address}
              placeholder="Enter address"
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            />
          </div>
          <div class="space-y-2">
            <Label for="pincode" class="block text-sm font-medium text-gray-700"
              >Zip</Label
            >
            <Input
              id="pincode"
              name="pincode"
              bind:value={pincode}
              placeholder="Enter Zip"
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            />
          </div>
          <div class="space-y-2">
            <Label for="country" class="block text-sm font-medium text-gray-700"
              >Country</Label
            >
            <Input
              id="country"
              name="country"
              bind:value={country}
              placeholder="Enter country"
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            />
          </div>
          <div class="space-y-2">
            <Label for="manager" class="block text-sm font-medium text-gray-700"
              >Manager</Label
            >
            <Input
              id="manager"
              name="manager"
              bind:value={manager}
              placeholder="Enter manager name"
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            />
          </div>
          <div class="space-y-2">
            <Label
              for="hasKitchen"
              class="block text-sm font-medium text-gray-700">Has Kitchen</Label
            >
            <!-- <Input id="manager" name="manager" bind:value={manager} placeholder="Enter manager name" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" /> -->
            <Switch id={`store-has-kitchen`} bind:checked={hasKitchen} />
          </div>
        </div>

        <div class="grid grid-cols-4 items-center gap-4 relative py-2">
          <Label for={`store-timezone`}>Timezone</Label>
          <select
            id="store-timezone"
            bind:value={selectedTimezone}
            class="col-span-3 w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          >
            <option value="" disabled selected>Select timezone</option>
            {#each timezones as timezone}
              <option value={timezone}>{timezone}</option>
            {/each}
          </select>
          <ChevronDown
            class="absolute pointer-events-none right-3 top-1/2 transform -translate-y-1/2 z-20"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2">
          <Label for={`store-24hr`}>24-Hour Operation</Label>
          <div class="col-span-3">
            <Switch id={`store-24hr`} bind:checked={isStore24hr} />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2">
          <Label for={`store-open-time`}>Open Time</Label>
          <Input
            id={`store-open-time`}
            type="time"
            class="col-span-3"
            bind:value={storeOpenTime}
            disabled={isStore24hr}
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2">
          <Label for={`store-close-time`}>Close Time</Label>
          <Input
            id={`store-close-time`}
            type="time"
            class="col-span-3"
            bind:value={storeCloseTime}
            disabled={isStore24hr}
          />
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            on:click={() => (dialogOpen = false)}
            class="px-4 py-2 border border-[#F2F4F7] rounded-md text-gray-700"
            >Cancel</Button
          >
          <Button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</Button
          >
        </div>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>
