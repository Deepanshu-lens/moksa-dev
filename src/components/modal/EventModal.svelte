<script lan="ts">
  import { selectedNode } from "@/lib/stores";
  import { X } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let selectedEvent;

  let event = selectedEvent;
  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch("close");
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={closeModal}>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <article
    class={`modal-content relative items-center m-4 p-4 bg-background
            flex flex-col rounded-xl shadow-md text-base border hover:scale-[1.01] dark:shadow-slate-800 hover:shadow-lg
        `}
    on:click|stopPropagation
  >
    <button
      on:click={closeModal}
      class="absolute top-2 right-2 grid place-items-center"
    >
      <X size={20} />
    </button>

    <img
      class="obejct-contain w-[180px] h-[150px] rounded-sm"
      alt="portrait alert"
      src={"data:image/jpeg;base64," + event.frameImage}
    />
    <div class="flex items-center w-full pt-2">
      <h3 class={"text-lg font-medium"}>
        {#if event.title.includes("car") && event.description !== ""}
          {event.description} {event.title}
        {:else}
          {event.title}
        {/if}
      </h3>
    </div>
    <p class={`text-base w-full`}>
      Camera {$selectedNode.camera.filter((c) => c.id === event.camera)[0] &&
        $selectedNode.camera.filter((c) => c.id === event.camera)[0].name}
    </p>
    <div class="flex items-center justify-between w-full pt-2">
      <p class={`text-xs text-[#D28E3D]`}>
        {event.matchScore !== 0 &&
        event.matchScore !== undefined &&
        event.matchScore !== null
          ? `Match Score : ${event?.matchScore.toFixed(3)}`
          : "No matches found"}
      </p>
      <p class={`text-center text-xs font-bold`}>
        Detect Score : {event?.score.toFixed(3)}
      </p>
    </div>
    <div class="flex flex-row-reverse w-full items-center justify-between pt-2">
      <p class={`text-xs`}>
        {event.created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
      <p class={"text-xs"}>
        {event.created.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
    <!-- <button class="close-button" on:click={closeModal}>✖</button>
    <img
      class="object-cover w-24 h-24 rounded-md col-span-1"
      src={"data:image/jpeg;base64," + event.frameImage}
      alt="Team Member"
    />
    <div class="col-span-1 tex-center flex flex-col items-center gap-1">
      <h3 class={"text-base"}>
        {#if event.title.includes("car") && event.description !== ""}
          {event.description} {event.title}
        {:else}
          {event.title}
        {/if}
      </h3>
      <p class={`text-xs`}>
        Camera {$selectedNode.camera.filter((c) => c.id === event.camera)[0] &&
          $selectedNode.camera.filter((c) => c.id === event.camera)[0].name}
      </p>
      <p class={`text-center text-xs font-bold`}>
        Detection Score : {event?.score}
      </p>
      <p class={`text-center "text-xs`}>
        {event.matchScore !== 0 &&
        event.matchScore !== undefined &&
        event.matchScore !== null
          ? `Matching Score : ${event?.matchScore}`
          : "No matches found"}
      </p>
    </div>
    <div class="col-span-2 mx-auto">
      <p class={`text-sm`}>
        {event.created.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
      <p class={"text-sm"}>
        {event.created.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div> -->
  </article>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    width: 280px;
    height: 300px;
    position: relative;
    max-width: 500px;
    margin: auto;
    z-index: 1001;
  }
</style>
