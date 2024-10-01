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
  import PocketBase from "pocketbase";

  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");

  let dialogOpen = false;
  let captureMode = 1;
  const queryImage = writable();
  const searchResults = writable([]);
  const neededUrl = $page.url.hostname;
  let loading = false;
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);

  let startDateTime: string;
  let endDateTime: string;

  $: {
    if (!dialogOpen) {
      queryImage.set(null);
    }
  }

  function formatDateTime(dateTimeString: string): string {
    // Convert the local datetime string to a Date object
    const date = new Date(dateTimeString);
    // Format the date to RFC3339 format
    return date.toISOString();
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
    const file = e.target.files[0];
    if (file) {
      try {
        loading = true;
        let base64String = await convertImageToBase64(file);
        // const result = await fetch(`http://${neededUrl}:8083` + "/api/enroll", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     frame: base64String.replace(/^data:[^,]+,/, ""),
        //   }),
        // });
        // if (!result.ok) {
        //   const error = (await result.json()).error;
        //   console.error(error);
        //   toast.error("Something went wrong. Please try another");
        //   loading = false;
        //   return;
        // }
        // const croppedImage = await result.json();
        // queryImage.set(croppedImage);

        const search = await fetch(
          "http://localhost:8083" + "/api/faceSearch",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              baseImage: base64String.replace(/^data:[^,]+,/, ""),
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

  async function handleDateSearch() {
    if (!startDateTime || !endDateTime) {
      toast.error("Please select both start and end date/time.");
      return;
    }

    try {
      loading = true;
      const filter = `created >= "${formatDateTime(startDateTime)}" && created <= "${formatDateTime(endDateTime)}"`;

      const resultList = await PB.collection("events").getList(1, 50, {
        filter: filter,
        sort: "-created",
        expand: "camera",
      });

      if (resultList.items.length > 0) {
        searchResults.set(resultList.items);
      } else {
        toast("No events found in the selected time range.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching events.");
    } finally {
      loading = false;
    }
  }
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
    {:else if captureMode === 2}
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <label for="startDateTime" class="font-semibold whitespace-nowrap"
            >Start Time:</label
          >
          <Input
            bind:value={startDateTime}
            type="datetime-local"
            id="startDateTime"
          />
        </div>
        <div class="flex items-center gap-4">
          <label for="endDateTime" class="font-semibold whitespace-nowrap"
            >End Time:</label
          >
          <Input
            bind:value={endDateTime}
            type="datetime-local"
            id="endDateTime"
          />
        </div>
      </div>
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
      <Button
        type="button"
        on:click={() => {
          if (captureMode === 2) {
            handleDateSearch();
          }
        }}>Search</Button
      >
    </Dialog.Footer></Dialog.Content
  >
</Dialog.Root>
