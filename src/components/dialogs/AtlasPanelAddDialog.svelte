<script lang="ts">
  import PocketBase from "pocketbase";
  let dialogOpen: boolean = false;
  let username: string;
  let password: string;
  let serverIp: string;
  let serverPort: string;
  let name: string;
  let ssl: boolean = false;

  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import { Plus } from "lucide-svelte";
  import Switch from "../ui/switch/switch.svelte";
  import { page } from "$app/stores";

  const addPanel = async () => {
    // console.log(ssl);
    const PB = new PocketBase(`https://server.moksa.ai`);

    await PB.collection("panels")
      .create({
        name,
        username,
        password,
        ip_addr: serverIp,
        httpsPort: serverPort,
        ssl,
        session: $page.url.pathname.split("atlas/")[1],
      })
      .then(() => {
        toast.success("Panel added Successfully!");
      })
      .catch((err) => {
        toast.error("Failed to add panel");
      });
    // fetch("/api/panel/addPanel", {
    //   method: "post",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     cameraId,
    //     nodeId: $selectedNode.id,
    //     name,
    //     url,
    //   }),
    // }).then(() => {
    //   toast("Camera edited");
    // });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[600px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Add New Panel</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-4 py-4">
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="name">Name</Label>
        <Input
          type="text"
          bind:value={name}
          class="text-base"
          placeholder="Name"
        />
      </div>
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="user-name">Username</Label>
        <Input
          type="text"
          bind:value={username}
          class="text-base"
          placeholder="Username"
        />
      </div>
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="password">Password</Label>
        <Input
          bind:value={password}
          class="text-base"
          placeholder="Password"
          type="password"
        />
      </div>
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="server-ip">Server IP</Label>
        <Input
          type="text"
          bind:value={serverIp}
          class="text-base"
          placeholder="Server IP"
        />
      </div>
      <div class=" col-span-2 flex items-center gap-4">
        <Label class="w-24" for="server-port">Server Port</Label>
        <Input
          type="text"
          bind:value={serverPort}
          class="text-base"
          placeholder="Server Port"
        />
      </div>
      <div class="col-span-2 flex items-center gap-4 py-1">
        <Label class="w-24" for="ssl">SSL</Label>
        <Switch bind:checked={ssl} id="ssl" />
      </div>
    </div>

    <Dialog.Footer>
      <span class="flex items-center gap-4">
        <Button
          on:click={() => {
            dialogOpen = false;
          }}
          variant="secondary">Cancel</Button
        >
        <Button class="flex items-center gap-2 text-white" on:click={addPanel}
          ><Plus class="size-4" />Add Panel</Button
        >
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
