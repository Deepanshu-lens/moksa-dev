<script lang="ts">
  import { toast } from "svelte-sonner";
  import * as Dialog from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib";
  import { writable } from "svelte/store";
  import { ChevronDown, X } from "lucide-svelte";
  import { page } from "@/stores";

  let dialogOpen = false;
  let captureMode = 1;
  let username: string = "";

  const registrationImages = writable<string[]>([]);
  const imposterImages = writable<string[]>([]);
  const avgFeatures = writable();

  const neededUrl = $page.url.hostname;

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
      let frame = webcamCanvas.toDataURL("image/jpeg");
      const result = await fetch(`http://${neededUrl}:8083` + "/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ frame: frame.replace(/^data:[^,]+,/, "") }),
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

      registrationImages.update((images) => [...images, croppedImage]);
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
          const result = await fetch(
            `http://${neededUrl}:8083` + "/api/enroll",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                frame: base64String.replace(/^data:[^,]+,/, ""),
              }),
            }
          );
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

          if ($registrationImages.length === 0) {
            registrationImages.update((images) => [...images, croppedImage]);
            updateFeature(croppedImage);
          } else {
            // updateFeature(croppedImage);
            const res = compareToGallery(
              croppedImage.bboxes[0].Feature,
              $avgFeatures
            );
            console.log(res);
            if (res > 0.3) {
              console.log("image added to registration");
              registrationImages.update((images) => [...images, croppedImage]);
            } else {
              console.log("image added to imposter set");
              imposterImages.update((image) => [...image, croppedImage]);
            }
          }
        } catch (e) {
          console.error(e);
          toast.error("Something went wrong. Please try another file.");
        }
      }
    }
  };

  export function averagefeatures1D(basefeatures, AverageFeatures) {
    console.log("averageFeatures getting called");

    const averageValue = [];
    for (let i = 0; i < AverageFeatures.length; i++) {
      averageValue.push((AverageFeatures[i] + basefeatures[i]) / 2);
    }
    return averageValue;
  }

  function updateFeature(image) {
    if ($avgFeatures) {
      avgFeatures.set(averagefeatures1D(image.bboxes[0].Featue, $avgFeatures));
    } else {
      avgFeatures.set(image.bboxes[0].Feature);
    }
  }

  function removeImageReg(index: number) {
    registrationImages.update((images) => {
      return images.filter((_, i) => i !== index);
    });
  }
  function removeImageImp(index: number) {
    imposterImages.update((images) => {
      return images.filter((_, i) => i !== index);
    });
  }

  function magnitude(vector) {
    return Math.sqrt(vector.reduce((acc, val) => acc + val ** 2, 0));
  }
  function normalize(vector) {
    const mag = magnitude(vector);
    return vector.map((val) => val / mag);
  }
  function dotProduct(v1, v2) {
    return v1.reduce((acc, val, i) => acc + val * v2[i], 0);
  }

  export function compareToGallery(queryVector1, queryVector2) {
    // console.log("querygallery",queryVector,galleryVectors)
    const queryVectorNormalized = normalize(queryVector1);
    const galleryVectorNormalized = normalize(queryVector2);
    const similarities = dotProduct(
      queryVectorNormalized,
      galleryVectorNormalized
    );
    console.log("similarities", similarities);
    return similarities;
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
    fetch(`/api/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, data: [...$registrationImages] }),
    }).then(() => {
      toast.success(`${username} successfully added to gallery`);
      registrationImages.set([]);
      imposterImages.set([]);
      avgFeatures.set(null);
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
    <div class="w-full flex flex-col items-start justify-center py-4 gap-4">
      <p class="text-[#00132B] dark:text-slate-100">
        Choose from the options below to register your images
      </p>
      <span class="flex items-center justify-between w-full gap-4">
        <button
          class={captureMode !== 1
            ? "text-[#00132B] dark:text-slate-300 flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] font-semibold "
            : " text-[#00132B] flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] font-semibold "}
          on:click={() => (captureMode = 1)}
        >
          <input type="radio" checked={captureMode === 1} />
          Capture image live
        </button>
        <button
          class={captureMode !== 2
            ? "text-[#00132B] dark:text-slate-300 flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] font-semibold"
            : "text-[#00132B] flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] font-semibold"}
          on:click={() => (captureMode = 2)}
        >
          <input type="radio" checked={captureMode === 2} />
          Upload Image
        </button>
      </span>
      <label for="username" class=" text-[#00132B] dark:text-slate-100">
        Username
      </label>
      <span class="relative">
        <input
          name="Person Name"
          type="text"
          class="w-[655px] h-[48px] relative rounded-lg pl-4 border-[2px] border-solid border-[rgb(145,158,171)]/[.24] focus:border-[#136ad5] placeholder-[#939393] bg-background"
          placeholder="Type or select name"
          bind:value={username}
        />

        <ChevronDown
          class="absolute top-1/2 -translate-y-1/2 right-4 text-[#939393] h-[20px] w-[20px]"
        />
      </span>
    </div>
    {#if captureMode === 1}
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        bind:this={webcamSource}
        class="h-[420px] w-[650px] lg:w-[500px] lg:h-[290px] self-center mx-auto"
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
            <!-- Start a new row after every 4 images -->
            <div class="w-full"></div>
          {/if}
        {/each}
      </div>

      <canvas bind:this={webcamCanvas} style="display: none;"></canvas>
      <Button
        class="w-[650px] lg:w-[500px] mx-auto"
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
        disabled={$registrationImages.length > 0}
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
              height="100px"
              class="aspect-square"
            />
            <button
              class="absolute top-0 right-0 bg-white text-[red] p-1 rounded-full scale-75 grid place-items-center"
              on:click={() => removeImageReg(index)}
            >
              <X />
            </button>
          </div>
          {#if (index + 1) % 4 === 0}
            <div class="w-full"></div>
          {/if}
        {/each}
        {#each $imposterImages as image, index}
          <div
            class={cn("border-4 relative flex flex-row")}
            style="margin: 5px;"
          >
            <img
              src={"data:image/jpeg;base64," + image.bboxes[0].Image}
              alt="captured"
              width="100px"
              height="100px"
              class="aspect-square blur-md"
            />
            <button
              class="absolute top-0 right-0 bg-white text-[red] p-1 rounded-full scale-75 grid place-items-center"
              on:click={() => removeImageImp(index)}
            >
              <X />
            </button>
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
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
