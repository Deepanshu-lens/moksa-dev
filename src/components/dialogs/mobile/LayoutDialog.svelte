<script lang="ts">
  import { toast } from "svelte-sonner";
  import { selectedNode } from "@/stores";
  import * as Dialog from "@/components/ui/dialog";
  import { cn } from "@/lib";
  import { Columns2, RectangleVertical } from "lucide-svelte";

  let selectedValue;
  let layoutValue = $selectedNode.mobileLayout;
  let dialogOpen = false;

  export let orientation: string | null;

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;

    if (checked) {
      $selectedNode.set({
        ...$selectedNode,
        mobileLayout: value,
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    handleCheckboxChange({
      target: { value: selectedValue, checked: true },
    });
    const update = await fetch("/api/node/mobileLayoutUpdate", {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        nodeId: $selectedNode.id,
        newValue: selectedValue,
      }),
    });
    if (!update.ok) {
      toast.error(
        "Something went wrong while updating mobile layout, please try again"
      );
    } else {
      toast("Mobile layout updated successfully!");
    }
    dialogOpen = false;
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    class={`max-w-[90%] ${orientation === "landscape" ? "rotate-90 scale-90" : ""}`}
  >
    <Dialog.Header
      ><Dialog.Title>Screen Layout</Dialog.Title>
      <Dialog.Description>Change Screen Layout</Dialog.Description
      ></Dialog.Header
    >
    <form on:submit={onSubmit}>
      <div
        class="flex flex-wrap items-center justify-center gap-4 w-full py-10 px-4"
      >
        <div
          class="flex flex-col items-center justify-evenly py-4 mt-2 text-black dark:text-white w-[120px]"
        >
          <button
            on:click={(e) => {
              e.preventDefault();
              selectedValue = 2;
            }}
            class={layoutValue === 2 && !selectedValue
              ? "px-2 border border-solid border-[#015a62] w-full rounded-md text-[#015a62]"
              : selectedValue === 2
                ? "px-2 border border-solid border-[#015a62] w-full rounded-md text-[#015a62]"
                : ""}
          >
            <span class="flex flex-col items-center p-2 w-full">
              <Columns2 class="h-[60px] w-[60px]" />
              <span class="text-sm">2 Columns</span>
            </span>
          </button>
        </div>

        <div
          class="flex flex-col items-center justify-evenly py-4 mt-2 text-black dark:text-white w-[120px]"
        >
          <button
            on:click={(e) => {
              e.preventDefault();
              selectedValue = 1;
            }}
            class={layoutValue === 1 && !selectedValue
              ? "px-2 border border-solid border-[#015a62] w-full rounded-md text-[#015a62]"
              : selectedValue === 1
                ? "px-2 border border-solid border-[#015a62] w-full rounded-md text-[#015a62]"
                : ""}
          >
            <span class="flex flex-col items-center p-2 w-full">
              <RectangleVertical class="h-[60px] w-[60px]" />
              <span class="text-sm">1 column</span>
            </span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="flex items-center justify-center mx-auto my-4 px-8 py-2 bg-[#015a62] text-white rounded-md"
      >
        Okay
      </button>
    </form>
  </Dialog.Content>
</Dialog.Root>
