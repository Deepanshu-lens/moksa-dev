<script lang="ts">
  import Button from "@/components/ui/button/button.svelte";
  import * as Dialog from "@/components/ui/dialog";
  import * as Select from "@/components/ui/select/index";
  import Input from "@/components/ui/input/input.svelte";
  import Label from "@/components/ui/label/label.svelte";
  import Textarea from "@/components/ui/textarea/textarea.svelte";
  import { X } from "lucide-svelte";

  let isOpen = true;

  function openModal() {
    isOpen = true;
  }

  function closeModal() {
    isOpen = false;
  }

  const stores = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes" },
    { value: "pineapple", label: "Pineapple" },
  ];
  const cameras = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes" },
    { value: "pineapple", label: "Pineapple" },
  ];
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content closeButton={false} class="max-w-[500px]">
    <Dialog.Header class="relative">
      <Dialog.Title class="text-2xl font-semibold">Raise a Ticket</Dialog.Title>
      <button
        class="absolute -top-1 right-4 p-2 grid place-items-center rounded-full text-[#E71D36] bg-[#E71D36]/15 cursor-pointer"
        on:click={() => (isOpen = false)}
      >
        <X class="h-4 w-4" />
      </button>
    </Dialog.Header>
    <div class="flex flex-col items-start gap-4 py-4">
      <div class="flex flex-col items-start gap-2">
        <Label for="node-name" class="text-md font-medium">Select Store</Label>
        <Select.Root portal={null}>
          <Select.Trigger class="min-w-[450px] text-gray-500">
            <Select.Value placeholder="Select store" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each stores as store}
                <Select.Item value={store.value} label={store.label}
                  >{store.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
      </div>
      <div class="flex flex-col items-start gap-2">
        <Label for="node-name" class="text-md font-medium">Select Camera</Label>
        <Select.Root portal={null}>
          <Select.Trigger class="min-w-[450px] text-gray-500">
            <Select.Value placeholder="Select camera" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each cameras as camera}
                <Select.Item value={camera.value} label={camera.label}
                  >{camera.label}</Select.Item
                >
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="favoriteFruit" />
        </Select.Root>
      </div>
      <div class="flex flex-col items-start gap-2">
        <Label for="node-name" class="text-md font-medium">Issue</Label>
        <Textarea
          class="min-w-[450px]"
          placeholder="word limit 200"
          maxlength={200}
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button type="submit" variant="secondary">Cancel</Button>
      <Button type="submit" variant="default" class="px-10">Submit</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
