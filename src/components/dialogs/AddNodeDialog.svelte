<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/stores";
  import type { User } from "@/types";

  export let user: User;
  export let getNodeData;
  let nodeName = "";
  let address = "";
  let pincode = "";
  let country = "";
  let manager = "";
  let dialogOpen = false;
  const onSubmit = () =>
    fetch("/api/node/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nodeName,
        sessionId: $selectedNode?.session
          ? $selectedNode.session
          : user.session,
        address: address,
        pin: pincode,
        country: country,
        manager: manager,
      }),
    }).then((response) => {
      if (response.ok) {
        dialogOpen = false;
      }
      toast("Node added");
      getNodeData();
    });
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Add Store</Dialog.Title>
      <Dialog.Description>
        Add a new Store to session: <span class="font-semibold"
          >{$selectedNode?.session ? $selectedNode.session : user.session}</span
        >
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
    </div>

    <Dialog.Footer>
      <Button type="submit" on:click={onSubmit}>Add Node</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
