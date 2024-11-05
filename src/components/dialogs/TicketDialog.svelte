<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import * as Select from "@/components/ui/select";

  export let token: string;
  export let nodes: any;

  let nodeName = "";
  let address = "";
  let storeId = "";
  let cameraId = "";
  let issue = "";
  let dialogOpen = false;

  const onSubmit = async () => {
    console.log("camID", cameraId);
    console.log("storeID", storeId);
    console.log("issue", issue);
    await fetch(`https://api.moksa.ai/customerComplaints/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cameraId,
        storeId,
        issue,
      }),
    })
      .then((response) => {
        console.log(response);
        if (response.ok) {
          dialogOpen = false;
          toast("Ticket raised successfully");
        } else {
          toast("Failed to raise ticket");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast("An error occurred");
      });
  };

  let cams = [];

  async function getCams(id) {
    const allCams = await fetch(
      `https://api.moksa.ai/camera/getAllCamerasByStoreId/${id}/1/100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("all cameras ticket dialog", allCams);
    if (allCams.ok) {
      const data = await allCams.json();
      console.log(data);
      cams = data?.data?.data === undefined ? [] : data?.data?.data;
    }
  }

  //   $: console.log(nodes);
</script>

<!-- markup (zero or more items) goes here -->
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Raise Ticket</Dialog.Title>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="node-name">Store Id</Label>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[300px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={"Select Store"} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            {#each nodes as node}
              <Select.Item
                on:click={() => {
                  storeId = node.moksaId;
                  getCams(node.moksaId);
                }}
                value={node.id}>{node.name}</Select.Item
              >
            {/each}
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="address">Camera Id</Label>
        <Select.Root portal={null}>
          <Select.Trigger
            class="w-[300px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={"Select Store"} />
          </Select.Trigger>
          <Select.Content class="max-h-[200px] overflow-y-auto">
            {#each cams as cam}
              <Select.Item
                on:click={() => {
                  cameraId = cam.id;
                }}
                value={cam.id}
                >ip:{cam.ip}, camera no:{cam.cameraNo}</Select.Item
              >
            {/each}
          </Select.Content>
          <Select.Input name="favoriteFruit" bind:value={cameraId} />
        </Select.Root>
        <!-- <Input
          id="address"
          placeholder={"1234 Main St"}
          class="col-span-3"
          required
          bind:address
          on:change={(e) => (address = e.target.value)}
        /> -->
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="pincode">Issue</Label>
        <textarea
          id="issue"
          placeholder="Describe the issue..."
          class="col-span-3 w-full h-24 p-2 border rounded-md"
          required
          bind:value={issue}
          on:input={(e) => (issue = e.target.value)}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button type="submit" on:click={onSubmit}>Raise issue</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
