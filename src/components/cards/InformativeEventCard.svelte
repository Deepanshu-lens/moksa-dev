<script lang="ts">
  import { MoreVertical } from "lucide-svelte";

  export let data;

  const rawDate = new Date(data?.created);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
  const formattedTime = rawDate.toLocaleTimeString("en-US", timeOptions);
  const formattedDate = rawDate.toLocaleDateString("en-US", options);
</script>

<div
  class="flex scale-90 items-start gap-4 rounded-lg p-4 w-[375px] border-l-4 border-solid border-[#E0554C] informative-shadow bg-white dark:bg-[#1b1b1b]"
>
  <img
    alt="someone"
    src={`data:image/png;base64,${data.frameImage}`}
    class="my-auto h-16 w-16 aspect-square rounded-md object-cover"
  />
  <div class="flex flex-col">
    <span class="font-bold text-[#222] dark:text-white">
      {data?.title}
    </span>
    <span class="font-bold text-[#0B8995]">{formattedDate}</span>
    <span class="font-medium text-[rgb(151,151,151)]">
      {formattedTime}
    </span>
  </div>
  <button class="text-black dark:text-white ml-auto">
    <MoreVertical />
  </button>
</div>
