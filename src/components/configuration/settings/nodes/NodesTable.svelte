<script lang="ts">
  import Button from "@/components/ui/button/button.svelte";
  import * as Table from "@/components/ui/table";
  import { page } from "$app/stores";
  import PocketBase from "pocketbase";
  import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
  export let allUsers;
  export let data;
  export let searchText: string | null;
  let usersList;
  let userNodeSelections = [];


  // $: console.log(searchText)

  // $: console.log(filteredUsers)
  // $: console.log(filteredUsers.length)
  
  $: filteredUsers = !searchText ? allUsers : allUsers.filter(user => {
    const lowercasedFilter = searchText.toLowerCase();
    return Object.keys(user).some(key => {
      if (typeof user[key] === 'string') {
        return user[key].toLowerCase().includes(lowercasedFilter);
      }
      return false;
    });
  });
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  function handleSave() {
    PB.autoCancellation(false)
    if(data.user?.username !== usersList?.username){
      toast.error("You are not authorized to change Node Permissions!");
      return
    }
    userNodeSelections = allUsers.map((user) => {
      return {
        sessionId: user.expand.session[0].id,
        nodeId: data.nodes
          .filter((node) => user.expand.session[0].node.includes(node.id))
          .map((node) => node.id),
      };
    });


    fetch("/api/node/permissionNode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userNodeSelections),
    })
      .then((response) => response.json())
      .then((data) => {
        toast('Node Permissions Updated Successfully!')
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  onMount(async () => {
    const res = await PB.collection("users").getFullList({
      sort: "created",
    });
    usersList = res[0];
    // console.log(res[0])
    // console.log(data.user)
  });
</script>

<Table.Root class="mx-auto w-full flex flex-col">
  <Table.Header
    class="border border-[#e4e4e4] w-max border-solid bg-[#f9f9f9] "
  >
    <Table.Row class="bg-transparent flex items-center justify-between p-2">
      <Table.Head class="text-[#727272] h-full w-[200px]">User/Stores</Table.Head
      >
      {#each data.nodes as node}
        <Table.Head class="text-[#727272] h-full w-[200px] text-center">
          <!-- {node.name} -->
          {node.name.includes("_")
            ? node.name.substring(node.name.lastIndexOf("_") + 1)
            : node.name.length > 10
              ? node.name.substring(0, 10) + "..."
              : node.name}
        </Table.Head>
      {/each}
    </Table.Row>
  </Table.Header>
  <Table.Body class="pb-10">
    {#if allUsers === filteredUsers}
      {#each allUsers as user}
        <Table.Row
          class="bg-transparent cursor-pointer w-max flex items-center justify-between px-2 border-b border-x border-solid border-[#e4e4e4]"
        >
          <Table.Cell class="text-black h-full w-[200px] border-r">
            <span class="flex flex-col font-semibold text-[#3D81FC]">
              <span>
                Name: {user?.firstName} {user?.lastName}
              </span>
              <!-- <span class="text-xs">
                Id: {user.id}
              </span> -->
            </span>
          </Table.Cell>
          {#each data.nodes as node,index}
            <Table.Cell class={`text-[#727272] h-full text-sm w-[200px] text-center ${index !== data.nodes.length - 1 ? 'border-r' : ''}`}>
              <input
                type="checkbox"
                checked={user.expand.session[0].node.includes(node.id)}
                on:change={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    user.expand.session[0].node.push(node.id);
                  } else {
                    const index = user.expand.session[0].node.indexOf(node.id);
                    if (index > -1) {
                      user.expand.session[0].node.splice(index, 1);
                    }
                  }
                }}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
      {:else}
      {#each filteredUsers as user}
        <Table.Row
          class="bg-transparent cursor-pointer w-max flex items-center justify-between mt-4 px-3 rounded-lg border-2 border-solid border-[#e4e4e4]"
        >
          <Table.Cell class="text-black h-full w-[200px]">
            <span class="flex flex-col font-semibold text-primary">
            <span class="capitalize">
                Name: {user?.firstName} {user?.lastName}
              </span>
              <!-- <span class="text-xs">
                Id: {user.id}
              </span> -->
            </span>
          </Table.Cell>
          {#each data.nodes as node}
            <Table.Cell class="text-[#727272] h-full text-sm w-[200px]">
              <input
                type="checkbox"
                checked={user.expand.session[0].node.includes(node.id)}
                on:change={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked) {
                    user.expand.session[0].node.push(node.id);
                  } else {
                    const index = user.expand.session[0].node.indexOf(node.id);
                    if (index > -1) {
                      user.expand.session[0].node.splice(index, 1);
                    }
                  }
                }}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    {/if}
  </Table.Body>
</Table.Root>
<Button class="mr-auto flex bg-[#3D81FC] text-white" disabled={data.user?.username !== usersList?.username} on:click={handleSave}>Save</Button>


<style>
  input[type="checkbox"] {
    accent-color: #0070FF !important;
    transform: scale(1.25);

  }
</style>