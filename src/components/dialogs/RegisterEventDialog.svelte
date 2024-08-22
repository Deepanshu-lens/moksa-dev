<script lang="ts">
  import { page } from "$app/stores";
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { ChevronDown } from "lucide-svelte";

  let dialogOpen = false;
  let username: string = "";
  export let registrationImages;
  export let data;

  const onSubmit = () => {
    const content = {
      template: data.feature,
      feature: data.feature,
      images: [registrationImages],
    };
    fetch(`/api/enrollFRS`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, data: content }),
    }).then(() => {
      toast.success(`${username} successfully added to gallery`);
      username = "";
      dialogOpen = false;
    });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px] xl:scale-95 2xl:scale-100">
    <Dialog.Header>
      <Dialog.Title>Register Face</Dialog.Title>
      <Dialog.Description
        >Register a new person to the Gallery</Dialog.Description
      >
    </Dialog.Header>

    <label for="username" class=" text-[#00132B] dark:text-slate-100">
      Username
    </label>
    <span class="relative">
      <input
        name="Person Name"
        type="text"
        class="w-full h-[48px] relative rounded-lg pl-4 border-[2px] border-solid border-[rgb(145,158,171)]/[.24] focus:border-[#136ad5] placeholder-[#939393] bg-background"
        placeholder="Type or select name"
        bind:value={username}
      />

      <ChevronDown
        class="absolute top-1/2 -translate-y-1/2 right-4 text-[#939393] h-[20px] w-[20px]"
      />
    </span>
    <div class="p-4 mx-auto">
      <p class="text-xl font-medium text-center pb-2">Detected Image</p>
      <img
        src={"data:image/jpeg;base64," + registrationImages}
        alt="captured"
        width="200px"
        height="200px"
        class="aspect-square"
      />
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={onSubmit} disabled={username === ""}
        >Add Person</Button
      >
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
