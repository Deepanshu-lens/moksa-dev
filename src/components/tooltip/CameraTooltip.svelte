<script lang="ts">
  import { CameraIcon, RadioIcon } from "lucide-svelte";
  import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
  import { selectedNode } from "@/lib/stores";
  import { toast } from "svelte-sonner";
  let newName: string = "";
  let doRename = false;
  export let name: string;
  export let url: string;
  export let active: boolean;
  export let icon: string;
  export let id: string;

  function onRename(newName: string) {
    if (icon === "") {
      console.log("updating camera");
      fetch("/api/camera/editCamera", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cameraId: id,
          nodeId: $selectedNode.id,
          name: newName,
          url,
        }),
      })
        .then(() => {
          toast(`${name} updated to ${newName}!`);
          name = newName;
          doRename = false;
        })
        .catch((err) => console.log(err));
    } else {
      console.log("updaing node");
      fetch(`/api/node/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          id: $selectedNode.id,
        }),
      })
        .then((res) => {
          toast(`${name} upadted to ${newName}!`);
          name = newName;
          doRename = false;
        })
        .catch((err) => console.log(err));
    }
  }

  function onDelete() {
    if (icon === "") {
      fetch("/api/camera/deleteCamera", {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cameraId: id,
          nodeId: $selectedNode.id,
          name,
          url,
        }),
      })
        .then(() => {
          toast(`Camera:${name} deleted!`);
        })
        .catch((err) => console.log(err));
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Tooltip>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class={active
      ? "bg-[rgba(1,90,98,.12)] text-black dark:text-[white] dark:bg-[#333] sm:dark:hover:text-white  flex justify-between items-center gap-4 py-2 px-2 mx-2 mb-2 group rounded-lg"
      : " flex justify-between sm:hover:bg-[rgba(1,90,98,.12)] sm:dark:hover:bg-[#333] dark:bg-[#1b1b1b] text-black dark:text-[#828282] sm:dark:hover:text-[white] sm:hover:text-black bg-white items-center gap-4 py-2 px-2 mx-2 mb-2 group rounded-lg"}
    on:click={() => {
      if (icon.length > 0) {
        console.log(icon);
      } else {
        active = active === id ? null : id;
      }
    }}
    on:mouseleave={() => {
      if (doRename) doRename = false;
    }}
  >
    <div class="flex items-center justify-center gap-4 cursor-pointer">
      {#if icon}
        <RadioIcon />
      {:else}
        <CameraIcon />
      {/if}
      <TooltipTrigger>
        {#if doRename}
          <div class="relative mt-2">
            <input
              type="text"
              name="camera-name"
              id="camera-name"
              class="block border-0 px-1 py-1 text-gray-900
                        placeholder:text-gray-400
                        bg-transparent
                        sm:max-w-[120px] max-w-[100px]
                        focus:border-b-2
                        focus:border-indigo-600
                        dark:text-[#979797] sm:text-sm sm:leading-6"
              placeholder={name}
              aria-describedby="camera-name"
              on:click={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              on:input={(e) => (newName = e.target.value)}
            />
            <div
              class="absolute inset-x-0 bottom-0 border-t border-gray-300 focus:border-t-2 focus:border-indigo-600"
              aria-hidden="true"
            />
          </div>
        {:else}
          <span>
            <!-- name -->
            {name.length > 10 ? `${name.substring(0, 10)}....` : name}
          </span>
        {/if}
      </TooltipTrigger>
      <TooltipContent>
        <p>Name : {name}</p>
        <p>Url : {url}</p>
      </TooltipContent>
    </div>
    <div
      class={active
        ? "flex items-center justify-center gap-2 "
        : "hidden items-center justify-center gap-2 sm:group-hover:flex"}
    >
      <button
        on:click={(e) => {
          if (doRename) {
            e.stopPropagation();
            e.preventDefault();
            onRename(newName);
          } else {
            e.stopPropagation();
            e.preventDefault();
            doRename = true;
          }
        }}
        class="text-[#015A62] text-xs cursor-pointer hover:scale-110"
      >
        {doRename ? "Update" : "Rename"}
      </button>

      <button
        on:click={(e) => {
          e.stopPropagation();
          e.preventDefault();
          doRename ? (doRename = false) : onDelete();
        }}
        class="text-[#015A62] text-xs cursor-pointer hover:scale-110"
      >
        <!-- <CameraDeleteDialog {name} {onDelete} {icon} /> -->
        {doRename ? "Cancel" : "Delete"}
      </button>
    </div>
  </div>
</Tooltip>
