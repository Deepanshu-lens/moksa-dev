<script lang="ts">
  import EventGrid from "./component/event-grid.svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
  import Button from "../ui/button/button.svelte";
  import { Filter, X } from "lucide-svelte";
  import * as Popover from "@/components/ui/popover/index";
  import Checkbox from "../ui/checkbox/checkbox.svelte";
  import Label from "../ui/label/label.svelte";
  import Separator from "../ui/separator/separator.svelte";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { writable } from "svelte/store";
  import {
    DateFormatter,
    type DateValue,
    getLocalTimeZone,
  } from "@internationalized/date";
  import Calendar from "../ui/calendar/calendar.svelte";
  import { cn } from "@/lib/utils";
  import { toast } from "svelte-sonner";

  const eventTypes = [
    { type: "person", heading: "Person Detection", color: "#FF4764" },
    { type: "fire", heading: "Fire Detection", color: "#FF5733" },
    { type: "face", heading: "Face Detection", color: "#24DA8E" },
    { type: "heatmap", heading: "Heatmap Detection", color: "#FFB347" },
    { type: "alpr", heading: "Vehicle Detection", color: "#8A2BE2" },
  ];

  let startTime: string = "";
  let endTime: string = "";

  let selectedEventFilters = writable<string[]>([]);
  const df = new DateFormatter("en-US", {
    dateStyle: "short",
  });

  let value: DateValue | undefined = undefined;
  let isDateOpen = false;
  $: if (value) {
    isDateOpen = false;
  }

  function validateEndTime() {
    if (endTime && endTime <= startTime) {
      endTime = "";
      toast.error("End time must be after start time");
    }
  }

  function clearFilters() {
    endTime = "";
    startTime = "";
    value = undefined;
    selectedEventFilters.set([]);
  }
</script>

<div class="w-[95%] px-4 ml-8 mt-3 flex justify-between items-center">
  <div class="w-52">
    <NodeSelection />
  </div>
  <Popover.Root>
    <Popover.Trigger>
      <Button variant="outline" class="flex items-center gap-2"
        ><Filter size={18} />Filters
      </Button>
    </Popover.Trigger>
    <Popover.Content class="mt-2 w-80">
      <div class="flex w-full items-center justify-between my-2">
        <h1>Events Filter</h1>
        <Button variant={"outline"} size={"sm"} on:click={clearFilters}
          >Clear all</Button
        >
      </div>
      <p>Types</p>
      <Separator class="my-2" />
      <div class="grid grid-cols-2 gap-4 w-full">
        {#each eventTypes as event}
          <div class="flex items-center justify-between w-1/2 gap-2">
            <Checkbox
              checked={$selectedEventFilters.includes(event.type)}
              onCheckedChange={(v) => {
                if (v) {
                  selectedEventFilters.update((value) => {
                    return [...value, event.type];
                  });
                } else {
                  selectedEventFilters.update((value) => {
                    return value.filter((val) => val !== event.type);
                  });
                }
              }}
            />
            <Label class="text-sm text-nowrap">{event.heading}</Label>
          </div>
        {/each}
      </div>
      <p class="mt-3">Date</p>
      <Separator class="my-2" />
      <div class="flex items-center justify-between w-1/2 gap-2">
        <Label class="text-sm text-nowrap">Select a date to filter by:</Label>
        <Popover.Root bind:open={isDateOpen}>
          <Popover.Trigger asChild let:builder>
            <Button
              variant="outline"
              class={cn(
                "w-[200px] h-8 justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              builders={[builder]}
            >
              <CalendarIcon class="mr-2 h-4 w-4" />
              {value
                ? df.format(value.toDate(getLocalTimeZone()))
                : "Pick a date"}
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-auto p-0">
            <Calendar bind:value initialFocus />
          </Popover.Content>
        </Popover.Root>
      </div>
      <p class="mt-3">Time</p>
      <Separator class="my-2" />
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <Label class="text-sm text-nowrap">Select a time to filter by:</Label>
          <Button
            variant="outline"
            size="icon"
            class="size-6 rounded-full"
            on:click={() => {
              startTime = "";
              endTime = "";
            }}
          >
            <X size={12} />
          </Button>
        </div>
        <div class="flex items-center gap-3">
          <div>
            <Label>Start Time:</Label>
            <input
              type="time"
              id="startTime"
              placeholder="00:00"
              bind:value={startTime}
              on:input={validateEndTime}
              class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"
            />
          </div>
          <div>
            <Label>End Time:</Label>
            <input
              type="time"
              id="endTime"
              placeholder="00:00"
              bind:value={endTime}
              on:input={validateEndTime}
              class="rounded-md border-2 text-sm px-2 py-2 leading-tight w-full"
            />
          </div>
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>

<section class="right flex-1 flex h-screen w-full justify-between">
  <div class="w-full h-full px-4">
    <EventGrid
      selectedEventTypeFilters={$selectedEventFilters}
      date={value}
      time={{ startTime, endTime }}
    />
  </div>
</section>
