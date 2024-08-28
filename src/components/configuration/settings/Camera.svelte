<script lang="ts">
  // import * as Table from "@/components/ui/table";
  // let logs = [];
  // let allSelected = false;
  import {Button} from '../../ui/button'

  // onMount(() => {
  //   logs = Array.from({ length: 50 }, (_, i) => ({
  //     id: i + 1,
  //     errorType: ["Syntax Error", "Runtime Error", "Logical Error"][
  //       Math.floor(Math.random() * 3)
  //     ],
  //     severity: ["Critical", "Warning", "Informational"][
  //       Math.floor(Math.random() * 3)
  //     ],
  //     frequency: `5 Apr, 2024; ${12 + (i % 12)}:00 PM IST`,
  //     resolutionTime: "Solved within 2 hrs",
  //     errorTrends: "9 AM to 9 PM",
  //     rootCause: ["Recent code updates", "Database connection issues"][
  //       Math.floor(Math.random() * 2)
  //     ],
  //     selected: false,
  //   }));
  // });

  // let currentPage = 1;
  // const rowsPerPage = 20;

  // function toggleAll() {
  //   allSelected = !allSelected;
  //   logs.forEach((log) => (log.selected = allSelected));
  // }

  // $: allSelected = logs.every((log) => log.selected);

  // function clearSelectedLogs() {
  //   logs = logs.filter((log) => !log.selected);
  // }

  import PocketBase from "pocketbase";
  import AddCameraDialog from "@/components/dialogs/AddCameraDialog.svelte";
  import AddNodeDialog from "@/components/dialogs/AddNodeDialog.svelte";
  import AlertDeleteNode from "@/components/dialogs/alerts/AlertDeleteNode.svelte";
  import { selectedNode } from "@/lib/stores";
  import type { User } from "@/types";
  import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Filter,
    InfoIcon,
    Edit,
    Search,
    Trash2,
    X,
  } from "lucide-svelte";
  export let user: User;
  import { onMount, onDestroy } from "svelte";
  import { toast } from "svelte-sonner";
  import { addUserLog } from "@/lib/addUserLog";
  import { writable } from "svelte/store";
  import { page } from "$app/stores";
  import * as Select from "@/components/ui/select";
  import CameraDeleteDialog from "@/components/dialogs/CameraDeleteDialog.svelte";
  import { Input } from "@/components/ui/input";

  let selected = 1;
  let detailIndex: number | null = null;
  let nodeIndex: number | null = null;
  let modify: boolean = false;
  let nodeModify: boolean = false;
  let newName: null | string = null;
  let searchNode = "";
  let newNodeName = "";
  let searchValue = "";
  let updatedPriority = null;
  let updatedFace = null;
  let updatedVehicle = null;
  let updatedSave = null;
  let updatedMotionThres = null;
  let filteredCameraNames = [];
  let filteredNodeNames = [];
  let enable = false;
  let newData = [];
  let view = 1;
  let change = "";
  let camStatusData = [];

  // const PB = new PocketBase(PUBLIC_POCKETBASE_URL);
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  const nodeData = writable([]);

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
      console.log("change", e.action, e.record);
      getNodeData();
    });
  });

  onDestroy(() => {
    PB.collection("camera").unsubscribe("*");
  });

  const onDeleteNode = async () => {
    const localCameraList =
      $nodeData[nodeIndex].camera.length === 0
        ? []
        : $nodeData[nodeIndex].camera;
    await fetch("/api/node/delete", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameras: $nodeData[nodeIndex].camera,
        nodeId: $nodeData[nodeIndex].id,
      }),
    }).then(() => {
      localCameraList.map((c) =>
        document.getElementById(`stream-${c.id}`)?.remove(),
      );
      toast(`Node: ${$nodeData[nodeIndex].name} deleted!`);
    });
  };

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
      detailIndex = null;
    }
  }
</script>

<div
  class="flex flex-col overflow-y-scroll overflow-x-clip items-start h-[calc(100vh-75px)] w-full text-black dark:text-white"
  id="camera"
