<script lang="ts">
  //types
  type Panel_Data = {
    name: string;
    username: string;
    password: string;
    ip_addr: string;
    httpPort: string;
    ssl: boolean;
    session: string;
  };

  // Import
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { toast } from "svelte-sonner";
  import * as Dialog from "../../../components/ui/dialog";
  import { Eye, EyeClosed, Loader2, Plus } from "lucide-svelte";
  import Switch from "@/components/ui/switch/switch.svelte";
  import { user } from "@/stores";
  import pb from "@/lib/pb";

  // variables
  let dialogOpen: boolean = false;
  let name: string = "";
  let username: string = "";
  let password: string = "";
  let serverIp: string = "";
  let serverPort: string = "";
  let ssl: boolean = false;
  let isLoading: boolean = false;
  let isPassVisible = false

  // Functions
  async function handleSubmit(addPanelData?: Panel_Data) {
    try {
      isLoading = true;
      // Use form data if addPanelData is not provided
      const panelDataToSubmit = addPanelData || {
        name,
        username,
        password,
        ip_addr: serverIp,
        httpPort: serverPort,
        ssl,
        session: $user?.session[0],
      };
      await pb.collection("atlas").create(panelDataToSubmit);

      dialogOpen = false;
      toast.success("Panel added successfully");
      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error adding panel:", error);
      toast.error("Failed to add panel");
    } finally {
      isLoading = false;
    }
  }
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[600px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Add New Panel</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2 gap-4 py-4">
      <div class="col-span-2 flex items-center gap-4">
        <Label class="w-24" for="name">Name</Label>
        <Input
          type="text"
          bind:value={name}
          class="text-base"
          placeholder="Name"
        />
      </div>
      <div class="col-span-2 flex items-center gap-4">
        <Label class="w-24" for="user-name">Username</Label>
        <Input
          type="text"
          bind:value={username}
          class="text-base"
          placeholder="Username"
        />
      </div>
      <div class="col-span-2 flex items-center gap-4">
        <Label class="w-24" for="password">Password</Label>
          <div class="relative w-full">
            <Input
            class="text-base"
            id="password"
            name="password"
            placeholder="Password"
            type={isPassVisible ? "text" : "password"}
            bind:value={password}
            autocapitalize="off"
            autocomplete="off"
            />
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="text-white/60 absolute inset-y-3 right-2" on:click={()=>{isPassVisible = !isPassVisible}}>
              {#if isPassVisible}
              <Eye size={16} class="transition-all ease-in-out"/>
              {:else}
              <EyeClosed size={16} class="transition-all ease-in-out"/>
              {/if}
              </span>
          </div>
      </div>
      <div class="col-span-2 flex items-center gap-4">
        <Label class="w-24" for="server-ip">Server IP</Label>
        <Input
          type="text"
          bind:value={serverIp}
          class="text-base"
          placeholder="Server IP"
        />
      </div>
      <div class="col-span-2 flex items-center gap-4">
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
        <Button
          on:click={() => handleSubmit()}
          class="mt-auto flex items-center gap-1 w-full"
          disabled={isLoading}
        >
          {#if isLoading}
            <Loader2 class="animate-spin" /> <i>Adding Panel...</i>
          {:else}
            <Plus size={16} />
            Add Panel
          {/if}
        </Button>
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
