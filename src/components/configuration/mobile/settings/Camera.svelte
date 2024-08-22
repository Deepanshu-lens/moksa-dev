<script lang="ts">
  import { CameraIcon, ChevronUp, Search, X } from "lucide-svelte";
  import { onDestroy, onMount } from "svelte";
  import PocketBase from "pocketbase";
  import { writable } from "svelte/store";
  import type { User } from "@/types";
  import { toast } from "svelte-sonner";
  // import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  export let user: User;
  export let text;
  export let selected;
  const nodeData = writable([]);
  let filteredNodeNames = [];
  let filteredCameraNames = [];
  let nodeModify: boolean = false;
  let showDeleteModal = false;
  let searchNode = "";
  let enable = false;
  let modify: boolean = false;
  let detailIndex: number | null = null;
  let nodeIndex: number | null = null;
  let searchValue = "";
  let newName = "";
  let newNodeName = "";
  let showNvrModal = false;
  let showCameraModal = false;
  let newData = [];
  let newDataCount = newData.length;
  const newDataIndices = Array.from(
    { length: newDataCount },
    (_, index: number) => index,
  );
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  // const PB = new PocketBase(PUBLIC_POCKETBASE_URL);

  async function getNodeData() {
    if (user?.session) {
      const data = await fetch("/api/node/getMany", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: user?.session,
        }),
      });
      if (!data.ok) {
        toast.error("Something went wrong. Please try again");
        return;
      }
      const result = await data.json();

      // nodeData.set([...result?.nodeData]);
        nodeData.set(
        result?.nodeData.map((node) => ({ ...node, session: user.session })),
      );
    } else {
      console.log("no selected node");
    }
  }

  onMount(() => {
    getNodeData();

    PB.collection("camera").subscribe("*", async (e) => {
      // console.log("change", e.action, e.record);
      getNodeData();
    });
  });

  onDestroy(() => {
    PB.collection("camera").unsubscribe("*");
  });

  $: {
    newData =
      $nodeData.length > 0
        ? $nodeData.filter((item: any) => {
            return item.session === user.session;
          })
        : [];
  }

  $: {
    if (searchNode.length === 0) {
      filteredNodeNames = [];
    }
    if (searchValue.length === 0) {
      filteredCameraNames = [];
    }
  }
</script>

<div
  class="flex flex-col justify-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white"
