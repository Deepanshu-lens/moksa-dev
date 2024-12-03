<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import * as Calendar from ".";
	import { cn } from "@/lib";
  
	type $$Props = CalendarPrimitive.Props;
	type $$Events = CalendarPrimitive.Events;
  
	export let value: $$Props["value"] = undefined;
	export let placeholder: $$Props["placeholder"] = undefined;
	export let weekdayFormat: $$Props["weekdayFormat"] = "short";
	export let markedDates = [];
	export let selectedCamera;
  
	let className: $$Props["class"] = undefined;
	export { className as class };
  
	// function isMarked(date) {
	//   const currentDate = new Date(date);
	//   const dayOfMonth = currentDate.getDate().toString();
	//   const month = (currentDate.getMonth() + 1).toString(); // Adjusting for JavaScript's 0-indexed months
	//   const year = currentDate.getFullYear().toString();

  
	//   return markedDates?.some((d) => {
	// 	return (
	// 	  d.dayOfMonth === dayOfMonth &&
	// 	  d.record === "true" &&
	// 	  d.month.toString() === month && // Ensure month is a string for comparison
	// 	  d.year === year
	// 	);
	//   });
	// }

	function isMarked(date) {
  if (!Array.isArray(markedDates)) {
    return false; // Return false if markedDates is not an array
  }

  const currentDate = new Date(date);
  if (isNaN(currentDate.getTime())) {
    return false; // Return false if date is invalid
  }

  const dayOfMonth = currentDate.getDate().toString();
  const month = (currentDate.getMonth() + 1).toString(); // Adjusting for JavaScript's 0-indexed months
  const year = currentDate.getFullYear().toString();

  return markedDates.some((d) => {
    // Check if each property exists and is in the expected format before comparing
    return (
      d.dayOfMonth === dayOfMonth &&
      d.record === "true" &&
      d.month && d.month.toString() === month && // Ensure month is a string for comparison
      d.year === year
    );
  });
}
  
	console.log(markedDates)
  </script>
  
  <CalendarPrimitive.Root
	bind:value
	bind:placeholder
	{weekdayFormat}
	class={cn("p-2", className)}
	{...$$restProps}
	on:keydown
	let:months
	let:weekdays
  >
	<Calendar.Header>
	  <Calendar.PrevButton />
	  <Calendar.Heading />
	  <Calendar.NextButton />
	</Calendar.Header>
	<Calendar.Months>
	  {#each months as month}
		<Calendar.Grid>
		  <Calendar.GridHead>
			<Calendar.GridRow class="flex">
			  {#each weekdays as weekday}
				<Calendar.HeadCell>
				  {weekday.slice(0, 2)}
				</Calendar.HeadCell>
			  {/each}
			</Calendar.GridRow>
		  </Calendar.GridHead>
		  <Calendar.GridBody>
			{#each month.weeks as weekDates}
			  <Calendar.GridRow class="mt-2 w-full">
				{#each weekDates as date}
				  <Calendar.Cell {date} class='flex flex-col justify-center items-center'>
					{#if isMarked(date)}
					  <span class="red-dot"></span>
					{/if}
					<Calendar.Day {date} month={month.value} />
				  </Calendar.Cell>
				{/each}
			  </Calendar.GridRow>
			{/each}
		  </Calendar.GridBody>
		</Calendar.Grid>
	  {/each}
	</Calendar.Months>
  </CalendarPrimitive.Root>
  
  <style>
	.red-dot {
	  width: 5px;
	  height: 5px;
	  background-color: red;
	  border-radius: 50%;
	  display: inline-block;
	}
  </style>