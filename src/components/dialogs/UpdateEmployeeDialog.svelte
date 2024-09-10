<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Button } from "@/components/ui/button";
  import { X } from "lucide-svelte";


  let dialogOpen = false;
  export let token;
  export let storeId;
  export let employeeData;
  export let firstName;
  export let lastName;
  export let role;
  export let id ;
//   let newEmp = {}

  const validateFields = () => {
    const fields = [
      { name: "First Name", value: firstName },
      { name: "Last Name", value: lastName },
      { name: "Role", value: role },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        toast.error(`${field.name} is required`);
        return false;
      }
    }
    return true;
  };

  $: {
    console.log(firstName, lastName, role, id, storeId)
  }

//   $: console.log(token)
//   $: console.log($employeeData)

  const handleSubmit = async () => {
    if (!validateFields()) {
        toast.error("Please fill all the fields");
        return;
    } 

//     {{url}}/store/storeEmployee/update
// method:post
// {"id":"",//employee id mandatory 
//  "store_id": "2",
//   "first_name": "nitya",
//   "last_name": "P",
//   "role": "manager",
//   "photo": ""
// }

    const res = await fetch(`https://api.moksa.ai/store/storeEmployee/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        store_id: storeId,
        first_name: firstName,
        last_name: lastName,
        role: role,
        photo: "",
      }),
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      toast.success("Employee updated successfully");
 let newEmp;
      $employeeData.data = $employeeData.data.filter(employee => employee.id !== id);      newEmp = { id: data.data.id, first_name: firstName, last_name: lastName, role: role },
      $employeeData.data.push(newEmp)
      dialogOpen = false;
    } else {
      toast.error("Failed to update employee");
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
      <div class="space-y-4">
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
            for="role"
            class="block text-sm font-medium text-gray-700">Employee Role</Label
          >
          <Input
            required
            id="role"
            name="role"
            bind:value={role}
            placeholder="Enter employee role"
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
          class="px-4 py-2 bg-blue-500 hover:text-blue-500 hover:bg-white text-white rounded-md"
          >Submit</Button
        >
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
