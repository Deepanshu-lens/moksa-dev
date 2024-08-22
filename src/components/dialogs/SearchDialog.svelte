<script lang="ts">
  import * as Dialog from "@/components/ui/dialog";
  import { Button } from "../ui/button";
  import { Input } from "../ui/input";
  import { toast } from "svelte-sonner";
  import { writable } from "svelte/store";
  import en from "javascript-time-ago/locale/en";
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import TimeAgo from "javascript-time-ago";
  import { page } from "$app/stores";

  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");

  let dialogOpen = false;
  let captureMode = 1;
  const queryImage = writable();
  const searchResults = writable([]);
  // const location = window?.location?.href;
  // const neededUrl =
  //   location?.split("/")[2] === "localhost:5173"
  //     ? PUBLIC_BASE_URL
  //     : location?.split("/")[2]?.split(":")[0];

  const neededUrl = $page.url.hostname;

  $: {
    if (!dialogOpen) {
      queryImage.set(null);
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
  let loading = false;
  const onFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        loading = true;
        let base64String = await convertImageToBase64(file);
        const result = await fetch(`http://${neededUrl}:8083` + "/api/enroll", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            frame: base64String.replace(/^data:[^,]+,/, ""),
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
        queryImage.set(croppedImage);

        const search = await fetch(
          "http://localhost:8083" + "/api/faceSearch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              feature: croppedImage.bboxes[0].Feature,
            }),
          },
        );
        if (!search.ok) {
          const error = (await result.json()).error;
          console.error(error);
          toast.error("Something went wrong. Please try another");
          loading = false;
          return;
        }
        var x = await search.json();
        console.log(x);

        if (x.gallery !== "") {
        }

        if (x.events.length > 0) {
          const events = await fetch("/api/events/getMany", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ids: x.events.slice(0, 10),
            }),
          });
          if (!events.ok) {
            const error = (await result.json()).error;
            console.error(error);
            toast.error("Something went wrong. Please try another");
            loading = false;
            return;
          }

          const eventsData = await events.json();
          searchResults.set([...eventsData.events]);
        } else {
          toast("No recorded events of this person!");
        }
      } catch (e) {
        console.error(e);
        toast.error("Something went wrong. Please try another file.");
      }
    }
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Face Search</Dialog.Title>
      <Dialog.Description
        >Register a new person to the Gallery</Dialog.Description
      >
    </Dialog.Header>
    <span class="flex items-center justify-start w-full gap-4">
      <button
        on:click={() => (captureMode = 1)}
        class={captureMode !== 1
          ? "text-[#00132B] dark:text-slate-200 flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] font-semibold text-lg tracking-[-0.03em]"
          : " text-[#00132B] flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] font-semibold text-lg tracking-[-0.03em]"}
      >
        <input type="radio" checked={captureMode === 1} />
        Face Search
      </button>
      <button
        on:click={() => (captureMode = 2)}
        disabled
        class={captureMode !== 2
          ? "text-[#00132B] dark:text-slate-200 flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[rgb(145,158,171)]/[.24] text-lg font-semibold tracking-[-0.03em]"
          : "text-[#00132B] flex flex-row items-center h-[67px] w-[320px] px-4 py-2 justify-start gap-4 rounded-lg border-[1px] border-solid border-[#136ad5] bg-[#ecf3fc] text-lg font-semibold tracking-[-0.03em]"}
      >
        <input type="radio" checked={captureMode === 2} disabled />
        Date Search
      </button>
    </span>

    {#if captureMode === 1}
      <Input
        id="picture"
        type="file"
        accept="image/*"
        on:input={onFileUpload}
      />
    {/if}

    {#if $queryImage}
      <span
        class="font-bold text-slate-600 dark:text-slate-300 text-lg tracking-wide"
      >
        Query face
      </span>
      <img
        src={"data:image/jpeg;base64," + $queryImage.bboxes[0].Image}
        alt="captured"
        width="100px"
      />
    {/if}

    <!-- <div class="flex flex-row items-center flex-wrap gap-x-2 mx-auto"> -->
    {#if $searchResults.length > 0}
      <span
        class="font-bold text-slate-600 dark:text-slate-300 text-lg tracking-wide"
      >
        Recent match items!
      </span>
    {/if}
    <div
      class="grid grid-cols-3 grid-rows-4 place-items-center gap-x-2 gap-y-2 mx-auto w-full"
    >
      {#each $searchResults as result}
        <span class="flex flex-col items-start gap-y-2">
          <img
            src={"data:image/jpeg;base64," + result.frameImage}
            alt="resultImage"
            width="100px"
          />
          <p class="text-sm font-semibold">
            Camera Name: <span class="font-bold text-primary">
              {result?.expand?.camera?.name}
            </span>
          </p>
          <p class="text-sm font-semibold">
            Last seen: <span class="font-bold text-primary">
              {timeAgo?.format(new Date(result.created))}
            </span>
          </p>
        </span>
      {/each}
    </div>

    <Dialog.Footer>
      <Button type="submit">Search</Button>
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
