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
  let firstName = "";
  let lastName = "";
  let phoneNumber = "";
  let mailId = "";
  let password = "";
  let cPassword = "";
  export let user;

  let roles: any[] = []

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  onMount(async() => {
    PB.autoCancellation(false)
    const res = await PB.collection("roles").getFullList()
    console.log(res)
    roles = res
  })

  const handleSubmit = () => {
    if (password !== cPassword) {
      toast.error("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleResult = (result) => {
    if (result.type === 'success') {
      toast.success("User added successfully");
      dialogOpen = false;
    } else if (result.type === 'failure') {
      toast.error(result.data?.error || "Failed to add user");
    }
  };

  // const onSubmit = async () => {
  //   PB.autoCancellation(false)

  //   if(password !== cPassword) {
  //     toast.error("Passwords dont match");
  //     return;
  //   }
  //   console.log({ userType, firstName, lastName, phoneNumber, mailId });
  //   console.log(user.id)
  //   try {
  //      const session = await PB.collection("session")
  //       .create({
  //         owned: true,
  //       })
  //       .catch((e) => {
  //         console.error("[Session Create Error]: ", e);
  //       });

  //      await PB.collection("users").create({
  //       firstName: firstName,
  //       lastName: lastName,
  //       email: mailId,
  //       role: userType,
  //       session: session?.id,
  //       password: password,
  //       passwordConfirm: cPassword,
  //     }).then(async (res) => {
  //       console.log(res)
  //         await fetch(`https://dev.api.moksa.ai/auth/createUserWithPocketbase`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         first_name: firstName,
  //         last_name: lastName,
  //         email:mailId,
  //         password,
  //         lensId: res?.id,
  //         role: 'user'
  //       })
  //     }).then(res => {
  //       console.log(res)
  //     }).catch(e => {
  //       console.log(e)
  //     })
  //     }).catch((e) => {
  //       console.error("[User Create Error]: ", e);
  //     })
  //   } catch (error) {
  //     console.log(error)
  //   }
  //   toast.success("User added successfully");
  //   dialogOpen = false;
  // }
</script>

<Dialog.Root bind:open={dialogOpen} >
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content closeButton={false} class="sm:max-w-[460px] bg-white shadow-lg rounded-xl">
    <div class="px-4 py-2">
      <Dialog.Header class='relative'>
        <Dialog.Title class="text-2xl font-semibold mb-6">Add New User</Dialog.Title>
        <button class=" absolute -top-1 right-4 p-2 grid place-items-center rounded-full text-[#E71D36] bg-[#E71D36]/15 cursor-pointer" on:click={() => dialogOpen = false}>
            <X class="h-4 w-4" />
        </button>
      </Dialog.Header>
      <form method="POST" action="?/createUser" use:enhance={() => {
        return ({ result }) => handleResult(result);
      }} on:submit|preventDefault={handleSubmit}>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="userType" class="block text-sm font-medium text-gray-700">User Type</Label>
            <Select.Root bind:value={userType}>
              <Select.Trigger id="userType" name="userType" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2 text-gray-500">
                <Select.Value placeholder="Select user" />
              </Select.Trigger>
              <Select.Content>
                {#each roles as type}
                  <Select.Item on:click={() => userType = type.id} value={type.id}>{type.roleName}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
                <div class="space-y-2">
                  <Label for="firstName" class="block text-sm font-medium text-gray-700">First Name</Label>
                  <Input id="firstName" name="firstName" bind:value={firstName} placeholder="Enter first name" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
                </div>
          <div class="space-y-2">
            <Label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</Label>
            <Input id="lastName" name="lastName" bind:value={lastName} placeholder="Enter last name" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" bind:value={phoneNumber} placeholder="Enter phone number" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="mailId" class="block text-sm font-medium text-gray-700">Mail ID</Label>
            <Input id="mailId" name="mailId" type="email" bind:value={mailId} placeholder="Enter mail ID" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="password" class="block text-sm font-medium text-gray-700">Password</Label>
            <Input type='password' id="password" name="password" bind:value={password} placeholder="Password" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
          <div class="space-y-2">
            <Label for="cPassword" class="block text-sm font-medium text-gray-700">Confirm Password</Label>
            <Input type='password' id="cPassword" name="cPassword" bind:value={cPassword} placeholder="Confirm Password" class="w-full border border-[#F2F4F7] rounded-md px-3 py-2" />
          </div>
        </div>
       <div class="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="outline" on:click={() => dialogOpen = false} class="px-4 py-2 border border-[#F2F4F7] rounded-md text-gray-700">Cancel</Button>
          <Button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</Button>
        </div>
      </form>
    </div>
   
  </Dialog.Content>
</Dialog.Root>
