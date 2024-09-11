<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import * as Select from "@/components/ui/select/index";
  import Switch from "../ui/switch/switch.svelte";

  let nodeName = "";
  let address = "";
  let pincode = "";
  let country = "";
  let manager = "";
  let selectedTimezone = ''
  let storeOpenTime = ''
  let storeCloseTime = ''
  let isStore24hr = false
  selectedTimezone
  const timezones = [
    'EST',
    'PST',
    'MST',
    "CST",]
    
  export let showAddNode: boolean;
  const onSubmit = () =>
    fetch("/api/node/create", {
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
        manager: manager,
        timezone: selectedTimezone,
        storeOpenTime: storeOpenTime,
        storeCloseTime: storeCloseTime,
        isStore24hr: isStore24hr,
      }),
    }).then((response) => {
      if (response.ok) {
        showAddNode.set(false);
      }
      toast("Store added");
      // getNodeData();
    });
  function handleClose() {
    console.log("close");
    showAddNode.set(false)
  }
</script>

<!-- markup (zero or more items) goes here -->
<!-- {#if showAddNode} -->
<Dialog.Root bind:open={$showAddNode} onOpenChange={handleClose}>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Add Store</Dialog.Title>
      <Dialog.Description>
        Add a new Store to session: <span class="font-semibold"
          >{$selectedNode?.session}
        </span>
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="node-name">Store Name</Label>
        <Input
          id="node-name"
          placeholder={"Office"}
          class="col-span-3"
          required
          bind:nodeName
          on:change={(e) => (nodeName = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="address">Address</Label>
        <Input
          id="address"
          placeholder={"1234 Main St"}
          class="col-span-3"
          required
          bind:address
          on:change={(e) => (address = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="pincode">Zip</Label>
        <Input
          id="pincode"
          placeholder={"110001"}
          class="col-span-3"
          required
          bind:pincode
          on:change={(e) => (pincode = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="country">Country</Label>
        <Input
          id="country"
          placeholder={"India"}
          class="col-span-3"
          required
          bind:country
          on:change={(e) => (country = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="manager">Manager</Label>
        <Input
          id="manager"
          placeholder={"John Doe"}
          class="col-span-3"
          required
          bind:manager
          on:change={(e) => (manager = e.target.value)}
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-timezone`}>Timezone</Label>
            <Select.Root >
              <Select.Trigger class="col-span-3">
                <Select.Value placeholder="Select timezone" />
              </Select.Trigger>
              <Select.Content>
                {#each timezones as timezone}
                  <Select.Item on:click={() => (selectedTimezone = timezone)} value={timezone}>{timezone}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          <div class="grid grid-cols-4 items-center gap-4 py-2">
            <Label for={`store-24hr`}>24-Hour Operation</Label>
            <div class="col-span-3">
              <Switch
                id={`store-24hr`}
                bind:checked={isStore24hr}
              />
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
    </div>

    <Dialog.Footer>
      <Button type="submit" on:click={onSubmit}>Add Node</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
<!-- {/if} -->
