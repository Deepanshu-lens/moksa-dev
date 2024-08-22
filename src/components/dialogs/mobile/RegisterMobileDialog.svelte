<!-- <script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { cn } from "@/lib";
  import { writable } from "svelte/store";
  let dialogOpen = false;
  let captureMode = 1;
  const registreationImages = writable<string[]>([]);
  
</script> -->

<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { cn } from "@/lib";
  import { writable } from "svelte/store";
  import { Button } from "@/components/ui/button";
  import { ChevronDown } from "lucide-svelte";

  let dialogOpen = false;
  let captureMode = 1;
  let username: string = "";
  const registrationImages = writable<string[]>([]);
  let webcamSource: HTMLVideoElement;
  let webcamCanvas: HTMLCanvasElement;
  let stream: MediaStream;

  const openWebcam = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // This specifies the front camera
      });
      webcamSource.srcObject = stream;
      await webcamSource.play();
    } catch (error) {
      console.error(error);
      toast.error("Could not access the camera");
    }
  };

  const closeWebcam = () => {
    stream.getTracks().forEach((track) => track.stop());
    webcamSource.srcObject = null;
  };

  let loading = false;
  async function capturePhoto() {
    const context = webcamCanvas.getContext("2d");
    if (context) {
      webcamCanvas.width = webcamSource.videoWidth;
      webcamCanvas.height = webcamSource.videoHeight;
      context.drawImage(
        webcamSource,
        0,
        0,
        webcamSource.videoWidth,
        webcamSource.videoHeight,
      );
      let frame = webcamCanvas.toDataURL("image/jpeg");
      // Process the captured frame as needed, for example, by sending it to a server
      registrationImages.update((images) => [...images, frame]);
    }
  }

  async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  const onFileUpload = async (e) => {
    console.log(e.target.files);
    const files = Array.from(e.target.files).filter(
      (file) => file.name !== ".DS_Store" && file.type !== "",
    );
    if (files.length > 0) {
      for (const file of files) {
        try {
          let base64String = await convertImageToBase64(file);
          const result = await fetch("http://localhost:8083" + "/api/enroll", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              frame: base64String.replace(/^data:[^,]+,/, ""),
            }),
          });
          console.log("File upload status:", result.status);
          if (!result.ok) {
            const error = (await result.json()).error;
            console.error("Error:", error);
            toast.error("Something went wrong. Please try another");
            loading = false;
            return;
          }
          const croppedImage = await result.json();
          loading = false;

          registrationImages.update((images) => [...images, croppedImage]);
        } catch (e) {
          console.error(e);
          toast.error("Something went wrong. Please try another file.");
        }
      }
    }
  };

  $: if (dialogOpen && captureMode === 1) {
    openWebcam();
  }

  $: if (!dialogOpen && stream) {
    closeWebcam();
  }

  const onSubmit = () => {
    fetch(`/api/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, data: [...$registrationImages] }),
    }).then(() => {
      toast.success(`${username} successfully added to gallery`);
      registrationImages.set([]);
      username = "";
      dialogOpen = false;
    });
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content
    class="w-[90%] max-h-[70%] z-[60] overflow-y-scroll overflow-x-clip top-10 translate-y-0"
  >
    <Dialog.Header class="w-full">
      <Dialog.Title>Register Face</Dialog.Title>
      <Dialog.Description
        >Register a new person to the Gallery</Dialog.Description
      >
    </Dialog.Header>
    <div class="w-full flex flex-col items-start justify-center py-4 gap-4">
      <p class="text-[#00132B] dark:text-slate-100">
        Choose from the options below to register your images
      </p>
      <span class="flex items-center justify-start w-full gap-4">
        <button
          class={captureMode !== 1
            ? "text-[#00132B] dark:text-slate-300 flex-shrink-0 w-1/2 flex flex-row items-center h-[67px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] font-medium text-sm "
            : " text-[#00132B] flex-shrink-0 w-1/2 flex flex-row items-center h-[67px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] font-medium text-sm "}
          on:click={() => (captureMode = 1)}
        >
          <input type="radio" checked={captureMode === 1} />
          Capture image live
        </button>
        <button
          class={captureMode !== 2
            ? "text-[#00132B] dark:text-slate-300 flex-shrink-0 w-1/2 flex flex-row items-center h-[67px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] font-medium text-sm"
            : "text-[#00132B] flex-shrink-0 w-1/2 flex flex-row items-center h-[67px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] font-medium text-sm"}
          on:click={() => (captureMode = 2)}
        >
          <input type="radio" checked={captureMode === 2} />
          Upload Image
        </button>
      </span>
      <label for="username" class=" text-[#00132B] dark:text-slate-100">
        Username
      </label>
      <span class="relative w-full">
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
    </div>
    {#if captureMode === 1}
      <video
        bind:this={webcamSource}
        class=" w-[80%] aspect-square self-center mx-auto"
      />
      <div class="flex flex-wrap justify-center">
        {#each $registrationImages as image, index}
          <div
            class={cn("border-4 relative flex flex-row")}
            style="margin: 5px;"
          >
            <img
              src={"data:image/jpeg;base64," + image.bboxes[0].Image}
              alt="captured"
              width="100px"
            />
          </div>
          {#if (index + 1) % 4 === 0}
            <div class="w-full"></div>
          {/if}
        {/each}
      </div>

      <canvas bind:this={webcamCanvas} style="display: none;"></canvas>
      <Button
        class="w-[70%] mx-auto"
        on:click={capturePhoto}
        disabled={loading || $registrationImages.length >= 8}
        >Capture photo</Button
      >
    {:else}
      <p class="text-[#00132B] dark:text-slate-100">Upload a folder</p>
      <input
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[#015A62] focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        type="file"
        multiple
        id="flder"
        webkitdirectory
        on:input={onFileUpload}
      />
      <p class="text-[#00132B] dark:text-slate-100">Upload single images</p>
      <Input
        id="picture"
        type="file"
        accept="image/*"
        class="cursor-pointer"
        on:input={onFileUpload}
      />
      <div class="flex flex-wrap justify-center">
        {#each $registrationImages as image, index}
          <div
            class={cn("border-4 relative flex flex-row")}
            style="margin: 5px;"
          >
            <img
              src={"data:image/jpeg;base64," + image.bboxes[0].Image}
              alt="captured"
              width="100px"
            />
          </div>
          {#if (index + 1) % 4 === 0}
            <div class="w-full"></div>
          {/if}
        {/each}
      </div>
    {/if}

    <Dialog.Footer>
      <Button
        type="submit"
        on:click={onSubmit}
        disabled={$registrationImages.length === 0 || username === ""}
        >Add Person</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
