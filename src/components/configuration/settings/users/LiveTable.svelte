<script>
  export let allUsers;
  export let liveFeatures;
  import Button from "@/components/ui/button/button.svelte";
  import * as Table from "@/components/ui/table/index";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  let userFeatures = writable([]);

  import { get } from "svelte/store";

  onMount(() => {
    initializeUserFeatures();
  });

  function initializeUserFeatures() {
    const features = allUsers.map((user) => ({
      id: user.id,
      features: user.features ? [...user.features] : [],
    }));
    userFeatures.set(features);
  }

  function handleFeatureChange(userId, featureId, isChecked) {
    let currentFeatures = get(userFeatures);
    if (currentFeatures.length === 0) {
      initializeUserFeatures();
      currentFeatures = get(userFeatures);
    }
    const userIndex = currentFeatures.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      const user = currentFeatures[userIndex];
      if (isChecked) {
        if (!user.features.includes(featureId)) {
          user.features.push(featureId);
        }
      } else {
        user.features = user.features.filter((f) => f !== featureId);
      }
      userFeatures.update((features) => {
        features[userIndex] = user;
        return features;
      });
    }
  }

  function handleLivefeaturesUpdate() {
    console.log("first", $userFeatures);
    fetch("/api/features/addFeature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify($userFeatures),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        toast("Permissions Updated for Live page!");
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error in updating permissions!");
      });
  }
</script>

<Table.Root
  class="mx-auto h-full w-full flex flex-col max-w-[calc(100vw-8.3rem)] mt-1 max-h-[calc(100vh-310px)] hide-scrollbar overflow-x-auto"
>
  <Table.Header
    class="border border-[#e4e4e4] border-solid bg-[#f9f9f9] w-max min-w-full"
  >
    <Table.Row class="bg-transparent flex items-center justify-between p-2">
      <Table.Head class="text-[#727272] h-full w-[50px]"
        ><input type="checkbox" name="" id="" /></Table.Head
      >
      <Table.Head class="text-[#727272] h-full w-[200px]">User Name</Table.Head>
      {#if liveFeatures}
        {#each liveFeatures as feature}
          <Table.Head class="text-[#727272] h-full w-[200px]"
            >{feature.feature}</Table.Head
          >
        {/each}
      {/if}
    </Table.Row>
  </Table.Header>
  <Table.Body class="pb-10">
    {#each allUsers as user}
      <Table.Row
        class="bg-transparent cursor-pointer flex items-center justify-between gap-4 px-2 bordeb border-x border-solid border-[#e4e4e4] w-max min-w-full"
      >
        <Table.Cell class="text-black h-full w-[50px]">
          <input type="checkbox" />
        </Table.Cell>
        <Table.Cell class="text-black h-full w-[200px]">
          <span class="flex flex-col font-semibold text-[#3D81FC]">
            <span class="capitalize">
              Name: {user?.firstName} {user?.lastName}
            </span>
          </span>
        </Table.Cell>
        {#each liveFeatures as feature}
          <Table.Cell class={`text-[#727272] h-full text-sm w-[183.3px] ${index !== data.nodes.length - 1 ? 'border-r' : ''}`}>
            <input
              type="checkbox"
              checked={allUsers && user?.features
                ? user?.features?.some((f) => f === feature?.id)
                : false}
              on:change={(e) =>
                handleFeatureChange(user.id, feature.id, e.target.checked)}
            />
          </Table.Cell>
        {/each}
      </Table.Row>
    {/each}
  </Table.Body>
  <Button class="mr-auto bg-[#3D81FC] text-white" on:click={handleLivefeaturesUpdate}>save</Button>
</Table.Root>


<style>
  input[type="checkbox"] {
    accent-color: #0070FF !important;
    transform: scale(1.25);

  }
</style>