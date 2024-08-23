<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import { X } from "lucide-svelte";
  import { enhance } from "$app/forms";

  let dialogOpen = false;
  let nodeName = "";
  let address = "";
  let pincode = "";
  let country = "";
  let manager = "";

  const handleSubmit = async () => {
    console.log(nodeName, address, pincode, country, manager)
    await fetch("/api/node/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nodeName,
          sessionId: $selectedNode?.session,
          address: address,
          pin: pincode,
          country: country,
          manager: manager
        })
    }).then(() => {
      toast("Store added");
      dialogOpen = false
    }).catch((err) => console.log(err))
    return true;
  };

</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content closeButton={false} class="sm:max-w-[460px] bg-white shadow-lg rounded-xl">
    <div class="px-4 py-2">
      <Dialog.Header class='relative'>
        <Dialog.Title class="text-2xl font-semibold mb-6">Add New Store</Dialog.Title>
        <button class="absolute -top-1 right-4 p-2 grid place-items-center rounded-full text-[#E71D36] bg-[#E71D36]/15 cursor-pointer" on:click={() => dialogOpen = false}>
          <X class="h-4 w-4" />
        </button>
      </Dialog.Header>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="nodeName" class="block text-sm font-medium text-gray-700">Store Name</Label>
            <Input id="nodeName" name="nodeName" bind:value={nodeName} placeholder="Enter store name" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="address" class="block text-sm font-medium text-gray-700">Address</Label>
            <Input id="address" name="address" bind:value={address} placeholder="Enter address" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="pincode" class="block text-sm font-medium text-gray-700">Pincode</Label>
            <Input id="pincode" name="pincode" type="number" bind:value={pincode} placeholder="Enter pincode" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="country" class="block text-sm font-medium text-gray-700">Country</Label>
            <Input id="country" name="country" bind:value={country} placeholder="Enter country" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="manager" class="block text-sm font-medium text-gray-700">Manager</Label>
            <Input id="manager" name="manager" bind:value={manager} placeholder="Enter manager name" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
        </div>
        <div class="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" on:click={() => dialogOpen = false} class="px-4 py-2 border border-[#F2F4F7] rounded-md text-gray-700">Cancel</Button>
          <Button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</Button>
        </div>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>