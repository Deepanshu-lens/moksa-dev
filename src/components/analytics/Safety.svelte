<script lang="ts">
    import { ListFilter, Upload } from "lucide-svelte";
    import { Button } from "../ui/button";
    import SafetyLiveDataTable from "./table/SafetyLiveDataTable.svelte";
    import SafetyDataTable from "./table/SafetyDataTable.svelte";
    import SafetyViolationsDataTable from "./table/SafetyViolationsDataTable.svelte";
  import * as Select from "../ui/select";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    export let allStores
    let safetyData = writable([])
    let selectedStore = writable(allStores[0])
// console.log(allStores)
    onMount(async() => {
      const res = await fetch('/api/employee/getSafetyByStoreId', {
        method: 'POST',
        body: JSON.stringify({storeId: allStores})
      })
      const data = await res.json()
      safetyData.set(data)
      console.log(data)
    })

  const fruits = allStores.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));
// $: console.log($safetyData)
// $: console.log($selectedStore)
// $: console.log($safetyData.find(store => store.storeId === $selectedStore.id))
</script>


<section class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar">
  <div class="flex items-center justify-end">
    <!-- <span
      class="flex items-center border-black border-opacity-[18%] border-[1px] rounded-md dark:text-white dark:border-white"
    >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >1 Hour</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >24 Hours</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >7 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >30 Days</button
      >
      <button
        class="2xl:py-2 2xl:px-3 py-1 px-2 border-r border-black border-opacity-[18%] text-black text-sm dark:text-white dark:border-white"
        >12 Months</button
      >
      <button class="2xl:py-2 2xl:px-3 py-1 px-2 text-black text-sm dark:text-white dark:border-white"
        >Custom</button
      >
    </span> -->
    <span class="flex items-center gap-3">
<Button variant='outline' class='flex items-center gap-1'> <ListFilter size={18}/> Filters</Button>
      <Button class="flex items-center gap-1 bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        ><Upload size={18} /> Export Reports</Button
      >
    </span>
  </div>
   <div class="grid grid-cols-8 grid-rows-4 gap-4 mt-4">
    <div class='col-span-8 row-span-4 border rounded-md flex flex-col rounded-t-xl dark:border-white/[.7]'>
  <span class='rounded-t-xl w-full h-[50px] bg-[#050F40] flex items-center justify-between px-4 flex-shrink-0 '>
<p class='text-white text-lg font-semibold flex items-center gap-2'>
  Safety Procedures
  <span class='text-xs text-white bg-pink-500 rounded-md p-1'>
    Live
  </span>
</p>
      </span>
      <div class='h-full w-full'>
        <SafetyLiveDataTable/>
      </div>
    </div>
    <div class='col-span-5 row-span-4 border rounded-md flex flex-col min-h-[200px] dark:border-white/[.7]'>
        <span class='rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4 flex-shrink-0'>
<p class=' text-lg font-semibold flex items-center gap-2'>
  Safety Procedures
</p>
<Select.Root portal={null}>
          <Select.Trigger
            class="w-[100px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg dark:bg-transparent"
          >
            <Select.Value placeholder={$selectedStore?.name} />
          </Select.Trigger>
               <Select.Content class="max-h-[200px] overflow-y-auto">
            <Select.Group>
              {#each fruits as fruit}
                <Select.Item on:click={()=> selectedStore.set({id: fruit.value, name: fruit.label})}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </span>
      <div class='h-full w-full'>
        <!-- {#if $safetyData !== [] && $safetyData?.data?.data.length > 0}
        <SafetyDataTable safetyData={$safetyData?.data?.data}/>
        {:else}
<p class='text-center text-gray-500'>No data found</p>
{/if} -->
 {#if $safetyData.length > 0}
    {#if $safetyData.find(store => store.storeId === $selectedStore.id)?.employees.data.data.length > 0}
      <SafetyDataTable safetyData={$safetyData.find(store => store.storeId === $selectedStore.id).employees.data.data}/>
    {:else}
      <p class='text-center text-gray-500'>No data found for the selected store</p>
    {/if}
  {:else}
    <p class='text-center text-gray-500'>No data available</p>
  {/if}
      </div>
    </div>
    <div class='col-span-3 row-span-4 border rounded-md flex flex-col min-h-[200px] dark:border-white/[.7]'>
         <span class='rounded-t-xl w-full h-[50px] bg-transparent flex items-center justify-between px-4 flex-shrink-0'>
<p class=' text-lg font-semibold flex items-center gap-2'>
  Employee With SOP Violations
</p>
      </span>
      <div class='h-full w-full'>
        <!-- {#if $safetyData !== [] && $safetyData?.data?.data.length > 0}
        <SafetyViolationsDataTable safetyData={$safetyData?.data?.data}/>
        {:else}
<p class='text-center text-gray-500'>No data found</p>
{/if} -->
{#if $safetyData.length > 0}
    {#if $safetyData.find(store => store.storeId === $selectedStore.id)?.employees.data.data.length > 0}
      <SafetyViolationsDataTable safetyData={$safetyData.find(store => store.storeId === $selectedStore.id).employees.data.data}/>
    {:else}
      <p class='text-center text-gray-500'>No data found for the selected store</p>
    {/if}
  {:else}
    <p class='text-center text-gray-500'>No data available</p>
  {/if}

      </div>
    </div>
</div>
  </section>