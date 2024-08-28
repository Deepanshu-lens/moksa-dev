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


  let dialogOpen = false;
  export let data;
  export let token

  let firstName = data.firstName;
  let lastName = data.lastName;
  let phoneNumber = data.mobile_number;
  let mailId = data.email;
  let lensId = data.lensId;
  let moksaId = data.moksaId;
  let userType = data.designation
  let userID
  let allStores =[]
  let curStores=[]

  $:console.log(data)
  console.log(token)
  let nodes: any[] = [];

  let roles: any[] = [];

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

async function initiate(){
  PB.autoCancellation(false);
    const res = await PB.collection("roles").getFullList();
    const allStoress =await fetch('https://api.moksa.ai/store/getAllStoresForDropdown', {
            method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
    const currentStores = await fetch(`https://api.moksa.ai/store/getUserStoreDetailsByUserId/${moksaId}`,{
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
    const allStoresData = await allStoress.json();
    const currentStoresData = await currentStores.json();
    console.log(allStoresData)
    console.log(currentStoresData)
    allStores = allStoresData.data.data
    curStores = currentStoresData.data[0].stores
    roles = res;

}

let initiatePromise: Promise<void> | null = null;

$: if (dialogOpen) {
  initiatePromise = initiate();
}




  const handleSubmit = async () => {

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
    console.log(moksa);
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


</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    closeButton={false}
    class="sm:max-w-[600px] bg-white shadow-lg rounded-xl"
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
          <Select.Root bind:value={userType}>
            <Select.Trigger
              class="w-full border border-[#F2F4F7] rounded-md px-3 py-2 text-gray-500"
            >
              <Select.Value placeholder={userType} />
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
  <Label class="block text-sm font-medium text-gray-700">Assigned Stores</Label>
  <div class="grid grid-cols-3 px-1 gap-2 max-h-[150px] overflow-y-auto">
{#if allStores.length > 0 && typeof curStores === 'object'}
      {#each allStores as store}
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          value={store.id}
          checked={curStores.some(s => s.storeId === store.id)}
          class="form-checkbox h-4 w-4 text-blue-600"
        />
        <span class="text-sm text-gray-700">{store.name}</span>
      </label>
    {/each}
    {:else}
    <p>Loading..</p>
  {/if}
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
          class="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</Button
        >
      </div>
      <!-- </form> -->
    </div>
  </Dialog.Content>
</Dialog.Root>


<style>
    input[type="checkbox"]{
        accent-color: #0175ff;
    }
</style>