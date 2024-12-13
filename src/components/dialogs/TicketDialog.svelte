<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import * as Select from "@/components/ui/select";
  import { CloudFog } from "lucide-svelte";
  import Camera from "../configuration/settings/Camera.svelte";
  import { tickets } from "@/lib/stores";

  export let token: string;
  export let nodes: any;

  let nodeName = "";
  let address = "";
  let storeId = "";
  let cameraId = "";
  let issue = "";
  let dialogOpen = false;

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `https://api.moksa.ai/customerComplaints/getAllComplaints/1/10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      tickets.set(data?.data?.data || []);
    } catch (error) {
      console.log(error?.message, "error while fetching complaints");
    }
  };

  const onSubmit = async () => {
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
        if (response.ok) {
          dialogOpen = false;
          toast.success("Ticket raised successfully");
          issue = "";
          fetchComplaints();
        } else {
          toast.error("Failed to raise ticket");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast("An error occurred");
      });
  };

  let cams = [];

  async function getCams(id) {
    cameraId = "";
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

    if (allCams.ok) {
      const data = await allCams.json();
      console.log(data);
      cams = data?.data?.data === undefined ? [] : data?.data?.data;
    }
  }
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
        <div class="flex flex-col items-start">
          <div class="relative">
            <select
              id="camera-select"
              class="w-[300px] h-10 bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
              placeholder="select Camera"
              on:change={(e) => {
                cameraId = e?.target?.value;
              }}
            >
              <option value="" disabled selected>Select Camera</option>
              {#each cams as cam}
                <option class="text-lg" value={cam.id}
                  >ip:{cam.ip}, camera no:{cam.cameraNo}</option
                >
              {/each}
            </select>
          </div>
        </div>
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
