<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Button } from "@/components/ui/button";

  export let empId;
  export let token;
  export let firstName;
  export let lastName;
  export let employeeData;
  let dialogOpen: boolean = false;

  $: console.log(empId, token, firstName, lastName);
  $: console.log($employeeData.data);

  const deleteUser = async () => {
    try {
      const res = await fetch(
        `https://dev.api.moksa.ai/store/storeEmployee/deleteEmployee/${empId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      console.log(data);
      toast.success("Employee deleted successfully");
      $employeeData.data = $employeeData.data.filter(
        (employee) => employee.id !== empId
      );
      dialogOpen = false;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete employee. Please try again.");
      dialogOpen = false;
    }
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[450px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Delete Employee : {firstName} {lastName}</Dialog.Title>
    </Dialog.Header>
    <div class="grid grid-cols-2">
      <div class="col-span-2 dark:text-white text-black">Are you sure ?</div>
    </div>
    <Dialog.Footer>
      <span class="flex items-center gap-4">
        <Button
          on:click={() => {
            dialogOpen = false;
          }}
          variant="secondary">Cancel</Button
        >
        <Button on:click={deleteUser} variant="destructive">Delete</Button>
      </span>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
