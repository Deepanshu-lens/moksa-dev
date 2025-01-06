<script lang="ts">
  import PocketBase from "pocketbase";
  import * as Dialog from "@/components/ui/dialog";
  import { toast } from "svelte-sonner";
  import { Button } from "@/components/ui/button";
  import pb from "@/lib/pb";

  export let data;
  export let token;
  let dialogOpen: boolean = false;

  // $: if (dialogOpen) {
  //   console.log(data);
  // }

  const deleteUser = async () => {
    try {
      const del = await fetch(
        `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/delete/${data.moksaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await del.json();
      console.log(res);

      const pbdel = await pb.collection("users").delete(data.lensId);
      console.log(pbdel);

      toast.success("User deleted successfully");
      // addUserLogs(`User deleted: ${data.username} (Moksa ID: ${data.moksaId})`);
      dialogOpen = false;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[450px] z-[70] scale-90 sm:scale-100">
    <Dialog.Header>
      <Dialog.Title>Delete user : {data?.username}</Dialog.Title>
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
