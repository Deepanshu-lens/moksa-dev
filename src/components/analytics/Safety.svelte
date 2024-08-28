<script lang="ts">
    import { ListFilter, Upload } from "lucide-svelte";
    import { Button } from "../ui/button";
    import SafetyLiveDataTable from "./table/SafetyLiveDataTable.svelte";
    import SafetyDataTable from "./table/SafetyDataTable.svelte";
    import SafetyViolationsDataTable from "./table/SafetyViolationsDataTable.svelte";
  import * as Select from "../ui/select";
    import { onDestroy, onMount } from "svelte";
  import { io } from "socket.io-client";
    import { writable } from "svelte/store";
    export let allStores
    export let token:string
    let safetyData = writable([])
    let selectedStore = writable(allStores[0])

    onMount(async() => {
      const res = await fetch('/api/employee/getSafetyByStoreId', {
        method: 'POST',
        body: JSON.stringify({storeId: allStores})
      })
      const data = await res.json()
      safetyData.set(data)
      console.log(data)
    })

  const fruits = allStores?.map((store: any) => ({
    value: store.id,
    label: store.name,
  }));

  let sockets: { [key: number]: any } = {};
let liveData = writable([]);

function setupSocketForAllStores() {
  allStores.forEach((store: any) => {
    setupSocket(store.id);
  });
}

function setupSocket(storeId: number) {
  const userID = 8
  if (sockets[storeId]) {
    sockets[storeId].disconnect();
  }

  sockets[storeId] = io("https://api.moksa.ai", {
    withCredentials: true,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
  });

  const socket = sockets[storeId];

  socket.on("error", (err) => {
    console.log(`error for store ${storeId}:`, err);
  });

  socket.on("connect", () => {
    console.log(`connected for store ${storeId}`);
    socket.emit("joinUser", userID);
    socket.emit("joinStore", storeId);
  });
  
  socket.on(`employee_safety_store_${storeId}`,(data)=>{
    console.log(`Received employee_safety for store ${storeId}:`, data);
    liveData.update((currentData) => {
      return [{ storeId, ...data }, ...currentData].slice(0, 100);
    });
})

  socket.on("disconnect", () => {
    console.log(`disconnected for store ${storeId}`);
  });
}

onMount(() => {
  setTimeout(() => {
    setupSocketForAllStores();
  }, 500);
});

$: console.log($liveData)

onDestroy(() => {
  Object.values(sockets).forEach((socket) => {
    console.log('disconnecting socket')
    socket.disconnect();
  });
});
</script>


<section class="w-full p-4 flex flex-col max-h-[calc(100vh-75px)] overflow-y-auto hide-scrollbar">
  <div class="flex items-center justify-end">
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
        {#if $liveData.length > 0}
        <SafetyLiveDataTable data={$liveData}/>
        {:else}
        <p class='text-center text-gray-500 min-h-[350px] py-4'>No Live Data found</p>
        {/if}
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
              {#if fruits.length > 0}
              {#each fruits as fruit}
                <Select.Item on:click={()=> selectedStore.set({id: fruit.value, name: fruit.label})}
                  class="px-1"
                  value={fruit.value}
                  label={fruit.label}>{fruit.label}</Select.Item
                >
              {/each}
              {:else}
              <Select.Item
                class="px-1"
                value="0"
                label="No Stores Found">No Stores Found</Select.Item
              >
              {/if}
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