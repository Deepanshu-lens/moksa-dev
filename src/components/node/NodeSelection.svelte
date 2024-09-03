<script lang="ts">
  import RecursiveNode from "./RecursiveNode.svelte";
  import AddCameraDialog from "@/components/dialogs/AddCameraDialog.svelte";
  import EditNodeDialog from "./../dialogs/EditNodeDialog.svelte";
  import type { Camera, Node } from "@/types";
  import { Plus,ChevronDown, Edit, PlusCircle, Trash, Search } from "lucide-svelte";
  import { selectedNode } from "@/lib/stores";
  import Button from "../ui/button/button.svelte";
  import { toast } from "svelte-sonner";
  import AlertDeleteNode from "../dialogs/alerts/AlertDeleteNode.svelte";
  import { cn } from "@/lib";
  import AddNodeModal from "../modal/AddNodeModal.svelte";
  import { page } from "$app/stores";
  import { addUserLog } from "@/lib/addUserLog";
  import PocketBase from "pocketbase";
  import { Dropdown, DropdownItem, DropdownDivider } from "flowbite-svelte";
    import { Input } from "../ui/input";
    import { writable } from "svelte/store";
  export let data: PageServerData;
  export let url: string;
  export let nodes: Node[];
  export let isAllFullScreen: boolean;
  let dropdownOpen = false
  let showAddNode = writable(false);
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

 function groupNodesRecursively(nodes) {
    const groupNodes = (nodes, level = 0) => {
      const grouped = nodes.reduce((acc, node) => {
        const parts = node.name.split('_');  // Split only by underscore
        const baseName = parts.slice(0, level + 1).join('_');
        if (!acc[baseName]) {
          acc[baseName] = [];
        }
        acc[baseName].push(node);
        return acc;
      }, {});

      return Object.keys(grouped).map((baseName) => {
        const subNodes = grouped[baseName];
        if (
          subNodes.length > 1 &&
          subNodes.some((node) => node.name.split('_').length > level + 1)
        ) {
          return {
            name: baseName,
            nodes: groupNodes(subNodes, level + 1),
          };
        }
        return subNodes.length === 1 ? subNodes[0] : {
          name: baseName,
          nodes: subNodes,
        };
      });
    };

    return groupNodes(nodes);
  }

  const resultGroupNodes = groupNodesRecursively(nodes);

  const onDeleteNode = () => {
    const localCameraList = $selectedNode.camera;
    fetch("/api/node/delete", {
      method: "delete",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cameras: $selectedNode.camera,
        nodeId: $selectedNode.id,
      }),
    }).then(() => {
      localCameraList.map((c) =>
        document.getElementById(`stream-${c.id}`)?.remove(),
      );
      toast("Node deleted");
      addUserLog(
        `user deleted node ${$selectedNode.name} having id ${$selectedNode.id}`,
      );
    });
  };

  // $: console.log($page.params.slug)

  const handleNodeSelect = async (event: Event) => {
    const selectedOption = (event.target as HTMLSelectElement).value;

    console.log("selectedOption for nodeSelect", selectedOption);

    if (selectedOption === "Add Node +") {
      console.log("adding node");
      showAddNode.set(true) ;
      dropdownOpen = false; 
      return;
    }

    try {
      // console.log('selectedOption',selectedOption)
      // console.log('page.sesion',$page.params.slug)
      // console.log('selectednode.session',$selectedNode.session)
      PB.autoCancellation(false)

      const nodes = await PB.collection("node").getFullList({
      filter: `id="${selectedOption}"`,
    });
    // console.log(nodes)
    if (nodes.length > 0) {
      const node = nodes[0];
      dropdownOpen = false; 
      PB.autoCancellation(false)
      const cameras = await PB.collection("camera").getFullList({
        filter: `node~"${node.id}"`,
        sort: "-created",
        expand: 'personCounter,inference'
      });

      const formattedNode = {
        ...node,
        camera: cameras.map((cam: Camera) => ({
          ...cam,
          personCounter: cam?.expand?.personCounter?.count,
        })),
      };

      // console.log(formattedNode);
      selectedNode.set(formattedNode);
      // console.log(formattedNode.id)
      await PB.collection("session").update($page.params.slug, {
        activeNode: formattedNode.id
      });
      console.log("updated selectedNode", formattedNode.name);
    } else {
      throw new Error("No node found");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong. Please try again");
  }
};

let searchTerm = writable('');

  $: filteredNodes = $searchTerm
    ? resultGroupNodes.filter(node => 
        node.name.toLowerCase().includes($searchTerm.toLowerCase())
      )
    : resultGroupNodes;

  // console.log(data)
  // $: console.log(showAddNode)
  $: console.log('dropdown Open', dropdownOpen)
</script>

<div
  class={`flex justify-between items-center py-0.5 px-4 border-b-[1px] w-full`}
>
  <div
    class={`relative inline-block min-w-[85%] ${$page.route.id.includes("/session") ? "w-max" : "w-full"} ${isAllFullScreen && "bg-black"}`}
  >
    <button
      class={`text-start block text-sm outline-none capitalize border-none font-semibold appearance-none w-full ${isAllFullScreen ? "bg-black" : "bg-background"} text-[#323232] dark:text-white/[.7] border py-4 leading-tight  `}
      >{$selectedNode && $selectedNode.name.includes("_")
        ? $selectedNode.name.substring($selectedNode.name.lastIndexOf("_") + 1)
        : $selectedNode.name.length > 20
          ? $selectedNode.name.substring(0, 20) + "..."
          : $selectedNode.name}</button
    >
    <Dropdown 
    bind:open={dropdownOpen}
      class="z-[99999999] dark:text-slate-200 dark:bg-black border dark:border-slate-300 dark:border-opacity-35 min-w-[10rem] max-h-[16rem] overflow-y-auto rounded-sm  shadow-md pb-4"
    >
      <DropdownItem class='flex text-[#3D81FC] items-center justify-between py-1 px-2 font-semibold'
        on:click={() => handleNodeSelect({ target: { value: "Add Node +" } })}
      >
        Add Store <span class='rounded-full bg-[#3D81FC] p-1 grid place-items-center scale-75'><Plus size={20} class=' text-white'/></span>
      </DropdownItem>
      <DropdownItem class='relative px-1'>
        <Input type='text' placeholder='Search'  bind:value={$searchTerm} class='border-[#EBEDF0] border text-xs pl-6 text-[#323232] dark:text-white/[.7]'/>
        <Search size={14} class='text-[#323232] dark:text-white/[.7] absolute  left-2.5 top-1/2 -translate-y-1/2' />
      </DropdownItem>
      <!-- {#if resultGroupNodes?.length !== 0}
        {#each resultGroupNodes as node}
          <RecursiveNode {node} {handleNodeSelect} />
        {/each}
      {/if} -->
      {#if filteredNodes?.length !== 0}
      {#each filteredNodes as node}
        <RecursiveNode {node} {handleNodeSelect} />
      {/each}
    {:else}
      <DropdownItem>No Matchs</DropdownItem>
    {/if}
    </Dropdown>
    <div
      class={cn(
        `pointer-events-none absolute inset-y-0 right-0 items-center px-2 py-4 `,
      )}
    >
      <ChevronDown size={20} class="text-[#727272] dark:text-white/[.7]" />
    </div>
  </div>
  {#if url.includes(`/session/`)}
    <span class="flex items-center gap-2 justify-between flex-shrink-0">
      <AddCameraDialog sNode={""} {nodes}>
        <button
          class={`w-[26px] h-[26px] bg-[#F9F9F9] dark:bg-black rounded-full ${isAllFullScreen && "text-primary"} grid place-items-center disabled:cursor-not-allowed`}
        >
          <PlusCircle size={18} class="text-[#727272] dark:text-[#f9f9f9]" />
        </button>
      </AddCameraDialog>
      <!-- <EditNodeDialog>
        <button
          class={`w-[26px] h-[26px] bg-[#F9F9F9] dark:bg-black rounded-full ${isAllFullScreen && "text-primary"} grid place-items-center`}
        >
          <Edit size={18} class="text-[#727272] dark:text-[#f9f9f9]" />
        </button>
      </EditNodeDialog>
      <AlertDeleteNode onDelete={onDeleteNode}
        ><Button
          variant="ghost"
          size="icon"
          class={`w-[26px] h-[26px] bg-[#F9F9F9] dark:bg-black rounded-full ${isAllFullScreen && "text-primary"}`}
          ><Trash
            size={18}
            class="text-[#727272] dark:text-[#f9f9f9]"
          /></Button
        ></AlertDeleteNode
      > -->
    </span>
  {/if}
  <AddNodeModal {showAddNode} />
</div>
