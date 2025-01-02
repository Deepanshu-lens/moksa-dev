<script lan="ts">
  import { CircleEllipsis } from "lucide-svelte";

  export let item;
  const formattedInput = item.created;

  const year = formattedInput.getFullYear();
  const month = String(formattedInput.getMonth() + 1).padStart(2, "0");
  const day = String(formattedInput.getDate()).padStart(2, "0");
  const hours = formattedInput.getHours();
  const minutes = formattedInput.getMinutes();
  const seconds = formattedInput.getSeconds();

  const ampm = hours >= 12 ? "PM" : "AM";
  const twelveHourFormat = hours % 12 || 12;
  const formattedInputDate = `${day}-${month}-${year}`;
  // const formattedDate = `${}`
  const formattedTime = `${twelveHourFormat}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
</script>

<div class="flex flex-row items-center h-[85px] w-full gap-2 pr-2 shadow-big">
  <span class="w-[4px] h-full bg-[#02C7DF]" />
  <img
    src={"data:image/jpeg;base64," + item.frameImage}
    alt="event-preview"
    class="object-contain h-[85px] w-[100px]"
  />
  <span class="min-w-[200px] w-full flex-col">
    <span class="flex justify-between items-center text-[#401f1f]">
      <span class="text-base font-medium">{item?.title}</span>
      <CircleEllipsis class="text-black dark;text-white h-[20px] w-[20px]" />
    </span>
    <span class="text-sm font-medium text-[#838383]">Event timing </span>
    <span class="h-[1px] w-full bg-[#e0e0e0]" />
    <span class="flex items-center justify-between">
      <span class="text-xs leading-tight text-[#303030] opacity-50">
        {formattedInputDate}, {formattedTime}
      </span>
      <button class="text-sm font-semibold text-[#f2994a]"> View all </button>
    </span>
  </span>
</div>