>
    <div
      class=" w-[94.5%] my-4 py-4 mx-6 shadow-md rounded-md border border-[#00000014]"

    >
      <h2 class="px-6 font-medium mb-4" id="details">Camera & Store Details</h2>
      <div
        class="h-[1px] dark:bg-[#292929] ml-2 mb-4 bg-[#e0e0e0] mt-8 w-[95%]"
      />
      <div class="flex flex-col items-start gap-2 px-6 mb-8">
        <span class="dark:text-[#e0e0e0] text-sm"> Store name </span>
        <div class="flex items-center justify-center gap-5">
          <input
            autoComplete="off"
            placeholder="Search for store name "
            class="py-4 w-[330px] pl-3 rounded-md border border-solid border-[#979797] active:border-[#015a62] text-xs text-[#979797] dark:bg-[#242424] dark:border-[#333] dark:text-[#929292]"
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
        class="flex flex-col items-center max-w-[55%] ml-6 justify-center w-full mb-10"
      >
        <!-- <div
          class=" dark:bg-[#1b1b1b] bg-white px-6 w-full flex items-center justify-between py-2"
        >
          <span class="font-semibold">Node</span>
          <div class="flex gap-4">
            <AddNodeDialog {user} {getNodeData}>
              <button
                on:click={() =>
                  addUserLog("user clicked on add node button camera panel")}
                class="dark:text-[#CAC4D0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
              >
                Add
              </button>
            </AddNodeDialog>
            {#if !nodeModify}
              <button
                class="dark:text-[#CAC4D0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                on:click={() => {
                  if (nodeIndex !== undefined && nodeIndex !== null) {
                    nodeModify = true;
                    addUserLog(
                      "user clicked on modify node button camera panel",
                    );
                  } else {
                    alert("please select a node");
                    addUserLog(
                      "user clicked on modify node button, without selecting a node,  camera panel",
                    );
                  }
                }}
              >
                Modify
              </button>
            {:else}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                on:click={async () => {
                  await fetch("/api/node/update", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: newNodeName,
                      id: newData[nodeIndex].id,
                    }),
                  }).catch((err) => {
                    toast.error("failed to update node name");
                    return;
                  });
                  toast(
                    `${newData[nodeIndex].name} updated to ${newNodeName}!`,
                  );
                  newData[nodeIndex].name = newNodeName;
                  nodeModify = false;
                }}
              >
                Save Changes
              </button>
            {/if}
            {#if nodeModify}
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                on:click={() => (nodeModify = false)}
              >
                Discard Changes
              </button>
            {/if}
            <AlertDeleteNode onDelete={onDeleteNode}>
              <button
                class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid disabled:cursor-not-allowed"
                disabled={nodeIndex === null}
              >
                Delete
              </button>
            </AlertDeleteNode>
          </div>
        </div> -->

        <table class="w-full bg-white rounded-md flex flex-col gap-4">
          <thead  class='bg-[#f9f9f9] border-[#e4e4e4] rounded-md'>
            <tr class='border-[#e4e4e4] rounded-md'>
                <th class='text-start py-2 px-4 text-[#5F6064]  w-[80px]'>Store</th>
              <th class='text-start py-2 px-4 text-[#5F6064]  w-2/3'></th>
                <th class='text-start py-2 px-4 text-[#5F6064]  w-1/3'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#if filteredNodeNames.length > 0}
              {#each filteredNodeNames as item, index}
                <tr
                                  class={`dark:bg-[#1b1b1b] bg-[white] cursor-pointer border-[#e4e4e4] border rounded-md`}

                  on:click={() => {
                    if (nodeIndex === index) {
                      if (!nodeModify) {
                        nodeIndex = null;
                      }
                    } else {
                      nodeIndex = index;
                      addUserLog(
                        `user clicked on table row with node name ${item.name}`,
                      );
                    }
                  }}
                >
                <td class="text-start py-3 px-4 h-full max-w-[80px]">
                    <div class="flex justify-start items-start h-full">
                      <input
                        class="w-auto cursor-pointer"
                        type="checkbox"
                        checked={nodeIndex === index}
                      />
                    </div>
                  </td>
                 <td
                    class=" text-start py-2 px-4  w-full"
                  >
                    {#if nodeModify && index === nodeIndex}
                      <input
                        type="text"
                        autoComplete="off"
                        name="node-name"
                        placeholder={item.name}
                        bind:value={newNodeName}
                        on:input={(e) => {
                          console.log(e.target.value);
                          newNodeName = e.target.value;
                        }}
                        class="block border-0 px-1 py-1 text-gray-900
                    placeholder:text-gray-400
                      bg-transparent w-full
                      focus:border-b-2
                    focus:border-indigo-600
                    dark:text-[#979797] sm:text-sm sm:leading-6"
                      />
                    {:else}
                      {item.name}
                    {/if}
                  </td>
               <td class='w-full flex items-center justify-start gap-3 py-3 px-4'>
                  <Button class='text-[#4976F4] text-sm text-start flex items-center gap-1' variant='ghost'> <Edit size={16}/> Modify</Button>
                  <Button class='text-[#F44336] text-sm text-start flex items-center gap-1' variant='ghost'><Trash2 size={16}/> Delete</Button>
                 </td>
                </tr>
              {/each}
            {:else}
              {#each $nodeData as data, index}
                <tr
                  class={`dark:bg-[#1b1b1b] bg-[white] cursor-pointer border-[#e4e4e4] border rounded-md`}
                  on:click={async () => {
                    if (nodeIndex === index) {
                      if (!nodeModify) {
                        nodeIndex = null;
                      }
                    } else {
                      nodeIndex = index;
                      console.log($nodeData[index].id);
                      const status = await PB.collection(
                        "camera_ping_status",
                      ).getList(1, 100, {
                        filter: `node~"${$nodeData[index].id}"`,
                        sort: "-created",
                      });
                      console.log("status", status);
                      const uniqueUrls = new Set();
                      const uniqueStatus = status.items.filter((item) => {
                        if (!uniqueUrls.has(item.url)) {
                          uniqueUrls.add(item.url);
                          return true;
                        }
                        return false;
                      });
                      addUserLog(
                        `user clicked on table row with node name ${data.name}`,
                      );
                    }
                  }}
                >
                 <td class="text-start py-3 px-4 h-full max-w-[80px]">
                    <div class="flex justify-start items-start h-full">
                      <input
                        class="w-auto cursor-pointer"
                        type="checkbox"
                        checked={nodeIndex === index}
                      />
                    </div>
                  </td>
                  <td
                    class=" text-start py-2 px-4  w-full"
                  >
                    {#if nodeModify && index === nodeIndex}
                      <input
                        type="text"
                        autoComplete="off"
                        name="node-name"
                        placeholder={data.name}
                        bind:value={newNodeName}
                        on:input={(e) => {
                          console.log(e.target.value);
                          newNodeName = e.target.value;
                        }}
                        class="block border-0 px-1 py-1 text-gray-900
                        placeholder:text-gray-400
                          bg-transparent w-full
                          focus:border-b-2
                        focus:border-indigo-600
                        dark:text-[#979797] sm:text-sm sm:leading-6"
                      />
                    {:else}
                      {data.name}
                    {/if}
                  </td>
                 <td class='w-full flex items-center justify-start gap-3 py-3 px-4'>
                  <Button class='text-[#4976F4] text-sm text-start flex items-center gap-1' variant='ghost'> <Edit size={16}/> Modify</Button>
                  <Button class='text-[#F44336] text-sm text-start flex items-center gap-1' variant='ghost'><Trash2 size={16}/> Delete</Button>
                 </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      {#if nodeIndex !== undefined && nodeIndex !== null}
        <span class="px-6 text-sm dark:text-[#e0e0e0] pb-4">
          Camera Details
        </span>
        <div
          class="flex flex-col items-center max-w-[96%] mx-auto justify-center w-full dark:border-[#939393] border-solid border mb-20"
        >
          <div
            class="dark:bg-[#1b1b1b] py-2 flex w-full items-center justify-between px-6"
          >
            <div class="relative">
              <input
                placeholder="Search camera by name"
                class="pr-2 pl-10 py-1 my-1 rounded-md border border-solid dark:border-[#333] dark:bg-[#242424] w-[300px] placeholder-opacity-70"
                bind:value={searchValue}
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
              <Search class="absolute top-1/2 -translate-y-1/2 left-2" />
              <button
                class="absolute top-1/2 -translate-y-1/2 right-2"
                on:click={() => (searchValue = "")}
              >
                <X />
              </button>
            </div>
            <div class="flex gap-4">
              <AddCameraDialog sNode={newData[nodeIndex]}>
                <button
                  on:click={() =>
                    addUserLog(
                      `user clicked on add camera button camera table`,
                    )}
                  class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                >
                  Add
                </button>
              </AddCameraDialog>
              {#if !modify}
                <button
                  class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                  on:click={() => {
                    if (detailIndex !== undefined && detailIndex !== null) {
                      modify = true;
                      addUserLog(
                        `user clicked on add modify button camera table`,
                      );
                    } else {
                      alert("please select a camera");
                      addUserLog(
                        `user clicked on add modify button, without selecting a camera, camera table`,
                      );
                    }
                  }}
                >
                  Modify
                </button>
              {:else}
                <button
                  class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                  on:click={() => {
                    fetch("/api/camera/editCamera", {
                      method: "put",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        cameraId: newData[nodeIndex].cameraData[0][0].id,
                        nodeId: newData[nodeIndex].id,
                        name:
                          newName ?? newData[nodeIndex].cameraData[0][0].name,
                        url: newData[nodeIndex].cameraData[0][0].url,
                        subUrl: newData[nodeIndex].cameraData[0][0].subUrl,
                        priority:
                          updatedPriority ??
                          newData[nodeIndex].cameraData[0][0].priority,
                        face:
                          updatedFace ??
                          newData[nodeIndex].cameraData[0][0].face,
                        vehicle:
                          updatedVehicle ??
                          newData[nodeIndex].cameraData[0][0].vehicle,
                        save:
                          updatedSave ??
                          newData[nodeIndex].cameraData[0][0].save,
                        motionThresh:
                          updatedMotionThres ??
                          newData[nodeIndex].cameraData[0][0].motionThresh,
                      }),
                    }).then(() => {
                      toast("Camera updated!");
                      modify = false;
                      addUserLog(
                        `user clicked on save changes button after modification, camera table`,
                      );
                    });
                  }}
                >
                  Save Changes
                </button>
              {/if}
              {#if modify}
                <button
                  class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                  on:click={() => {
                    modify = false;
                    addUserLog(
                      `user clicked on discard button after modification, camera table`,
                    );
                  }}
                >
                  Discard
                </button>
              {/if}
              <CameraDeleteDialog
                cameraId={newData?.[nodeIndex]?.cameraData?.[detailIndex]?.[0]
                  ?.id}
                nodeId={newData?.[nodeIndex]?.id}
                url={newData?.[nodeIndex]?.cameraData?.[detailIndex]?.[0]?.url}
                name={newData?.[nodeIndex]?.cameraData?.[detailIndex]?.[0]
                  ?.name}
              >
                <button
                  disabled={detailIndex === null}
                  class="dark:text-[#cac4d0] text-[#4f4f4f] font-xs bg-[#d9d9d9] border-none dark:bg-[#242424] rounded-md px-3 py-1.5 border-[#333] border dark:border-solid"
                >
                  Delete
                </button>
              </CameraDeleteDialog>
            </div>
          </div>
          <table class="w-full bg-white shadow-md rounded">
            <thead>
              <tr
                class="dark:bg-[#1b1b1b] bg-[#f2f2f2] border-t-[1px] border-solid dark:border-[#929292]"
              >
                <th
                  class="text-left py-3 px-4 flex items-center justify-center"
                >
                  Select
                </th>
                <th
                  class="text-left py-3 px-4 border-x-[1px] border-solid dark:border-[#929292]"
                >
                  Node
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Camera name
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Camera Id
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  IP Address
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Protocol
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Priority
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Motion Thresh
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Face
                </th>
                <th
                  class="text-left py-3 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                >
                  Vehicle
                </th>
                <th class="text-left py-3 px-4">Save</th>
              </tr>
            </thead>
            <tbody>
              {#if filteredCameraNames.length > 0}
                {#each filteredCameraNames as item, index}
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
                        detailIndex = null;
                      } else {
                        detailIndex = index;
                        addUserLog(
                          `user clicked on camera table row with camera name ${item[0].name}`,
                        );
                      }
                    }}
                  >
                    <td
                      class="text-left py-3 px-4 h-full flex items-center justify-center cursor-pointer"
                    >
                      <input
                        checked={detailIndex === index}
                        class=" cursor-pointer"
                        type="checkbox"
                      />
                    </td>
                    <td
                      class="py-2 px-4 border-x-[1px] border-solid dark:border-[#929292]"
                    >
                      {newData[nodeIndex].name}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <input
                          type="text"
                          name="node-name"
                          autoComplete="off"
                          placeholder={item?.name}
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
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {item[0].id}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {item?.[0].url.split("@")[1].split(":")[0]}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {item?.[0].url.slice(0, 4)}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedPriority = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            class='pl-6'
                            <Select.Value placeholder={item[0].priority} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item class="pl-6" value={0} label="0"
                                >0</Select.Item
                              >
                              <Select.Item class="pl-6" value={1} label="1"
                                >1</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].priority}{/if}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) =>
                            (updatedMotionThres = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value
                              placeholder={item?.[0].motionThresh === 5000
                                ? "High"
                                : item?.[0].motionThresh === "2500"
                                  ? "Mid"
                                  : "Low"}
                            />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item value={1000} label={"low"}
                                >Low</Select.Item
                              >
                              <Select.Item value={2500} label={"mid"}
                                >Mid</Select.Item
                              >
                              <Select.Item value={5000} label={"high"}
                                >High</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].motionThresh === 5000
                          ? "High"
                          : item?.[0].motionThresh === "2500"
                            ? "Mid"
                            : "Low"}
                      {/if}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedFace = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].face} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].face}
                      {/if}
                    </td>
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedVehicle = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].vehicle} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].vehicle}
                      {/if}
                    </td>
                    <td class="py-2 px-4">
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedSave = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].save} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}{item[0].save}{/if}</td
                    >
                  </tr>
                {/each}
              {:else if newData && newData?.[nodeIndex]?.camera?.length > 0}
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
                      if (detailIndex === index && !modify) {
                        detailIndex = null;
                      } else {
                        detailIndex = index;
                        addUserLog(
                          `user clicked on camera table row with camera name ${item[0].name}`,
                        );
                      }
                    }}
                  >
                    <td
                      class="text-left py-3 px-4 h-full flex items-center justify-center"
                    >
                      <input
                        type="checkbox"
                        class="cursor-pointer"
                        checked={detailIndex === index}
                      />
                    </td>
                    <td
                      class="py-2 px-4 border-x-[1px] border-solid dark:border-[#929292]"
                    >
                      {newData[nodeIndex].name}
                    </td>

                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
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
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                      >{item[0].id}</td
                    >
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                      >{item[0].url.split("@")[1]?.split(":")[0]}</td
                    >
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {item?.[0].url.slice(0, 4)}</td
                    >
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedPriority = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].priority} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item class="pl-6" value={0} label={"0"}
                                >0</Select.Item
                              >
                              <Select.Item class="pl-6" value={1} label={"1"}
                                >1</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].priority}{/if}</td
                    >
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) =>
                            (updatedMotionThres = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value
                              placeholder={item?.[0].motionThresh === 5000
                                ? "High"
                                : item?.[0].motionThresh === "2500"
                                  ? "Mid"
                                  : "Low"}
                            />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item value={1000} label={"low"}
                                >Low</Select.Item
                              >
                              <Select.Item value={2500} label={"mid"}
                                >Mid</Select.Item
                              >
                              <Select.Item value={5000} label={"high"}
                                >High</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].motionThresh === 5000
                          ? "High"
                          : item?.[0].motionThresh === "2500"
                            ? "Mid"
                            : "Low"}
                      {/if}
                    </td>

                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedFace = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].face} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item?.[0].face}
                      {/if}
                    </td>

                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedVehicle = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].vehicle} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}
                        {item[0].vehicle}
                      {/if}</td
                    >
                    <td
                      class="py-2 px-4 border-r-[1px] border-solid dark:border-[#929292]"
                    >
                      {#if modify && index === detailIndex}
                        <Select.Root
                          portal={null}
                          onSelectedChange={(e) => (updatedSave = e?.value)}
                        >
                          <Select.Trigger class="text-sm ">
                            <Select.Value placeholder={item[0].save} />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Group>
                              <Select.Item
                                value={true}
                                label={"true"}
                                class="pl-6">True</Select.Item
                              >
                              <Select.Item
                                value={false}
                                label={"False"}
                                class="pl-6">False</Select.Item
                              >
                            </Select.Group>
                          </Select.Content>
                        </Select.Root>
                      {:else}{item[0].save}{/if}</td
                    >
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      {:else}
        <span class="px-6 text-sm dark:text-[#e0e0e0] mb-8">
          Select a store to get its camera details.
        </span>
      {/if}
    </div>
  <!-- {/if} -->


</div>
<style>
 input[type="checkbox"] {
    accent-color: #0070FF !important;
    transform: scale(1.25);

  }
  </style>