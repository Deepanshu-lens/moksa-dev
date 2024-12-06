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
  export let token;

  let firstName = data.firstName;
  let lastName = data.lastName;
  let phoneNumber = data.mobile;
  let mailId = data.email;
  let lensId = data.lensId;
  let moksaId = data.moksaId;
  let userType = data.designation;
  let userID;
  let allStores = [];
  let curStores = [];

  // $:console.log(data)
  // console.log(token)
  let nodes: any[] = [];

  let roles: any[] = [];

  const PB = new PocketBase(`https://server.moksa.ai`);

  async function initiate() {
    PB.autoCancellation(false);
    const res = await PB.collection("roles").getFullList();
    const allStoress = await fetch(
      "https://dev.api.moksa.ai/store/getAllStoresForDropdown",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const currentStores = await fetch(
      `https://dev.api.moksa.ai/store/getUserStoreDetailsByUserId/${moksaId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const allStoresData = await allStoress.json();
    const currentStoresData = await currentStores.json();
    // console.log(allStoresData.data)
    // console.log(currentStoresData)
    allStores = allStoresData.data.data;
    // console.log(allStores)
    // curStores = currentStoresData.data[0].stores
    curStores = currentStoresData.data[0].stores.map((store) => store.storeId);
    console.log(res);
    roles = res;

    userID = res.find(
      (role) => role.roleName.toLowerCase() === data.designation.toLowerCase(),
    )?.id;
  }

  let initiatePromise: Promise<void> | null = null;

  $: if (dialogOpen) {
    initiatePromise = initiate();
  }

  const handleSubmit = async () => {
    try {
      PB.autoCancellation(false);
      const U = await PB.collection("users").getFullList({
        filter: `id="${data.lensId}"`,
      });

      if (!U || U.length === 0) {
        throw new Error("User not found");
      }

      const nodes = [];
      for (const store of curStores) {
        const storeNodes = await PB.collection("node").getFullList({
          filter: `moksaId="${store}"`,
        });
        if (storeNodes.length > 0) {
          nodes.push(storeNodes[0].id);
        }
      }
      console.log("user session", U[0].session);
      console.log("user session", U[0].session[0]);
      const sessupdate = await PB.collection("session").update(
        U[0].session[0],
        {
          node: nodes,
        },
      );

      console.log(sessupdate);

      // await PB.collection("users").update(data.lensId, {
      //   first_name: firstName,
      //   last_name: lastName,
      //   email: mailId,
      //   role: userID,
      //   phoneNumber: phoneNumber,
      // });

      const updateMoksaUser = await fetch(
        `https://dev.api.moksa.ai/auth/updateUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: mailId,
            role: userType,
            mobile_number: phoneNumber,
            id: data.moksaId,
          }),
        },
      );

      console.log(updateMoksaUser);

      if (!updateMoksaUser.ok) {
        throw new Error("Failed to update Moksa user");
      }

      for (const node of nodes) {
        await PB.collection("node").update(node, {
          "session+": U[0].session,
        });
      }

      const filteredCurStores = curStores.filter((id) => id !== 0);
      const updateMoksaUserStores = await fetch(
        `https://dev.api.moksa.ai/store/userStore/updateUserByUserId`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: data.moksaId,
            storeIds: filteredCurStores,
          }),
        },
      );

      if (!updateMoksaUserStores.ok) {
        throw new Error("Failed to update Moksa user stores");
      }

      toast.success("User updated successfully");
      dialogOpen = false;
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      dialogOpen = false;
      toast.error("Failed to update user. Please try again.");
      return false;
    }
  };

  // $: console.log(typeof curStores);
  // $: console.log(curStores);
  // $: console.log(allStores);
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
          >Modify User</Dialog.Title
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
          <Label class="block text-sm font-medium text-gray-700"
            >Assigned Stores</Label
          >
          <div
            class="grid grid-cols-3 px-1 gap-2 max-h-[150px] overflow-y-auto"
          >
            {#if allStores.length > 0 && typeof curStores === "object"}
              {#each allStores as store}
                <label class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={store.id}
                    checked={curStores.includes(store.id)}
                    on:change={(e) => {
                      if (e.target.checked) {
                        curStores = [...curStores, store.id];
                      } else {
                        curStores = curStores.filter((id) => id !== store.id);
                      }
                    }}
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
            on:click={() => {
              handleSubmit();
              console.log("clicked");
            }}
            type="button"
            class="px-4 py-2 bg-blue-500 text-white hover:text-blue-500 hover:bg-white  rounded-md"
            >Submit</Button
          >
        </div>
        <!-- </form> -->
      </div>
    </div></Dialog.Content
  >
</Dialog.Root>

<style>
  input[type="checkbox"] {
    accent-color: #0175ff;
  }
</style>
