<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/stores";
  import { X, ChevronDown } from "lucide-svelte";
  import Switch from "../ui/switch/switch.svelte";

  let dialogOpen = false;
  export let store;
  export let token;
  // $: console.log(store);
  let nodeName = store.storeName;
  let address = store.location?.split(",")[0];
  let pincode = store.pincode;
  let country = store.country;
  let manager = store.storeManager;
  let id = store.moksaId;
  export let refreshStoreData: () => void;
  let storeOpenTime;
  let storeCloseTime;
  let isStore24hr;
  let selectedTimezone;
  let hasKitchen;

  const timezones = ["EST", "PST", "MST", "UTC", "CST"];

  const today = new Date().toISOString().split("T")[0];
  const oneYearAgo = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  )
    .toISOString()
    .split("T")[0];

  let storeData = null;

  const fetchStoreData = async () => {
    console.log("fetching store data");
    await fetch(
      `https://dev.api.moksa.ai/store/getStoreByStoreIdWithAllDetails/${id}/${oneYearAgo}/${today}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("store extra data", data);
        if (data?.status === 200) {
          storeData = data?.data[0];
          storeOpenTime = storeData.openingTime;
          storeCloseTime = storeData.closingTime;
          isStore24hr = storeData.is24HrStore;
          selectedTimezone = storeData.timezone;
          hasKitchen = storeData.hasKitchen;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSubmit = async () => {
    console.log(address, "address here");
    console.log(country, "countryhere");
    await fetch("/api/node/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nodeName,
        id: $selectedNode.id,
        address: address,
        pincode: pincode,
        country: country,
        manager: manager,
        moksaId: store.moksaId,
        hasKitchen: hasKitchen,
        openingTime: storeOpenTime,
        closingTime: storeCloseTime,
        is24HrStore: isStore24hr,
        timezone: selectedTimezone,
      }),
    }).then(async () => {
      toast("Store updated");
      dialogOpen = false;
      await refreshStoreData();
      // await fetchStoreData();
    });
    return true;
  };

  $: if (dialogOpen) {
    fetchStoreData();
  }
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    closeButton={false}
    class="sm:max-w-[460px] bg-white shadow-lg rounded-xl"
  >
    <div class="px-4 py-2">
      <Dialog.Header class="relative">
        <Dialog.Title class="text-2xl font-semibold mb-6"
          >Edit Store</Dialog.Title
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
              >Pincode</Label
            >
            <Input
              id="pincode"
              name="pincode"
              bind:value={pincode}
              placeholder="Enter pincode"
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
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2">
          <Label for={`has-kitchen`}>has Kitchen</Label>
          <div class="col-span-3">
            <Switch id={`has-kitchen`} bind:checked={hasKitchen} />
          </div>
        </div>
        <div class="space-y-2">
          <Label for={`store-timezone`}>Timezone</Label>
          <span class="relative w-full col-span-3">
            <select
              id="store-timezone"
              bind:value={selectedTimezone}
              class=" w-full border border-[#F2F4F7] rounded-md px-3 py-2"
            >
              <option value="" disabled selected>Select timezone</option>
              {#each timezones as timezone}
                <option value={timezone}>{timezone}</option>
              {/each}
            </select>
            <ChevronDown
              class="absolute pointer-events-none right-3 top-1/2 transform -translate-y-1/2 z-20"
            />
          </span>
        </div>

        <div class="grid grid-cols-4 items-center gap-4 py-2">
          <Label for={`store-24hr`}>24-Hour</Label>
          <div class="col-span-3">
            <Switch id={`store-24hr`} bind:checked={isStore24hr} />
          </div>
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2 relative">
          <Label for={`store-open-time`}>Open Time</Label>
          <Input
            id={`store-open-time`}
            type="time"
            class="col-span-3"
            bind:value={storeOpenTime}
            disabled={isStore24hr}
          />
          <span
            on:click={() => (storeOpenTime = null)}
            class="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X />
          </span>
        </div>
        <div class="grid grid-cols-4 items-center gap-4 py-2 relative">
          <Label for={`store-close-time`}>Close Time</Label>
          <Input
            id={`store-close-time`}
            type="time"
            class="col-span-3"
            bind:value={storeCloseTime}
            disabled={isStore24hr}
          />
          <span
            on:click={() => (storeCloseTime = null)}
            class="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X />
          </span>
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
            class="px-4 py-2 bg-blue-500 text-white rounded-md">Update</Button
          >
        </div>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>
