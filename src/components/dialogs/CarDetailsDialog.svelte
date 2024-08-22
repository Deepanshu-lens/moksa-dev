<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import { Label } from "../ui/label";
  export let plateImage: string;
  export let plateNumber: string;
  export let carColor: string;
  export let fullImage: string;
  let isOpen = false;
</script>

<Dialog.Root bind:open={isOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Car Details</Dialog.Title>
      <Dialog.Description>{plateNumber}</Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-2 items-center gap-4">
        <Label for="plate-number">Plate Number</Label>
        {plateNumber}
      </div>
      <div class="grid grid-cols-2 items-center gap-4">
        <Label for="plate-number">Car Color</Label>
        {carColor}
      </div>
      <div class="grid grid-cols-2 items-center gap-4">
        <Label for="plate-image">Plate Image</Label>
        <img src={"data:image/jpeg;base64," + plateImage} alt="plate-img" />
      </div>
      <div class="grid grid-cols-2 items-center gap-4">
        <Label for="plate-image">Car Image</Label>
        <img
          src={"data:image/jpeg;base64," + fullImage}
          alt="plate-img"
          width="350px"
        />
      </div>

      <Dialog.Footer></Dialog.Footer>
    </div></Dialog.Content
  >
</Dialog.Root>
