<script lang="ts">
  import { onMount } from "svelte";
  import PocketBase from "pocketbase";
  import { page } from "$app/stores";
  import GroupNodeCard from "@/components/cards/GroupNodeCard.svelte";
  import { writable, derived } from "svelte/store";
  import { toast } from "svelte-sonner";
  import GroupCameraCard from "@/components/cards/GroupCameraCard.svelte";
  import { ChevronDown } from "lucide-svelte";
  import * as Select from "@/components/ui/select";
  import * as AlertDialog from "@/components/ui/alert-dialog";
    import Input from "@/components/ui/input/input.svelte";

  let showRightPanel: boolean = true;
  let selectedP: number = 1;
  let next: boolean = false;
  let currNode: number | null = null;
  let groupName: string = "";
  export let session;
  export let data;

  const checkedIndices = writable<number[]>([]);

  function handleCheckboxChange(index: number, checked: boolean) {
    checkedIndices.update((indices) => {
      if (checked) {
        return [...indices, index];
      } else {
        return indices.filter((i) => i !== index);
      }
    });
  }

  function selectCameras() {
    // if ($checkedIndices.length > 0) {
      checkedCameraIds.update((ids) => {
        const newIds = $checkedIndices.flatMap((index) =>
          data[index].camera.map((camera) => camera.id),
        );
        return [...new Set([...ids, ...newIds])];
      });
      next = true;
      selectedP = 2;
    // } 
    // else {
    //   toast.error("Please select at least one node to continue!");
    // }
  }

  function handleNodeSelect(index: number) {
    // console.log(index);
    currNode = index;
  }

  const checkedCameraIds = writable<string[]>([]);

  function handleCameraCheckboxChange(cameraId: string, checked: boolean) {
    checkedCameraIds.update((ids) => {
      if (checked) {
        return [...ids, cameraId];
      } else {
        return ids.filter((id) => id !== cameraId);
      }
    });
  }


  async function createCustomGroup() {
    console.log($checkedCameraIds);

    await fetch(`/api/node/createCustomGroup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameraIds: $checkedCameraIds,
        session: session.id,
        nodeName: groupName
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if(data.success){
          toast.success("Group created successfully");
        }else{
          toast.error("Failed to create group");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

</script>

<section
  class="right h-[calc(100vh-75px)] w-full flex-1 bg-background flex flex-row-reverse"
>
  <div
    class={`h-[calc(100vh-75px)] ${showRightPanel ? "w-1/4 max-w-72 " : "w-0"} flex-shrink-0 transition-width ease-in-out duration-500 dark:border-[#292929] border-x-[1px] relative`}
  >
    <div class="border-b py-1">
      <span
        class="flex items-center bg-[#DADFEA] p-0.5 justify-center rounded-lg border-black/[.13] border-solid border-[1px] w-[94%] h-[40px] mx-auto my-2"
      >
        <button
          on:click={() => {selectedP = 1;next=false}}
          class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${selectedP === 1 ? "text-white bg-[#050F41]" : "bg-[#DADFEA]"}`}
          >Store</button
        >
        <button
          on:click={() => {selectedP = 2;next=true}}
          class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${selectedP === 2 ? "text-white bg-[#050F41]" : "bg-[#DADFEA]"}`}
          >Cameras</button
        >
      </span>
    </div>

    {#if next === false}<div
        class="flex flex-col gap-4 h-[calc(100vh-210px)] overflow-y-auto hide-scrollbar mt-4"
      >
        {#each data as node, index}
          <article
            class="rounded-md bg-[#DADFEA] py-3 px-4 flex items-center gap-5 w-[94%] mx-auto"
          >
            <input
              type="checkbox"
              on:change={(e) => handleCheckboxChange(index, e.target.checked)}
            />
            <span class="flex flex-col">
              <h4 class="text-black font-medium">{node.name}</h4>
              <p class="text-sm text-[#3D81FC] font-medium">
                {node.camera.length} Cameras
              </p>
            </span>
          </article>
        {/each}
      </div>
    {:else}
      <div
        class="flex flex-col gap-4 h-[calc(100vh-210px)] overflow-y-auto hide-scrollbar mt-4"
      >
        <div class="relative w-[94%] mx-auto">
          <Select.Root portal={null}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Select a Store" />
            </Select.Trigger>
            <Select.Content>
              <Select.Group>
                <Select.Label>Stores</Select.Label>
                {#each data as node, index}
                  <Select.Item
                    value={index}
                    label={node.name}
                    on:click={() => handleNodeSelect(index)}
                    >{node.name}</Select.Item
                  >
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </div>
        {#if currNode !== null}
          {#if data[currNode].camera.length > 0}
            {#each data[currNode].camera as camera}
              <article
                class="rounded-md bg-[#DADFEA] py-3 px-4 flex items-center gap-5 w-[94%] mx-auto"
              >
                <input
                  type="checkbox"
                  checked={$checkedIndices.includes(currNode) ||
                    $checkedCameraIds.includes(camera.id)}
                  on:change={(e) =>
                    handleCameraCheckboxChange(camera.id, e.target.checked)}
                />
                <span class="flex flex-col">
                  <h4 class="text-black font-medium">{camera?.name}</h4>
                  <p class="text-sm text-[#3D81FC] font-medium">
                    {data[currNode].name}
                  </p>
                </span>
              </article>
            {/each}
          {:else}
            <p class="text-sm text-[#333] font-medium mx-auto">
              No cameras found for this store
            </p>
          {/if}
        {/if}
      </div>
    {/if}
    <div class=" py-1 w-full flex items-center justify-between">
      {#if next === false}<button
          class="bg-[#3D81FC] p-2 px-4 rounded-lg w-[94%] mx-auto text-white"
          on:click={() => selectCameras()}
        >
          Continue
        </button>{:else}
        <!-- on:click={() => createCustomGroup()} -->
        <AlertDialog.Root >
  <AlertDialog.Trigger 
          class="bg-[#3D81FC] p-2 px-4 rounded-lg w-[94%] mx-auto text-white"
          >
          Create Group
</AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you sure you want to create this group?</AlertDialog.Title>
    </AlertDialog.Header>
    <div class="flex items-center gap-4">
        <p class="text-sm text-[#333] font-medium">
            Group Name
        </p>
        <Input bind:value={groupName} class='focus:outline-none focus:border-[#3d81fc] focus:ring-[#3D81fc]' placeholder='Enter Custom Group Name' />
    </div>
    <AlertDialog.Footer>

      <AlertDialog.Cancel on:click={() => {selectedP = 1; groupName = ""; next=false; checkedCameraIds.set([]); checkedIndices.set([]);}}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action class='bg-[#3D81FC]' on:click={() => createCustomGroup()}>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
        
      {/if}
    </div>
  </div>
  {#if next === false}
    <div
      class="w-full h-auto grid grid-cols-4 grid-rows-3 gap-y-2 place-items-center"
    >
      {#each data as node, index}
        <GroupNodeCard {node} {index} {checkedIndices} />
      {/each}
    </div>
  {:else}
    <div
      class="w-full h-auto relative grid grid-cols-4 grid-rows-3 gap-y-2 place-items-center"
    >
      {#if currNode !== null}
        {#if data[currNode].camera.length > 0}
          {#each data[currNode].camera as cam, index}
            <GroupCameraCard
              {cam}
              {index}
              {checkedCameraIds}
              nodename={data[currNode].name}
            />
          {/each}
        {:else}
          <p class="text-xl text-[#333] font-medium absolute top-4 left-4">
            No cameras found for this store
          </p>
        {/if}
      {:else}
        <p class="text-xl text-[#333] font-medium absolute top-4 left-4">
          Select a store to continue
        </p>
      {/if}
    </div>
  {/if}
</section>

<style>
  article {
    box-shadow: 0px 5.4px 16.21px 0px #00000014;
  }

  input[type="checkbox"] {
    accent-color: #050f41;
  }
</style>
