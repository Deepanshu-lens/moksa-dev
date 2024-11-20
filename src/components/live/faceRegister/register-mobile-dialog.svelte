<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { writable } from "svelte/store";
  import { ChevronDown, X } from "lucide-svelte";
  import { cn } from "@/lib/utils";

  let dialogOpen = false;
  let captureMode = 1;
  let username: string = "";
  let employee: boolean = false;
  let aadhar: string = "";
  let department: string = "";
  let addingPerson: boolean = false;

  const registrationImages = writable<string[]>([]);
  const imposterImages = writable<string[]>([]);
  const avgFeatures = writable();

  const neededUrl = "https://ai.lenscorp.cloud/face";

  let webcamSource: HTMLVideoElement;
  let webcamCanvas: HTMLCanvasElement;
  let stream: MediaStream;

  const openWebcam = async () => {
    try {
      // loading = true;
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      webcamSource.srcObject = stream;
      webcamSource.play();

      // loading = false;
    } catch (error) {
      console.log(error);
    }
  };

  const closeWebcam = async () => {
    stream.getTracks().forEach((track) => {
      console.log(track);
      if (track.readyState == "live" && track.kind === "video") {
        track.stop();
        track.enabled = false;
      }
      webcamSource.srcObject = null;
    });
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
        webcamSource.videoHeight
      );
      loading = true;
      // Convert the canvas to a Base64 image
      let base64Image = webcamCanvas.toDataURL("image/jpeg");
      const result = await fetch(`${neededUrl}/get_crop_align`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Use the Base64 image directly in the API request
        body: JSON.stringify({
          image: [base64Image.replace(/^data:[^,]+,/, "")],
        }),
      });
      if (!result.ok) {
        const error = (await result.json()).error;
        console.error(error);
        toast.error("Something went wrong. Please try another");
        loading = false;
        return;
      }
      const croppedImage = await result.json();
      loading = false;

      registrationImages.update((images) => [
        ...images,
        croppedImage?.cropped_images?.[0],
      ]);
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

  $: if (!dialogOpen) {
    registrationImages.set([]);
    imposterImages.set([]);
    avgFeatures.set(null);
  }

  const onFileUpload = async (e) => {
    console.log(e.target.files);
    const files = Array.from(e.target.files).filter(
      (file) => file.name !== ".DS_Store" && file.type !== ""
    );
    if (files.length > 0) {
      for (const file of files) {
        try {
          let base64String = await convertImageToBase64(file);
          const result = await fetch(`${neededUrl}/get_crop_align`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: [base64String.replace(/^data:[^,]+,/, "")],
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
          const { cropped_images } = await result.json();
          loading = false;

          registrationImages.update((images) => [...images, ...cropped_images]);
        } catch (e) {
          console.error(e);
          toast.error(
            e?.message || "Something went wrong. Please try another file."
          );
        }
      }
    }
  };

  function removeImageReg(index: number) {
    registrationImages.update((images) => {
      return images.filter((_, i) => i !== index);
    });
  }

  $: {
    if (dialogOpen && captureMode == 1) {
      console.log("!");
      openWebcam();
    }
  }

  $: {
    if (!dialogOpen && stream) {
      console.log("Closing");
      closeWebcam();
    }
  }

  const onSubmit = () => {
    addingPerson = true;
    try {
      fetch(`${neededUrl}/set_gallery_features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
          image: [...$registrationImages],
        }),
      })
        .then(() => {
          toast.success(`${username} successfully added to gallery`);
          registrationImages.set([]);
          imposterImages.set([]);
          avgFeatures.set(null);
          username = "";
          dialogOpen = false;
        })
        .catch((error) => {
          console.log(error?.message, "error while register face");
          toast.error(
            error?.message || "something went wrong while adding person!!"
          );
        });
    } catch (error) {
      console.log(error?.message, "erorr here");
      toast.error(
        error?.message || "something went wrong while adding person!!"
      );
    }

    addingPerson = false;
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
      <!-- svelte-ignore a11y_media_has_caption -->
      <!-- svelte-ignore element_invalid_self_closing_tag -->
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
              src={"data:image/jpeg;base64," + image}
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
        variant="brand"
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
              src={"data:image/jpeg;base64," + image}
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
        variant="brand"
        type="submit"
        on:click={onSubmit}
        disabled={$registrationImages.length === 0 || username === ""}
        >Add Person</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
