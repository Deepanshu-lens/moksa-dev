<script>
  import { Select } from "bits-ui";

  import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Filter,
    InfoIcon,
    Loader2,
    SlidersHorizontal,
    TrendingUp,
    X,
    XCircle,
  } from "lucide-svelte";
  import { totalCameras, allEvents, isEventsLoading, totalFaceRegistered } from "@/stores";
</script>

<div
  class="max-h-[calc(100vh-75px-80px)] h-full w-[98.5%] ml-4 grid grid-cols-6 grid-rows-2 gap-4 pr-2 py-2"
>
  <div
    class="col-span-3 rounded-lg p-2 border-2 border-black/.23 border-solid flex flex-col"
  >
    <span class="font-medium text-lg ">Reports & Analytics</span>
    <span class="text-sm font-medium">Average Anomaly Detection</span>
    <span class="w-full flex items-center justify-between"
      ><span class="flex items-center gap-2 tex-lg font-medium">
        -64.23% <span
          class="text-xs text-[#589e67] bg-[#EEF5F0] rounded-xl p-1 w-[50px] h-[25px] flex items-center gap-1"
          ><TrendingUp class="h-[14px] w-[14px]" /> 12%</span
        >
      </span>
      <span class="flex items-center gap-1">
        <button
          class="flex items-center gap-2 px-2 py-1 w-[150px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-sm text-[#4f4f4f]"
          ><CalendarDays class="text-[#4f4f4f] h-4 w-4" /> Date</button
        >
        <button
          class="flex items-center gap-2 px-2 py-1 w-[100px] rounded-md border-[1px] border-solid border-[#e0e0e0] text-medium text-sm text-[#4f4f4f]"
          ><Filter class="text-[#4f4f4f] h-4 w-4" /> Filter</button
        >
      </span></span
    >
    <span class="text-xs text-[#727272]">Average Anomaly detection rate</span>
    <span class="h-[90%] w-[95%] overflow-clip"
      ><img
        src="/images/event_graph.png"
        alt="garph"
        class="h-[87%] w-[105%]"
      /></span
    >
  </div>
  <div
    class="col-span-2 p-2 rounded-lg border-2 border-black/.23 border-solid gap-2 grid grid-cols-3 grid-rows-2"
  >
    <span class="col-span-2 rounded-md h-full w-full bg-[#FFDEE3] relative p-2">
      <span class="flex items-center gap-4">
        <XCircle class="text-[#DE4B63]" />
        <p class="text-[#333] font-medium text-lg">Default message</p>
        <X class="ml-auto" />
      </span>
      <p class="text-xs font-semibold text-black/[.6] pt-2">
        High priority alerts:
      </p>
      <p class="text-[#1e293b] font-semibold text-xl">4351+</p>
      <img
        src="/images/line.svg"
        alt="redline"
        class="absolute bottom-0 right-0"
      />
    </span>
    <span class="col-span-1 rounded-md h-full w-full bg-[#DBFFF3] relative p-2">
      <span class="flex items-center w-full gap-1">
        <CheckCircle2 class="text-[#3EC195] h-4 w-4" />
        <p class="text-[#333] font-medium text-xs">Default message</p>
      </span>
      <p class="text-xs font-semibold text-black/[.6] pt-2">
        Low priority alerts:
      </p>
      <p class="text-[#1e293b] font-semibold text-xl">4351+</p>
      <img
        src="/images/line1.svg"
        alt="greenline"
        class="absolute bottom-0 right-0"
      />
    </span>
    <span class="col-span-1 rounded-md h-full w-full bg-[#D2F2FA] relative p-2">
      <span class="flex items-center w-full gap-1">
        <InfoIcon class="text-[#02C7DF] h-4 w-4" />
        <p class="text-[#333] font-medium text-xs">Default message</p>
      </span>
      <p class="text-xs font-semibold text-black/[.6] pt-2">
        Recognition alerts:
      </p>
      <p class="text-[#1e293b] font-semibold text-xl">4351+</p>
      <img
        src="/images/line2.svg"
        alt="blueline"
        class="absolute bottom-0 right-0"
      />
    </span>
    <span class="col-span-2 rounded-md h-full w-full bg-[#F7F6B9] p-2 relative">
      <span class="flex items-center gap-4">
        <AlertTriangle class="text-[#F0C01A]" />
        <p class="text-[#333] font-medium text-lg">Default message</p>
        <X class="ml-auto" />
      </span>
      <p class="text-xs font-semibold text-black/[.6] pt-2">Cautious alerts:</p>
      <p class="text-[#1e293b] font-semibold text-xl">4351+</p>
      <img
        src="/images/line3.svg"
        alt="yellline"
        class="absolute bottom-0 right-0"
      />
    </span>
  </div>
  <div class="col-span-1 flex flex-col gap-4">
    <div
      class="border-2 border-black/.23 border-solid h-full w-full rounded-lg p-2 relative flex flex-col justify-between py-4"
    >
      <p class="font-medium text-sm">Total Camera</p>
      <p class="text-xl font-bold">{$totalCameras}</p>
      <p class="flex items-center text-xs gap-1">
        <span class="flex items-center text-primary"
          ><TrendingUp class="h-3 w-3 mr-1" /> 1.3%</span
        > Up from past week
      </p>

      <span
        class=" rounded-2xl h-[51px] w-[51px] grid place-items-center absolute top-4 right-2"
      >
        <img src="/images/camera_1.png" alt="camera" class="h-10 w-10" />
      </span>
    </div>
    <div
      class="border-2 border-black/.23 border-solid h-full w-full rounded-lg p-2 relative flex flex-col justify-between py-4"
    >
      <p class="font-medium text-sm">Registered Faces</p>
      <p class="text-xl font-bold">{$totalFaceRegistered}</p>
      <p class="flex items-center text-xs gap-1">
        <span class="flex items-center text-primary"
          ><TrendingUp class="h-3 w-3 mr-1" /> 1.3%</span
        > Up from past week
      </p>
      <span
        class=" rounded-2xl h-[51px] w-[51px] grid place-items-center absolute top-4 right-2"
      >
        <img src="/images/persons_icon.png" alt="person" class="h-10 w-10" />
      </span>
    </div>
  </div>
  <div class="col-span-3 rounded-lg border-2 border-black/.23 border-solid p-2">
    <div class="flex h-1/2">
      <span class="w-2/5">
        <p class="text-xl font-semibold">Reports & Analytics</p>
        <span class="flex items-center gap-2 tex-lg font-medium">
          -64.23% <span
            class="text-xs text-[#589e67] bg-[#EEF5F0] rounded-xl p-1 w-[50px] h-[25px] flex items-center gap-1"
            ><TrendingUp class="h-[14px] w-[14px]" /> 12%</span
          >
        </span>
        <p class="tex-xs text-[#727272]">Average Anomaly detection rate</p>
      </span>
      <span class="w-3/5 h-full"
        ><img
          src="/images/Graph03.png"
          class="h-auto w-full"
          alt="graph2"
        /></span
      >
    </div>
    <div class="flex items-center justify-end h-1/2">
      <span class="flex items-center w-full gap-1">
        <span class="h-full flex gap-2">
          <span class=" rounded-2xl h-[35px] w-[35px] grid place-items-center">
            <img
              src="/images/persons_icon.png"
              alt="camera"
              class="h-full w-full"
            />
          </span>
          <span class="max-w-[110px]">
            <p class="font-medium text-xs">Average Anomaly Detection</p>
            <p class="text-lg font-bold">2.34%</p>
          </span>
        </span>
        <span class="h-[75px] w-[1px] bg-black bg-opacity-[.18]" />
        <span class="h-full flex gap-2">
          <span class=" rounded-2xl h-[35px] w-[35px] grid place-items-center">
            <img
              src="/images/persons_icon.png"
              alt="camera"
              class="h-full w-full"
            />
          </span>
          <span class="max-w-[110px]">
            <p class="font-medium text-xs">Average Anomaly Detection</p>
            <p class="text-lg font-bold">2.34%</p>
          </span>
        </span>
        <span class="h-[75px] w-[1px] bg-black bg-opacity-[.18]" />
        <span class="h-full flex gap-2">
          <span class=" rounded-2xl h-[35px] w-[35px] grid place-items-center">
            <img
              src="/images/persons_icon.png"
              alt="camera"
              class="h-full w-full"
            />
          </span>
          <span class="max-w-[110px]">
            <p class="font-medium text-xs">Average Anomaly Detection</p>
            <p class="text-lg font-bold">2.34%</p>
          </span>
        </span>
        <span class="h-[75px] w-[1px] bg-black bg-opacity-[.18]" />
        <span class="h-full flex gap-2">
          <span class=" rounded-2xl h-[35px] w-[35px] grid place-items-center">
            <img
              src="/images/persons_icon.png"
              alt="camera"
              class="h-full w-full"
            />
          </span>
          <span class="max-w-[110px]">
            <p class="font-medium text-xs">Average Anomaly Detection</p>
            <p class="text-lg font-bold">2.34%</p>
          </span>
        </span>
      </span>
    </div>
  </div>
  <div
    class="col-span-3 rounded-lg border-2 border-black/.23 border-solid p-2 flex flex-col"
  >
    <span class="flex items-center justify-between px-2">
      <span>Event Occurrence Report</span>
      <span class="flex justify-end items-center gap-2"
        ><Select.Root portal={null}>
          <Select.Trigger class="text-sm ">
            <Select.Value placeholder="Sort by" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              <Select.Label>Sort by</Select.Label>
            </Select.Group>
          </Select.Content>
        </Select.Root>
        <SlidersHorizontal class="scale-75" />
      </span>
    </span>
    <div class="flex items-center h-full w-full gap-2">
      <span class="w-1/2 flex flex-col gap-2 py-4">
        {#if $isEventsLoading}
          <span class="flex items-center justify-center py-1 px-2 bg-[#fafafa] rounded-lg gap-2 text-[#727272]">
            <Loader2 class="animate-spin" />
            Fetching Events...
          </span>
        {:else}
          {#each $allEvents?.slice(0, 4) as event}
            <span
              class="flex items-center justify-start py-1 px-2 bg-[#fafafa] rounded-lg"
            >
              <img
                src={"data:image/jpeg;base64," + event.frameImage}
                alt="cardthubmnail"
                class="h-[40px] w-[40px] aspect-square"
              />
              <span class="flex flex-col ml-2"
                ><p class="font-medium text-sm text-[#727272]">{event.description || "Person detection"}</p>
                <p class="text-xs text-[#727272]">
                  {event.camera || "Camera 1"}  {event.probability || "100%"}
                </p></span
              >
              <span class="flex flex-col ml-auto"
                ><p class="text-xs text-[#727272]">{event.time || "12:00"}</p>
                <p class="text-xs text-[#727272]">{event.date || "12/12/2024"}</p></span
              >
            </span>
          {/each}
        {/if}
      </span>
      <span class="w-1/2 flex h-full"
        ><img src="/images/Graph02.png" alt="graph3" /></span
      >
    </div>
  </div>
</div>
