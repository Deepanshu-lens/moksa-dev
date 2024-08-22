<script lang="ts">
  import { selectedNode } from "@/lib/stores";
  import CarDetailsDialog from "../dialogs/CarDetailsDialog.svelte";

  export let data;
  console.log(data);
  const date = new Date(data.created);
</script>

<article
  class={`relative items-center gap-2 p-2 bg-[#f9f9f9] dark:bg-black w-full fade-in-15 transition-all duration-200
 flex rounded-xl shadow-md text-base border hover:scale-[1.01] dark:shadow-slate-800 hover:shadow-lg
`}
>
  <img
    class="object-cover w-16 h-16 rounded-md"
    src={"data:image/jpeg;base64," + data.frameImage}
    alt="Team Member"
  />
  {#if data.title.includes("car") && data.description !== ""}
    <CarDetailsDialog
      plateImage={data.videoUrl}
      plateNumber={data.description}
      carColor={data.title.replace(" car", "")}
      fullImage={data.frameImage}
      ><img
        class="object-cover w-64 h-16 rounded-md col-span-1"
        src={"data:image/jpeg;base64," + data.videoUrl}
        alt="Team Member"
      />
    </CarDetailsDialog>
  {/if}
  <div class="flex flex-col items-start">
    <h3 class={"font-semibold text-base"}>
      {#if data.title.includes("car") && data.description !== ""}
        {data.description} {data.title}
      {:else}
        {data.title}
      {/if}
    </h3>
    <p class={"text-sm text-black/.7"}>
      Camera {$selectedNode.camera.filter((c) => c.id === data.camera)[0] &&
        $selectedNode.camera.filter((c) => c.id === data.camera)[0].name}
    </p>
    <span
      class="flex items-center justify-between border-b border-solid border-[#1c1c1c]/.1 gap-2"
    >
      <p class="text-[10px] text-[#D28E3D] font-medium">
        {data.matchScore !== 0 &&
        data.matchScore !== undefined &&
        data.matchScore !== null
          ? `Match Score : ${data?.matchScore.toFixed(3)}`
          : "No matches found"}
      </p>
      <p class="text-[10px] font-semibold">
        {data?.score.toFixed(3)}
      </p>
    </span>
    <span class="flex items-center justify-between gap-2">
      <p class={"text-[10px]"}>
        {date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
      <p class={"text-[10px]"}>
        {date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </p>
    </span>
  </div>
</article>
