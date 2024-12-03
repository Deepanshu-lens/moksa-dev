<script lan="ts">
  import { selectedNode } from "@/lib/stores";
  import { EditIcon, ScanFace, X } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";

  export let selectedEvent;

  let event = selectedEvent;
  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch("close");
  }
  const date = new Date(event.created);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="modal-backdrop" on:click={closeModal}>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <article
    class={`modal-content relative p-6 bg-background
              flex flex-col rounded-xl shadow-md text-base border hover:scale-[1.01] dark:shadow-slate-800 hover:shadow-lg
          `}
    on:click|stopPropagation
  >
    <!-- <button
      on:click={closeModal}
      class="absolute top-2 right-2 grid place-items-center"
    >
      <X size={20} />
    </button> -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold capitalize">
        {event.title}
      </h2>
      <div class="flex items-center gap-4">
        <button
          class="px-2 py-1 rounded-xl bg-[#E9EFFE] text-[#4976F4] text-sm font-medium flex items-center gap-1"
          ><EditIcon size={16} />
          Edit</button
        >
        <button
          class="px-2 py-1 rounded-xl bg-[#FBF4EC] text-[#D28E3D] text-sm font-medium flex items-center gap-1"
          ><ScanFace size={16} />Add face</button
        >
      </div>
    </div>
    <span>
      {date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
      {date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
    <div class="flex items-center gap-4 mt-4">
      <img
        class="obejct-contain w-[200px] h-[150px] rounded-lg"
        alt="portrait alert"
        src={"data:image/jpeg;base64," + event.frameImage}
      />
      <div class="flex flex-col gap-2">
        <p class={`text-base w-full text-[#00132B]`}>
          Camera name:
          <span class="text-[#727272]">
            {$selectedNode.camera.filter((c) => c.id === event.camera)[0] &&
              $selectedNode.camera.filter((c) => c.id === event.camera)[0].name}
          </span>
        </p>
        <p class={`text-base w-full text-[#00132B] whitespace-nowrap`}>
          Detection Score:
          <span class={`text-[#727272]`}>
            {event?.score.toFixed(3)}
          </span>
        </p>
        <p class={`text-base w-full text-[#00132B] whitespace-nowrap`}>
          Similarity Score:
          <span class={`text-[#727272]`}>
            {event.matchScore !== 0 &&
            event.matchScore !== undefined &&
            event.matchScore !== null
              ? `Match Score : ${event?.matchScore.toFixed(3)}`
              : "No matches found"}
          </span>
        </p>
      </div>
    </div>
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
    position: relative;
    max-width: 500px;
    margin: auto;
    z-index: 1001;
  }
</style>