>
  <button
    class="flex flex-row items-center mb-4"
    on:click={() => (selected = "")}
  >
    <CameraIcon class="text-[#015a62] mr-4 h-[30px] w-[30px]" />
    <span class="text-[#015a62]">{text}</span>
    <ChevronUp class="ml-auto h-[30px] w-[30px] text-[#015a62]" />
  </button>
  <div class="mid">
    <div class="flex flex-col items-start gap-2 mb-8">
      <span class="dark:text-[#e0e0e0] text-sm"> Node name or Id </span>
      <div class="flex items-center justify-center gap-2">
        <input
          autoComplete="off"
          placeholder="Search for node name or id "
          class="py-4 w-[220px] pl-3 rounded-md border border-solid border-[#979797] active:border-[#015a62] text-xs text-[#979797] dark:bg-[#242424] dark:border-[#333] dark:text-[#929292]"
          bind:value={searchNode}
          on:input={(e) => {
            searchNode = e.target.value;
            let filteredNodes = newData.filter((node) => {
              return node.name
                .toLowerCase()
                .includes(e.target.value.toLowerCase());
            });
            filteredNodeNames = [...filteredNodes];
            let exact = newData.filter((node) => {
              return node.name.toLowerCase() === e.target.value.toLowerCase();
            });
            if (exact.length > 0) {
              enable = true;
            } else {
              enable = false;
            }
          }}
        />
        <button
          disabled={!enable}
          class="disabled:cursor-not-allowed py-2.5 px-5 text-sm hover:bg-[#015A62] dark:hover:bg-[#015a62] dark:bg-[#828282] dark:text-white rounded-md text-[#4f4f4f] hover:text-white text-[4f4f4f] bg-[#d9d9d9]"
          on:click={() => (nodeIndex = 0)}
        >
          Modify
        </button>
      </div>
    </div>
    <div
      class="flex flex-col items-center max-w-full justify-center w-full dark:border-[#939393] border-solid border mb-10"
    >
      <div
        class=" dark:bg-[#1b1b1b] bg-white px-2 w-full flex items-center justify-between py-2"
      >
        <span class="font-semibold text-black text-base"> Node name </span>
        <div class="flex items-center gap-1">
          <button
            class="dark:text-[#CAC4D0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
          >
            Add
          </button>
          {#if !nodeModify}
            <button
              class="dark:text-[#CAC4D0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
            >
              Modify
            </button>
          {:else}
            <button
              class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
            >
              Save
            </button>
          {/if}
          {#if nodeModify}
            <button
              class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
            >
              Discard
            </button>
          {/if}
          {#if !nodeModify}
            <button
              class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid scale-[.85] disabled:cursor-not-allowed"
              disabled={!nodeIndex}
            >
              Delete
            </button>
          {/if}
        </div>
      </div>

      <table class="w-full bg-white shadow-md rounded">
        <tbody>
          {#if filteredNodeNames.length > 0}
            {#each filteredNodeNames as camera, index}
              <tr
                class={`dark:bg-[#1b1b1b] bg-[white] cursor-pointer border-b-[1px] border-solid dark:border-[#929292] ${
                  index === 0 ? "border-t-[1px]" : ""
                } `}
                on:click={() => {
                  if (nodeIndex === index) {
                    if (!nodeModify) {
                      nodeIndex = null;
                    }
                  } else {
                    nodeIndex = index;
                  }
                }}
              >
                <td
                  class=" text-center py-1 px-2 border-r-[1px] border-solid dark:border-[#929292] w-1/2"
                >
                  {#if nodeModify && index === nodeIndex}
                    <input
                      type="text"
                      autoComplete="off"
                      name="node-name"
                      placeholder={camera.nodeName}
                      class="block border-0 px-1 py-1 text-gray-900
                            placeholder:text-gray-400
                              bg-transparent w-full
                              focus:border-b-2
                            focus:border-indigo-600
                            dark:text-[#979797] sm:text-sm sm:leading-6"
                      on:change={(e) => {
                        newNodeName = e.target.value;
                      }}
                    />
                  {:else}
                    <p class="text-medium text-sm text-gray-900">
                      {camera.nodeName}
                    </p>
                  {/if}
                </td>
                <td class="text-center py-2 px-2 h-full w-1/2">
                  <div class="flex justify-center items-center h-full">
                    <input
                      class="w-auto cursor-pointer"
                      type="checkbox"
                      checked={nodeIndex === index}
                    />
                  </div>
                </td>
              </tr>
            {/each}
          {:else}
            {#each $nodeData as data, index}
              <tr
                class={`dark:bg-[#1b1b1b] bg-[white] cursor-pointer border-b-[1px] border-solid dark:border-[#929292] ${
                  index === 0 ? "border-t-[1px]" : ""
                } `}
                on:click={() => {
                  if (nodeIndex === index) {
                    if (!nodeModify) {
                      nodeIndex = null;
                    }
                  } else {
                    nodeIndex = index;
                  }
                }}
              >
                <td
                  class=" text-center py-1 px-2 border-r-[1px] border-solid dark:border-[#929292] w-1/2"
                >
                  {#if nodeModify && index === nodeIndex}
                    <input
                      type="text"
                      autoComplete="off"
                      name="node-name"
                      placeholder={data.name}
                      class="block border-0 px-1 py-1 text-gray-900
          placeholder:text-gray-400
            bg-transparent w-full
            focus:border-b-2
          focus:border-indigo-600
          dark:text-[#979797] sm:text-sm sm:leading-6"
                    />
                  {:else}
                    <p class="text-medium text-sm text-gray-900">
                      {data.name}
                    </p>
                  {/if}
                </td>
                <td class="text-center py-2 px-2 h-full w-1/2">
                  <div class="flex justify-center items-center h-full">
                    <input
                      class="w-auto cursor-pointer"
                      type="checkbox"
                      checked={nodeIndex === index}
                    />
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if nodeIndex !== null}
      <span class="px-6 text-sm dark:text-[#e0e0e0] text-black mb-4">
        Camera Details
      </span>
      <div
        class="flex flex-col items-center max-w-[96%] gap-2 mx-auto justify-center w-full dark:border-[#939393] border-solid border mb-4"
      >
        <div
          class="dark:bg-[#1b1b1b] py-2 flex flex-col gap-4 w-full items-center justify-between px-2"
        >
          <div class="relative">
            <input
              placeholder="Search camera by name"
              class="pl-10 pr-2 py-1 my-1 text-black rounded-md border border-solid dark:border-[#333] dark:bg-[#242424] w-[290px] h-[50px] placeholder-opacity-70 text-xs"
              value={searchValue}
              on:input={(e) => {
                searchValue = e.target.value;
                let filteredNames = newData[nodeIndex].cameraData.filter(
                  (camera) => {
                    return camera[0].name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase());
                  },
                );
                filteredCameraNames = [...filteredNames];
              }}
            />
            <Search
              class="absolute top-1/2 -translate-y-1/2 left-2 text-black"
            />
            <X class="absolute top-1/2 -translate-y-1/2 right-2 text-black" />
          </div>
          <div class="flex gap-4">
            <button
              class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid scale-[.85]"
            >
              Add
            </button>
            {#if !modify}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
              >
                Modify
              </button>
            {:else}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
              >
                Save
              </button>
            {/if}
            {#if modify}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
              >
                Discard
              </button>
            {/if}
            {#if !modify}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-2 py-1 border-[#333] border dark:border-solid scale-[.85]"
              >
                Delete
              </button>
            {/if}
          </div>
        </div>
        <table class="w-full bg-white shadow-md rounded scale-90 text-black">
          <thead>
            <tr
              class="dark:bg-[#1b1b1b] bg-[#f2f2f2] border-t-[1px] border-solid dark:border-[#929292]"
            >
              <th class="text-left py-1 px-2 flex items-center justify-center">
                Select
              </th>
              <th
                class="text-left py-1 px-2 border-x-[1px] border-solid dark:border-[#929292]"
              >
                Node
              </th>
              <th
                class="text-left py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
              >
                Camera name
              </th>

              <th
                class="text-left py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
              >
                IP Address
              </th>
            </tr>
          </thead>
          <tbody>
            {#if filteredCameraNames.length > 0}
              {#each filteredCameraNames as camera, index}
                <tr
                  class={`${
                    index % 2 === 0
                      ? "dark:bg-[#333] bg-white cursor-pointer"
                      : "dark:bg-[#242424] bg-[#f2f2f2] cursor-pointer"
                  } ${
                    index === filteredCameraNames.length - 1
                      ? "border-b-[1px] border-solid dark:border-[#929292]"
                      : ""
                  } `}
                  on:click={() => {
                    if (detailIndex === index) {
                      if (!modify) {
                        detailIndex = null;
                      }
                    } else {
                      detailIndex = index;
                    }
                  }}
                >
                  <td
                    class="text-left py-2 px-2 h-full flex items-center justify-center cursor-pointer"
                  >
                    <input
                      checked={detailIndex === index}
                      class=" cursor-pointer"
                      type="checkbox"
                    />
                  </td>
                  <td
                    class="py-1 px-2 border-x-[1px] border-solid dark:border-[#929292]"
                  >
                    {newData?.[nodeIndex]?.name}
                  </td>
                  <td
                    class="py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
                  >
                    {#if modify && index === detailIndex}
                      <input
                        type="text"
                        name="node-name"
                        autoComplete="off"
                        placeholder={camera?.name}
                        class="block border-0 px-1 py-1 text-gray-900
                          placeholder:text-gray-400
                            bg-transparent w-full
                            focus:border-b-2
                          focus:border-indigo-600
                          dark:text-[#979797] sm:text-sm sm:leading-6"
                        bind:value={newName}
                        on:input={(e) => {
                          newName = e.target.value;
                        }}
                      />
                    {:else}
                      {camera[0].name}
                    {/if}
                  </td>

                  <td
                    class="py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
                  >
                    {camera?.[0].url.split("@")[1].split(":")[0]}
                  </td>
                </tr>
              {/each}
            {:else if newData && newData[nodeIndex]?.camera?.length > 0}
              {#each newData?.[nodeIndex].cameraData as item, index}
                <tr
                  class={`${
                    index % 2 === 0
                      ? "dark:bg-[#333] bg-white cursor-pointer"
                      : "dark:bg-[#242424] bg-[#f2f2f2] cursor-pointer"
                  } ${
                    index === newData?.[nodeIndex].camera.length - 1
                      ? "border-b-[1px] border-solid dark:border-[#929292]"
                      : ""
                  } 
                  
                  `}
                  on:click={() => {
                    if (detailIndex === index) {
                      if (!modify) {
                        detailIndex = null;
                      }
                    } else {
                      detailIndex = index;
                    }
                  }}
                >
                  <td
                    class="text-left py-2 px-2 h-full flex items-center justify-center"
                  >
                    <input
                      type="checkbox"
                      class="cursor-pointer"
                      checked={detailIndex === index}
                    />
                  </td>
                  <td
                    class="py-1 px-2 border-x-[1px] border-solid dark:border-[#929292]"
                  >
                    {newData[nodeIndex].name}
                  </td>
                  <td
                    class="py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
                  >
                    {#if modify && index === detailIndex}
                      <input
                        type="text"
                        name="node-name"
                        autoComplete="off"
                        placeholder={item[0]?.name}
                        class="block border-0 px-1 py-1 text-gray-900
                            placeholder:text-gray-400
                              bg-transparent w-full
                              focus:border-b-2
                            focus:border-indigo-600
                            dark:text-[#979797] sm:text-sm sm:leading-6"
                        bind:value={newName}
                        on:input={(e) => {
                          newName = e.target.value;
                        }}
                      />
                    {:else}
                      {item[0].name}
                    {/if}
                  </td>
                  <td
                    class="py-1 px-2 border-r-[1px] border-solid dark:border-[#929292]"
                  >
                    {item[0].url.split("@")[1]?.split(":")[0]}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {:else}
      <span class="px-2 text-sm dark:text-[#e0e0e0] text-black mb-4">
        Select a node to get its camera details.
      </span>
    {/if}
  </div>
</div>
