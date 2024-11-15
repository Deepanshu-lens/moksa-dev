<script lang="ts">
  import StoresDataTable from "./table/StoresDataTable.svelte";
  import { Button } from "@/components/ui/button";
  import {
    ListFilter,
    Upload,
    Search,
    ShoppingBag,
    Users,
    Camera,
    X,
  } from "lucide-svelte";
  import Input from "../ui/input/input.svelte";
  import { onMount } from "svelte";
  import * as Select from "../ui/select";
  import { writable } from "svelte/store";
  import Spinner from "../ui/spinner/Spinner.svelte";
  import AddStoreDialog from "../dialogs/AddStoreDialog.svelte";
  import * as DropdownMenu from "@/components/ui/dropdown-menu";
  import { page } from "$app/stores";
  import PocketBase from "pocketbase";

  let cardData = writable([]);
  export let allStores: any[] = [];
  export let theftandcamera: any[] = [];
  export let nodes;
  export let user;
  export let token: string;
  const PB = new PocketBase(`https://server.moksa.ai`);

  onMount(async () => {
    const res = await fetch("/api/store/getStoreDetails", {
      method: "POST",
      body: JSON.stringify({
        storeId: allStores.filter((store) => store.id !== -1),
      }),
    });
    const data = await res.json();
    // console.log(data);
    cardData.set(data);
  });

  // $: console.log("nodes", nodes);

  const refreshStoreData = async () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    const oneWeekAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneWeekAgo.setDate(today.getDate() - 7);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const theftCamera = await fetch(
      `https://api.moksa.ai/store/getAllStoresWithTheftAndCameraDetails/1/100/${formatDate(oneYearAgo)}/${formatDate(today)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const stores = await fetch(
      "https://api.moksa.ai/store/getAllStoresForDropdown",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          enableallstores: "true",
        },
      },
    );

    const updatedNodes = await PB.collection("node").getFullList({
      filter: `session~"${$page.params.slug}"`,
    });
    const data = await theftCamera.json();
    const storeData = await stores.json();
    theftandcamera = data?.data?.data === undefined ? [] : data?.data?.data;
    allStores =
      storeData?.data?.data === undefined ? [] : storeData?.data?.data;
    nodes = updatedNodes;
    console.log("updated theft and camera", data);
  };

  $: combinedStores = allStores
    ?.filter((store) => store.id !== -1)
    .map((store) => {
      const theftData = theftandcamera.find((t) => t.name === store.name) || {};
      const nodeData = nodes.find((n: any) => n.moksaId === store.id) || {};
      return { ...store, ...theftData, lensId: nodeData ? nodeData.id : null };
    });

  console.log(combinedStores, "combinedStores");

  $: uniqueLocations = [
    ...new Set(combinedStores.map((store) => store.country)),
  ].filter(Boolean);
  $: uniqueManagers = [
    ...new Set(combinedStores.map((store) => store.manager)),
  ].filter(Boolean);

  const fruits = allStores
    .filter((store) => store.id !== -1)
    .map((store: any) => ({
      value: store.id,
      label: store.name,
    }));

  // $: console.log('uniqueLocations',uniqueLocations)
  // $: console.log('uniquemanager',uniqueManagers)

  let selectedLocation = "";
  let selectedManager = "";

  function handleLocationSelect(location: string) {
    selectedLocation = selectedLocation === location ? "" : location;
  }

  function handleManagerSelect(manager: string) {
    selectedManager = selectedManager === manager ? "" : manager;
  }

  $: filteredStores = combinedStores.filter(
    (store) =>
      (!selectedLocation || store.country === selectedLocation) &&
      (!selectedManager || store.manager === selectedManager),
  );

  function cleanValue(value: string | number): string {
    const stringValue = String(value);

    // Enclose values containing commas or quotes in double quotes
    if (stringValue.includes(",") || stringValue.includes('"')) {
      // Escape any double quotes inside the value by doubling them
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  function convertArrToCSV(
    arr: any[],
    fileName: string,
    excludeKeys: string[] = [],
  ): void {
    const filteredArr = arr.filter(
      (item) => item !== null && item !== undefined,
    );

    // Extract the headers

    const headers = Object.keys(filteredArr[0])
      .filter((key) => !excludeKeys.includes(key))
      .join(",");

    // Extract the data rows with value cleaning
    const rows = filteredArr
      .map((obj) => {
        return Object.keys(obj)
          .filter((key) => !excludeKeys.includes(key))
          .map((key) => cleanValue(obj[key]))
          .join(",");
      })
      .join("\n");
    // Combine headers and rows
    const csvContent = headers + "\n" + rows;

    // Create a Blob for the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the CSV
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; //file name after download
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up the link after download
    document.body.removeChild(link);
  }

  let selectedStore = 0;
  let searchStore = "";

  import { createEventDispatcher } from "svelte";

  let filterText = "";
  $: filteredFruits = fruits.filter((fruit) =>
    fruit.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  const dispatch = createEventDispatcher();
</script>

<section
  class="w-full p-4 flex flex-col gap-4 px-6 max-h-[calc(100vh-75px)] overflow-y-auto overflow-x-clip"
>
  <div class="flex items-center justify-end gap-4">
    {#if user.role !== "Operators" && user.role !== "admin" && user.role !== "storeManager" && user.role !== "storeEmployee"}
      <AddStoreDialog {refreshStoreData}>
        <Button
          class="bg-[#3D81FC] text-white hover:bg-white hover:text-[#3D81FC]"
        >
          Add Store +
        </Button>
      </AddStoreDialog>
    {/if}
    <Select.Root portal={null}>
      <Select.Trigger
        class="w-[150px] bg-[#F4F4F4] border text-xs px-1 border-[#E0E0E0] rounded-lg bg-transparent"
      >
        <Select.Value
          placeholder={allStores.length > 0
            ? fruits?.[selectedStore]?.label
            : "No Stores"}
        />
      </Select.Trigger>
      <Select.Content class="max-h-[200px] overflow-y-auto">
        <div class="p-2">
          <Input
            type="text"
            placeholder="Search stores..."
            bind:value={filterText}
            class="mb-2"
          />
        </div>
        <Select.Group>
          <!-- {#each fruits as fruit, index}
            <Select.Item
              on:click={() => (selectedStore = index)}
              class="px-1"
              value={fruit.value}
              label={fruit.label}>{fruit.label}</Select.Item
            >
          {/each} -->
          {#if filteredFruits.length > 0}
            {#each filteredFruits as fruit, index}
              <Select.Item
                on:click={() => (selectedStore = index)}
                class="px-1"
                value={fruit.value}
                label={fruit.label}>{fruit.label}</Select.Item
              >
            {/each}
          {:else}
            <Select.Item disabled>N/A</Select.Item>
          {/if}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>
  <div class="grid grid-rows-1 grid-cols-4 gap-4 h-[140px]">
    <div
      class="col-span-1 border rounded-lg bg-gradient-to-r from-[#02A7FD] to-[#141C64] px-4 py-3 h-[85px] relative flex items-center gap-3"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <Camera size={40} />
      </span>
      <span>
        <p class="text font-semibold text-white">No. of active cameras</p>
        <p class="text-white text-xl font-bold">
          {#if $cardData.length !== 0}
            {$cardData[selectedStore]?.data?.[0].camera_count}
          {:else}
            <Spinner color="white" />
          {/if}
        </p>
      </span>
    </div>
    <div
      class="col-span-1 border rounded-lg h-[85px] bg-gradient-to-r from-[#E4DF00] to-[#89B900] py-3 px-4 relative flex items-center gap-3"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        <p class="text font-semibold text-white">Suspicious activity</p>
        <p class="text-white text-xl font-bold">
          {#if $cardData.length !== 0}
            {$cardData[selectedStore]?.data?.[0].theft_detected_count}
          {:else}
            <Spinner color="white" />
          {/if}
        </p>
      </span>
    </div>
    <div
      class="col-span-1 border rounded-lg bg-gradient-to-r from-[#00FEA3] to-[#007077] px-4 py-3 relative h-[85px] invisible flex items-center gap-3"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <Users size={40} />
      </span>
      <span>
        <p class="text font-semibold text-white">Busy hours</p>
        <p class="text-white text-xl font-bold">
          {#if $cardData.length !== 0}
            {$cardData[selectedStore]?.data?.[0].busy_hours === null
              ? "N/A"
              : $cardData[selectedStore]?.data?.[0].busy_hours}
            <!-- {$cardData[selectedStore]?.data?.[0].busy_hours ??
              (() => {
                const start = Math.floor(Math.random() * 11 + 1);
                return `${start}:00 - ${start + 1}:00`;
              })()} -->
          {:else}
            <Spinner color="white" />
          {/if}
        </p>
      </span>
    </div>
    <div
      class="invisible col-span-1 border rounded-lg bg-gradient-to-r from-[#FFB156] to-[#FF007A] px-4 py-3 relative h-[85px] flex items-center gap-3"
    >
      <span
        class="size-[60px] grid place-items-center text-white bg-white bg-opacity-20 rounded-full"
      >
        <ShoppingBag size={40} />
      </span>
      <span>
        <p class="text font-semibold text-white">Most visited Aisle</p>
        <p class="text-white text-xl font-bold">
          {#if $cardData.length !== 0}
            {$cardData[selectedStore]?.data?.[0].aisle_name === null
              ? "N/A"
              : $cardData[selectedStore]?.data?.[0].aisle_name}
            <!-- {$cardData[selectedStore]?.data?.[0].aisle_name ??
              (() => {
                const aisles = [
                  "Clothing",
                  "Electronics",
                  "Liquor",
                  "Produce",
                  "Dairy",
                  "Bakery",
                  "Meat",
                  "Frozen Foods",
                  "Snacks",
                  "Beverages",
                  "Canned Goods",
                  "Personal Care",
                  "Home Appliances",
                  "Sporting Goods",
                  "Toys",
                  "Books",
                  "Automotive",
                  "Garden Center",
                  "Pharmacy",
                ];
                return aisles[Math.floor(Math.random() * aisles.length)];
              })()} -->
          {:else}
            <Spinner color="white" />
          {/if}
        </p>
      </span>
    </div>
  </div>
  <div class="flex items-center justify-between">
    <span class="relative">
      <Input
        bind:value={searchStore}
        class="w-full max-w-[500px] min-w-[450px] pl-8"
        placeholder="Search"
      />
      <Search size={18} class="absolute top-1/2 -translate-y-1/2 left-2" />
      <button
        class="absolute top-1/2 -translate-y-1/2 right-2"
        on:click={() => (searchStore = "")}
      >
        {#if searchStore}
          <X size={18} />
        {/if}
      </button>
    </span>
    <span class="flex items-center gap-3">
      <!-- <Button variant="outline" class="flex items-center gap-1 text-sm"
        ><ListFilter size={18} />Filters</Button
      > -->
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="outline" class="flex items-center gap-1 text-sm">
            <ListFilter size={18} />Filters
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="max-h-[250px] overflow-y-scroll">
          <DropdownMenu.Label>Location</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each uniqueLocations as location}
            <DropdownMenu.CheckboxItem
              checked={selectedLocation === location}
              onCheckedChange={() => handleLocationSelect(location)}
            >
              {location}
            </DropdownMenu.CheckboxItem>
          {/each}
          <DropdownMenu.Separator />
          <DropdownMenu.Label>Manager</DropdownMenu.Label>
          <DropdownMenu.Separator />
          {#each uniqueManagers as manager}
            <DropdownMenu.CheckboxItem
              checked={selectedManager === manager}
              onCheckedChange={() => handleManagerSelect(manager)}
            >
              {manager}
            </DropdownMenu.CheckboxItem>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      {#if user.role !== "Operators" && user.role !== "adminNonPaid" && user.role !== "storeEmployee"}
        <Button
          class="flex items-center gap-1 bg-[#3D81FC] text-sm hover:bg-white hover:text-[#3D81FC]"
          on:click={() => {
            const date = new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            convertArrToCSV(combinedStores, `combined_stores_${date}.csv`);
            convertArrToCSV(
              $cardData.map((item) => item.data[0]),
              `stores_${date}.csv`,
              ["floormap", "logo", "updatedAt"],
            );
          }}><Upload size={18} />Export Reports</Button
        >
      {/if}
    </span>
  </div>

  <div class="h-full w-full rounded-t-xl flex flex-col mt-4">
    <span class="h-[50px] bg-[#050F40] px-4 py-2 rounded-t-xl">
      <p class="text-white font-medium text-lg">Stores</p>
    </span>
    <StoresDataTable
      combinedStores={filteredStores}
      {searchStore}
      {token}
      {user}
      {refreshStoreData}
    />
  </div>
</section>
