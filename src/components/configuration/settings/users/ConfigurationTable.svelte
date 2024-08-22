<script>
    import { Button } from "@/components/ui/button";
  import * as Table from "@/components/ui/table/index";
  export let allUsers;
  import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
  import {get,writable} from 'svelte/store';
  let configurationFeatures = [];
  let userFeatures= writable([]);


  onMount(async () => {
    const configuration = await fetch("/api/features/configuration");
    if (!configuration.ok) {
      throw new Error(
        `failed to fetch playback features, HTTP error! status: ${configuration.status}`,
      );
    }
    const p = await configuration.json();
    configurationFeatures = p?.features?.items;
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
    console.log(userId, featureId, isChecked);
    let currentFeatures = get(userFeatures);
    const userIndex = currentFeatures.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      const user = currentFeatures[userIndex];
      if (isChecked) {
        if (!user.features.includes(featureId)) {
          user.features.push(featureId);
          console.log("first");
        }
      } else {
        user.features = user.features.filter((f) => f !== featureId);
        console.log("second");
      }
      userFeatures.update((features) => {
        features[userIndex] = user;
        return features;
      });
    }
  }

   function handleFeaturesUpdate() {
    fetch('/api/features/updateFeature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify($userFeatures)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      toast('Permissions Updated for Configuration page!')
    })
    .catch((error) => {
      console.error('Error:', error);
      toast.error('Error in updating permissions!')
    });
  }


</script>

  <Table.Root 
  class="mx-auto h-full w-full flex flex-col mt-1 max-w-[calc(100vw-8.3rem)] max-h-[calc(100vh-310px)] hide-scrollbar overflow-x-auto"
  >
    <Table.Header
      class="border border-[#e4e4e4] border-solid  bg-[#f9f9f9] min-w-full w-max"
    >
      <Table.Row class="bg-transparent flex items-center justify-between p-2">
         <Table.Head class="text-[#727272] h-full w-[50px]"
          ><input type="checkbox" name="" id=""></Table.Head
        >
        <Table.Head class="text-[#727272] h-full w-[200px]">User Name</Table.Head>
        {#if configurationFeatures}
        {#each configurationFeatures as feature}
        <Table.Head class="text-[#727272] h-full w-[200px]">{feature.feature}</Table.Head>
        {/each}
        {/if}
      </Table.Row>
    </Table.Header>
    <Table.Body
      class="pb-10"
    >

    {#each allUsers as user}
      <Table.Row
        class="bg-transparent cursor-pointer flex items-center justify-between gap-4 px-2 border-b border-solid border-x border-[#e4e4e4] w-max min-w-full"
      >
        <Table.Cell class="text-black h-full w-[50px]">
            <input type="checkbox">
            </Table.Cell>
        <Table.Cell class="text-black h-full w-[200px]"
          > <span class="flex flex-col font-semibold text-primary">
            <span class="capitalize">
               Name: {user?.firstName} {user?.lastName}
              </span>
              <!-- <span class="text-xs">
                Id: {user.id}
              </span> -->
            </span>
        </Table.Cell>
          {#each configurationFeatures as feature,index}
        <Table.Cell class={`text-[#727272] h-full w-[180px] ${index !== configurationFeatures.length - 1 ? 'border-r' : ''}`}>
 <input
              type="checkbox"
              checked={user?.features
                ? user?.features.includes(feature.id)
                : false}
              on:change={(e) =>
                handleFeatureChange(user.id, feature.id, e.target.checked)}
            />
        </Table.Cell>
        {/each}
      </Table.Row>
      {/each}
    </Table.Body>
    <Button on:click={handleFeaturesUpdate} class="mr-auto bg-[#3D81FC] text-white">Save</Button>
  </Table.Root>

<style>
  input[type="checkbox"] {
    accent-color: #0070FF !important;
    transform: scale(1.25);

  }
</style>