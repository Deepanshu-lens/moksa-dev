<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { selectedNode } from "@/lib/stores";
  import * as Select from "@/components/ui/select";
  import { X } from "lucide-svelte";
  import PocketBase from "pocketbase";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { enhance } from "$app/forms";

  let dialogOpen = false;
  let userType = "";
  let userID = "";
  let firstName = "";
  let lastName = "";
  let phoneNumber = "";
  let mailId = "";
  let password = "";
  let cPassword = "";
  export let user;
  const token = user.moksaToken;
  let nodes: any[] = [];

  let roles: any[] = [];

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  onMount(async () => {
    PB.autoCancellation(false);
    const res = await PB.collection("roles").getFullList();
    const stores = await PB.collection("node").getFullList();
    // console.log(res);
    roles = res;
    // nodes = stores
    nodes = stores.map((store) => store.id);
    // console.log(nodes);
  });

  const handleSubmit = async () => {
    if (password !== cPassword) {
      toast.error("Passwords don't match");
      return false;
    }

    const session = await PB.collection("session").create({
      owned: true,
      node: userType === "superAdmin" ? nodes : null,
    });
    console.log(session);
    const user = await PB.collection("users").create({
      firstName,
      lastName,
      email: mailId,
      role: userID,
      session: session.id,
      password,
      passwordConfirm: cPassword,
    });
    console.log(user);

    const moksa = await fetch("/api/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        mailId,
        password,
        userType,
        lensId: user.id,
      }),
    });
    const d = await moksa.json();

    await PB.collection("users").update(user.id, {
      moksaToken: d.id,
    });
    dialogOpen = false;


    if (userType === "superAdmin") {
      for (const node of nodes) {
        await PB.collection("node").update(node, {
          "session+": [session.id],
        });
      }
    }
    return true;
  };

  const handleResult = (result) => {
    if (result.type === "success") {
      toast.success("User added successfully");
      dialogOpen = false;
    } else if (result.type === "failure") {
      toast.error(result.data?.error || "Failed to add user");
    }
  };
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
          >Add New User</Dialog.Title
        >
        <button
          class=" absolute -top-1 right-4 p-2 grid place-items-center rounded-full text-[#E71D36] bg-[#E71D36]/15 cursor-pointer"
          on:click={() => (dialogOpen = false)}
        >
          <X class="h-4 w-4" />
        </button>
      </Dialog.Header>
      <!-- <form method="POST" action="?/createUser" use:enhance={() => {
        return ({ result }) => handleResult(result);
      }} on:submit|preventDefault={handleSubmit}> -->
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="userType" class="block text-sm font-medium text-gray-700"
            >User Type</Label
          >
          <Input
            required
            id="userType"
            name="userType"
            bind:value={userType}
            placeholder="Enter user type"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2  hidden"
          />
          <Input
            required
            id="userID"
            name="userID"
            bind:value={userID}
            placeholder="Enter user type"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2  hidden"
          />
          <Select.Root bind:value={userType}>
            <Select.Trigger
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2 text-gray-500"
            >
              <Select.Value placeholder="Select user" />
            </Select.Trigger>
            <Select.Content>
              {#each roles as type}
                <Select.Item
                  on:click={() => {
                    userType = type.roleName;
                    userID = type.id;
                  }}
                  value={type.id}>{type.roleName}</Select.Item
                >
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="space-y-2">
          <Label for="firstName" class="block text-sm font-medium text-gray-700"
            >First Name</Label
          >
          <Input
            required
            id="firstName"
            name="firstName"
            bind:value={firstName}
            placeholder="Enter first name"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
        <div class="space-y-2">
          <Label for="lastName" class="block text-sm font-medium text-gray-700"
            >Last Name</Label
          >
          <Input
            required
            id="lastName"
            name="lastName"
            bind:value={lastName}
            placeholder="Enter last name"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
        <div class="space-y-2">
          <Label
            for="phoneNumber"
            class="block text-sm font-medium text-gray-700">Phone Number</Label
          >
          <Input
            required
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            bind:value={phoneNumber}
            placeholder="Enter phone number"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
        <div class="space-y-2">
          <Label for="mailId" class="block text-sm font-medium text-gray-700"
            >Mail ID</Label
          >
          <Input
            required
            id="mailId"
            name="mailId"
            type="email"
            bind:value={mailId}
            placeholder="Enter mail ID"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
        <div class="space-y-2">
          <Label for="password" class="block text-sm font-medium text-gray-700"
            >Password</Label
          >
          <Input
            required
            minlength={8}
            type="password"
            id="password"
            name="password"
            bind:value={password}
            placeholder="Password"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
        <div class="space-y-2">
          <Label for="cPassword" class="block text-sm font-medium text-gray-700"
            >Confirm Password</Label
          >
          <Input
            required
            minlength={8}
            type="password"
            id="cPassword"
            name="cPassword"
            bind:value={cPassword}
            placeholder="Confirm Password"
            class="w-full border border-[#F2F4F7] rounded-md px-3 py-2"
          />
        </div>
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
          on:click={handleSubmit}
          type="submit"
          class="px-4 py-2 bg-blue-500 hover:text-blue-500 hover:bg-white text-white rounded-md">Submit</Button
        >
      </div>
      <!-- </form> -->
    </div>
  </Dialog.Content>
</Dialog.Root>
