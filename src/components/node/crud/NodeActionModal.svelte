<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import AddCameraForm from "@/components/forms/CameraForm.svelte";

  import pb from "@/lib/pb";
  import * as AlertDialog from "@/components/ui/alert-dialog";
  import * as Tabs from "@/components/ui/tabs/index.js";
  import * as Card from "@/components/ui/card/index.js";
  import { selectedNode, nodes, user } from "@/stores";

  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";

  export let action: "add" | "edit" | "delete";

  let modalOpen = false;

  let nodeName = "";
  let cameraName = "";
  let mainUrl = "";
  let subUrl = "";

  const addNode = async () => {
    const data = {
      name: nodeName,
      session: $user.session[0],
    };
    const record = await pb.collection("node").create(data);
    selectedNode.set(record.id);
    if (cameraName !== "" && mainUrl !== "") {
      const data = {
        name: cameraName,
        url: mainUrl,
        subUrl,
        node: record.id,
      };
      await pb.collection("camera").create(data);
    }

    modalOpen = false;
  };

  const editNode = async () => {
    const data = {
      name: nodeName,
      session: $user.session[0],
    };
    const record = await pb
      .collection("node")
      .update($nodes.find((n) => n.id === $selectedNode)?.id, data);
    selectedNode.set(record.id);
    modalOpen = false;
  };

  const deleteNode = async () => {
    const record = await pb
      .collection("node")
      .delete($nodes.find((n) => n.id === $selectedNode)?.id);
  };

  $: console.log(action, "action here");
</script>

{#if action === "add"}
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[48rem] h-[90vh] overflow-auto">
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4"
          >{action.charAt(0).toUpperCase() + action.slice(1)} Node</Dialog.Title
        >
      </Dialog.Header>
      <Tabs.Root orientation={"vertical"} value="node">
        <Tabs.List class="grid w-full grid-cols-4">
          <Tabs.Trigger value="node">Node</Tabs.Trigger>
          <Tabs.Trigger disabled value="subnode">Sub-node</Tabs.Trigger>
          <Tabs.Trigger value="camera">Camera</Tabs.Trigger>
          <Tabs.Trigger disabled value="server">Server</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="node">
          <Card.Root>
            <Card.Header>
              <Card.Title>Add a node</Card.Title>
              <Card.Description>
                Define a primary organizational entity representing a location
                or group within the system.
              </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="space-y-1">
                <Label for="nodeName">Name</Label>
                <Input
                  id="nodeName"
                  placeholder="Home-Garage"
                  bind:value={nodeName}
                />
              </div>
              <div class="space-y-1">
                <Label for="picture">
                  Avatar <span class="text-foreground/30">(Optional)</span
                  ></Label
                >
                <Input id="picture" type="file" />
              </div>
            </Card.Content>
            <Card.Footer class="flex items-center justify-end w-full">
              <Button
                type="submit"
                variant="brand"
                on:click={addNode}
                disabled={nodeName === ""}>Confirm</Button
              >
            </Card.Footer>
          </Card.Root>
        </Tabs.Content>
        <Tabs.Content value="subnode">
          <Card.Root>
            <Card.Header>
              <Card.Title>Password</Card.Title>
              <Card.Description>
                Create a sub-category under a node to further organize related
                assets or entities.
              </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="space-y-1">
                <Label for="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-1">
                <Label for="new">New password</Label>
                <Input id="new" type="password" />
              </div>
            </Card.Content>
            <Card.Footer>
              <Button>Save password</Button>
            </Card.Footer>
          </Card.Root>
        </Tabs.Content>
        <Tabs.Content
          value="camera"
          class="lg:max-h-96 lg:overflow-y-auto xl:max-h-full xl:overflow-visible"
        >
          <Card.Root>
            <Card.Header>
              <Card.Title>Add a camera</Card.Title>
              <Card.Description>
                Link surveillance cameras to the nodes and sub-nodes to capture
                and manage video streams.
              </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
              <AddCameraForm bind:cameraName bind:mainUrl bind:subUrl />
            </Card.Content>
          </Card.Root>
        </Tabs.Content>
        <Tabs.Content value="server">
          <Card.Root>
            <Card.Header>
              <Card.Title>Password</Card.Title>
              <Card.Description>
                Integrate a server to manage processing tasks, video storage,
                and real-time analytics for connected cameras.
              </Card.Description>
            </Card.Header>
            <Card.Content class="space-y-2">
              <div class="space-y-1">
                <Label for="current">Current password</Label>
                <Input id="current" type="password" />
              </div>
              <div class="space-y-1">
                <Label for="new">New password</Label>
                <Input id="new" type="password" />
              </div>
            </Card.Content>
            <Card.Footer>
              <Button>Save password</Button>
            </Card.Footer>
          </Card.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Dialog.Content>
  </Dialog.Root>
{:else if action === "edit"}
  <Dialog.Root bind:open={modalOpen}>
    <Dialog.Trigger><slot /></Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[48rem]">
      <Dialog.Header>
        <Dialog.Title class="border-b pb-4">Edit Node</Dialog.Title>
      </Dialog.Header>
      <div class="space-y-1">
        <Label for="nodeName">Name</Label>
        <Input
          id="nodeName"
          placeholder={$nodes.find((n) => n.id === $selectedNode)?.name}
          bind:value={nodeName}
        />
      </div>
      <Dialog.Footer class="flex items-center justify-end w-full">
        <Button
          type="submit"
          variant="brand"
          on:click={editNode}
          disabled={nodeName === ""}
          >Confirm</Button
        >
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <AlertDialog.Root>
    <AlertDialog.Trigger><slot /></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
        <AlertDialog.Description>
          Deleting a node cannot be undone. This will permanently delete your
          node and remove all associated sub-nodes and cameras from our servers.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action on:click={deleteNode} class="bg-rose-500 text-white"
          >Delete</AlertDialog.Action
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}
