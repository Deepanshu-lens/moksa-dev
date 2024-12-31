<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    selectedLayout,
    isAlertPanelOpen,
    isRoiPanelOpen,
    cameras,
    selectedCamera,
    captureRef,
    user,
    nodes,
    customLayout,
  } from "@/stores";
  import { cn } from "@/lib/utils";
  import * as Popover from "@/components/ui/popover";
  import { ImageDown, ScanSearch } from "lucide-svelte";
  import html2canvas from "html2canvas";
  import { toast } from "svelte-sonner";
  import JSZip from "jszip";
  import RegisterFaceDialog from "./faceRegister/register-face-dialog.svelte";
  import { addUserLogs } from "@/lib/logs/userLogs";
  import { get } from "svelte/store";

  let selected = 0;
  let snipDropDownOpen = false;
  let recordDropdownOpen = false;
  let customRows: number;
  let customColumns: number;
  export let isOpen;

  $: {
    const custom_layout = get(customLayout);
    if (custom_layout) {
      customRows = custom_layout.rows || 0;
      customColumns = custom_layout.columns || 0;
    } else {
      customRows = 0;
      customColumns = 0;
    }
  }

  // Load the persisted selectedLayout from local storage if it exists
  if (typeof localStorage !== "undefined") {
    const savedSelected = localStorage.getItem("selectedLayout");
    if (savedSelected !== null) {
      selectedLayout.set(Number(savedSelected));
    }
  }

  // Reactive assignment: sync `selected` with `selectedLayout`
  $: selected = $selectedLayout;

  // Whenever `selected` changes, update the store and localStorage
  $: if (selectedLayout) {
    selectedLayout.set(selected);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("selectedLayout", String(selected));
    }
  }

  async function fullscreenLayout() {
    await addUserLogs(
      "User clicked on fullscreen layout",
      $user?.email || "",
      $user?.id || ""
    );
    const container = document.getElementsByClassName(`camera-grid`);
    if (
      container.length > 0 &&
      container[0] &&
      container[0].requestFullscreen
    ) {
      container[0].requestFullscreen();
    }
  }

  const captureAllScreenshot = async () => {
    const zip = new JSZip();
    for (let i = 0; i < $cameras.length; i++) {
      const element = document.getElementById(`${$cameras[i].id}`);
      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/webp");
        zip.file(
          `screenshot_${$cameras[i].name}_${$cameras[i].id}.webp`,
          imgData?.split(";base64,").pop(),
          { base64: true }
        );
      }
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {
      // Create a download link for the zip file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "screenshots.zip";
      link.click();

      // Cleanup
      URL.revokeObjectURL(link.href);
      toast.success("Downloaded all screen snips.");
    });
  };

  const handleSingleSS = async () => {
    if ($selectedCamera) {
      const element = document.getElementById(`${$selectedCamera}`);
      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/webp");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "screenshot.webp";
        link.click();
        toast.success("Downloaded screen snip.");
        link.remove();
      }
    }
  };

  const captureSlideScreenshot = async () => {
    // const num = index === null || index === undefined ? "0" : index;
    // const element = document.getElementById(`slide-${num}`);
    if ($captureRef) {
      const canvas = await html2canvas($captureRef);
      const imgData = canvas.toDataURL("image/webp");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = "screenshot.webp";
      link.click();
      toast.success("Downloaded screen snip.");
      link.remove();
    } else {
      console.log("ref unavailable");
    }
  };

  const handleOpenMarkRoi = async () => {
    if(!$selectedCamera) {
      toast.error("Please select a camera first!");
      return;
    }
    
    await addUserLogs(
      "User clicked on mark ROI",
      $user?.email || "",
      $user?.id || ""
    );
    isOpen.set(true);
  }

  $: {
    if (customColumns >= 0 && customRows >= 0) {
      if (customColumns === 0 || customRows === 0) {
        localStorage.setItem("customLayout", JSON.stringify({}));
      }
      customLayout.set({ rows: customRows, columns: customColumns });
    } else {
      localStorage.setItem("customLayout", JSON.stringify({}));
    }
  }

  customLayout.subscribe((value) => {
    if (value && value.rows > 0 && value.columns > 0) {
      localStorage.setItem("customLayout", JSON.stringify(value));
      selectedLayout.set(12);
    } else if (value && value.rows === 0 && value.columns === 0) {
      localStorage.setItem("customLayout", JSON.stringify({}));
    } else {
      localStorage.setItem("customLayout", JSON.stringify({}));
    }
  });
  //@ts-ignore
  selectedLayout.subscribe((value) => {
    if (value < 12) customLayout.set({});
  });
</script>

<div
  class="flex flex-col space-y-8 items-center justify-center px-2 h-screen border-l relative"
  style="height:calc(100vh - 3rem);"
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <span
    class="group flex-col flex items-center justify-center gap-0.5"
    on:click={fullscreenLayout}
  >
    <!-- <button
        disabled={!features.includes("Grid Fullscreen") || cameraCount === 0} -->
    <button
      class={`disabled:cursor-not-allowed disabled:opacity-50 text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md group border-2 border-solid border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
      ><Icon icon="material-symbols:fullscreen" class="h-[22px] w-[22px]" />
    </button>
    <p class="text-xs text-black/[.4] dark:text-white">Fullscreen</p>
  </span>
  <span class="group flex-col flex items-center justify-center gap-0.5">
    <button
      class={cn(
        "text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md border-2 border-solid dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center",
        {
          "font-bold bg-[#015a62]": $isAlertPanelOpen,
          "border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black":
            !$isAlertPanelOpen,
        }
      )}
      on:click={async () => {
        await addUserLogs(
          "User clicked on alerts",
          $user?.email || "",
          $user?.id || ""
        );
        isAlertPanelOpen.update((value) => !value);
        isRoiPanelOpen.set(false);
      }}
      ><Icon
        icon="material-symbols:notifications-active-outline-rounded"
        class="h-[22px] w-[22px]"
      /></button
    >
    <p
      class={`text-xs ${!$isAlertPanelOpen && "text-black/[.4] dark:text-white"}`}
    >
      Alerts
    </p>
  </span>
  <RegisterFaceDialog>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={async () => {
          await addUserLogs(
            "User clicked on register face",
            $user?.email || "",
            $user?.id || ""
          );
        }}
        class={`disabled:cursor-not-allowed text-black/[.4] h-[30px] w-[30px] disabled:opacity-50 rounded-full shadow-md group border-2 border-solid border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
      >
        <Icon
          icon="material-symbols:familiar-face-and-zone"
          class="h-[22px] w-[22px]"
        />
      </button>
      <p class="text-xs text-black/[.4] dark:text-white">Register</p>
    </span>
  </RegisterFaceDialog>
  <!-- svelte-ignore a11y_missing_attribute -->
  <a
    href={window.location.href}
    target="_blank"
    rel="noreferrer"
    class="flex items-center justify-center gap-2 cursor-pointer relative lg:scale-95 2xl:scale-100 hover:text-primary"
  >
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={async () => {
          await addUserLogs(
            "User clicked on extend",
            $user?.email || "",
            $user?.id || ""
          );
        }}
        class={`disabled:cursor-not-allowed disabled:opacity-50 text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md group border-2 border-solid border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
        ><Icon
          icon="material-symbols:screenshot-monitor-outline"
          class="h-[22px] w-[22px]"
        /></button
      >
      <p class="text-xs text-black/[.4] dark:text-white">Extend</p>
    </span>
  </a>

  <span class="group flex-col flex items-center justify-center gap-0.5">
    <!-- <button
        disabled={!features.includes("Toggle Alerts")} -->
    <button
      class={cn(
        "text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md border-2 border-solid dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center",
        {
          "font-bold bg-[#015a62]": $isRoiPanelOpen,
          "border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black":
            !$isRoiPanelOpen,
        }
      )}
      on:click={handleOpenMarkRoi}><ScanSearch class="h-[22px] w-[22px]" /></button
    >
    <p
      class={`text-xs ${!$isRoiPanelOpen && "text-black/[.4] dark:text-white"}`}
    >
      Mark ROI
    </p>
  </span>
  <span class="group flex-col flex items-center justify-center gap-0.5">
    <button
      disabled
      class={`disabled:cursor-not-allowed disabled:opacity-50 text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md group border-2 border-solid border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
      ><Icon
        icon="material-symbols:fiber-manual-record-outline"
        class="h-[22px] w-[22px]"
      />
    </button>
    <p class="text-xs text-black/[.4] dark:text-white">Record</p>
  </span>
  <span class="group flex-col flex items-center justify-center gap-0.5">
    <button
      on:click={async () => {
        await addUserLogs(
          "User clicked on screen snip",
          $user?.email || "",
          $user?.id || ""
        );
        snipDropDownOpen = !snipDropDownOpen;
        recordDropdownOpen = false;
      }}
      class={!snipDropDownOpen
        ? `disabled:cursor-not-allowed text-black/[.23] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid border-black/[.23] dark:border-white/[.23] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center `
        : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-white bg-[#015a62] grid place-items-center dark:bg-[#015a62]`}
      ><ImageDown class="h-[22px] w-[22px]" />
      {#if snipDropDownOpen}
        <div
          id="dropdown"
          class="z-50 dark:text-white text-black flex items-center border justify-center bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow w-40 absolute right-12 p-2"
        >
          <ul
            class="py-2 text-sm flex flex-col items-center justify-center gap-2"
            aria-labelledby="dropdownDefaultButton"
          >
            <li class="w-full">
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <span
                class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
                on:click={() => {
                  console.log("current view");
                  captureSlideScreenshot();
                  addUserLogs("User took screenshot of currentView", $user?.email || "", $user?.id || "");
                }}
              >
                Current View
              </span>
            </li>
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li class="w-full">
              <span
                class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
                on:click={() => {
                  console.log("selected screen");
                  if ($selectedCamera === "") {
                    toast.warning("Please select a stream to screen snip.");
                  } else {
                    handleSingleSS();
                    addUserLogs("User took screenshot of selected screen", $user?.email || "", $user?.id || "");
                  }
                }}
              >
                Selected Screen
              </span>
            </li>
            <li class="w-full">
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <span
                on:click={() => {
                  console.log("all screens");
                  captureAllScreenshot();
                  addUserLogs("User took screenshot of all screens", $user?.email || "", $user?.id || "");
                }}
                class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
              >
                All Screens
              </span>
            </li>
          </ul>
        </div>
      {/if}
    </button>
    <p class="text-xs text-black/[.23] dark:text-white">Snip</p>
  </span>
  <span class="group flex-col flex items-center justify-center gap-0.5">
    <Popover.Root>
      <Popover.Trigger let:builder>
        <button
          on:click={async () => {
            await addUserLogs(
              "User clicked on screen layout",
              $user?.email || "",
              $user?.id || ""
            );
          }}
          class={`disabled:cursor-not-allowed disabled:opacity-50 text-black/[.4] h-[30px] w-[30px] rounded-full shadow-md group border-2 border-solid border-black/[.4] dark:border-white/[.4] bg-white dark:bg-black dark:text-white group-hover:text-white group-hover:bg-[#015a62] dark:group-hover:bg-[#258d9d] group-hover:border-none grid place-items-center`}
          ><Icon
            icon="material-symbols:grid-view-outline-rounded"
            class="h-[22px] w-[22px]"
          />
        </button>
      </Popover.Trigger>
      <Popover.Content class="w-fit max-w-md" side="left" sideOffset={20}
        ><div class="space-y-2">
          <h4 class="font-medium leading-none">Screen Layout</h4>
          <p class="text-muted-foreground text-sm">
            Set the camera grid settings for your best viewing experience.
          </p>
        </div>

        <div
          class="flex flex-wrap items-center justify-start w-full py-10 px-4"
        >
          {#each Array.from({ length: 7 }, (_, i) => i - 1).toReversed() as layout}
            <div
              class={cn(
                "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
                selected === layout + 1 &&
                  "px-2 border border-solid border-[#015a62] rounded-md text-primary hover:border-[#015a62] "
              )}
            >
              <button
                on:click={(e) => {
                  e.preventDefault();
                  selected = layout + 1;
                  addUserLogs(
                    `User selected screen layout ${layout + 1} x ${layout + 1}`,
                    $user?.email || "",
                    $user?.id || ""
                  );
                }}
              >
                {#if layout != -1}
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class={cn(
                      selected === layout + 1
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {#each Array.from({ length: (layout + 1) * (layout + 1) }, (_, i) => i) as index}
                      <rect
                        x={(index % (layout + 1)) *
                          ((100 - 2 * (Math.max(layout + 1, layout + 1) - 1)) /
                            Math.max(layout + 1, layout + 1) +
                            2)}
                        y={Math.floor(index / (layout + 1)) *
                          ((100 - 2 * (Math.max(layout + 1, layout + 1) - 1)) /
                            Math.max(layout + 1, layout + 1) +
                            2)}
                        width={(100 -
                          2 * (Math.max(layout + 1, layout + 1) - 1)) /
                          Math.max(layout + 1, layout + 1)}
                        height={(100 -
                          2 * (Math.max(layout + 1, layout + 1) - 1)) /
                          Math.max(layout + 1, layout + 1)}
                        rx={((100 -
                          2 * (Math.max(layout + 1, layout + 1) - 1)) /
                          Math.max(layout + 1, layout + 1)) *
                          0.2}
                        fill="currentColor"
                      />
                    {/each}
                  </svg>
                  <span>{layout + 1}:{layout + 1}</span>
                {:else}
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class={cn(
                      selected === layout + 1
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <path
                      fill="currentColor"
                      d="M2 7.25A3.25 3.25 0 0 1 5.25 4h13.5A3.25 3.25 0 0 1 22 7.25v5.56a6.518 6.518 0 0 0-1.5-1.078V7.25a1.75 1.75 0 0 0-1.75-1.75H5.25A1.75 1.75 0 0 0 3.5 7.25v9.5c0 .966.784 1.75 1.75 1.75h5.826c.081.523.224 1.026.422 1.5H5.25A3.25 3.25 0 0 1 2 16.75zm12.278 6.726a2 2 0 0 1-1.441 2.496l-.584.144a5.728 5.728 0 0 0 .006 1.808l.54.13a2 2 0 0 1 1.45 2.51l-.187.631c.44.386.94.699 1.484.922l.494-.519a2 2 0 0 1 2.899 0l.498.525a5.276 5.276 0 0 0 1.483-.913l-.198-.686a2 2 0 0 1 1.441-2.496l.584-.144a5.716 5.716 0 0 0-.006-1.808l-.54-.13a2 2 0 0 1-1.45-2.51l.187-.63a5.282 5.282 0 0 0-1.484-.922l-.493.518a2 2 0 0 1-2.9 0l-.498-.525a5.28 5.28 0 0 0-1.483.912zM17.5 19c-.8 0-1.45-.672-1.45-1.5S16.7 16 17.5 16c.8 0 1.45.672 1.45 1.5S18.3 19 17.5 19"
                    /></svg
                  >
                  <span>Automatic</span>
                {/if}
              </button>
            </div>
          {/each}
          <button
            class={cn(
              "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
              selected === 7 &&
                "px-2 border border-solid border-[#015a62] rounded-md text-primary"
            )}
            on:click={(e) => {
              e.preventDefault();
              addUserLogs(
                `User selected screen layout 1 + 5`,
                $user?.email || "",
                $user?.id || ""
              );
              selected = 7;
            }}
          >
            <svg
              width="60"
              height="60"
              class={cn(
                selected === 7 ? "text-primary" : "text-muted-foreground"
              )}
              id="Layer_2"
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1068 1067.5"
            >
              <g id="Layer_1-2" data-name="Layer 1">
                <rect
                  fill="currentColor"
                  width="708.33"
                  height="708.33"
                  rx="20"
                  ry="20"
                  transform="translate(708.33) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="719.59"
                  y=".75"
                  width="349.16"
                  height="347.67"
                  rx="20"
                  ry="20"
                  transform="translate(1068.75 -719.59) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="719.59"
                  y="359.92"
                  width="349.16"
                  height="347.67"
                  rx="20"
                  ry="20"
                  transform="translate(1427.92 -360.42) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="719.59"
                  y="719.09"
                  width="349.16"
                  height="347.67"
                  rx="20"
                  ry="20"
                  transform="translate(1787.09 -1.24) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="359.92"
                  y="719.09"
                  width="349.16"
                  height="347.67"
                  rx="20"
                  ry="20"
                  transform="translate(1427.42 358.42) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x=".25"
                  y="719.09"
                  width="349.16"
                  height="347.67"
                  rx="20"
                  ry="20"
                  transform="translate(1067.75 718.09) rotate(90)"
                />
              </g>
            </svg>
            <span>1 + 5</span>
          </button>
          <button
            class={cn(
              "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
              selected === 8 &&
                "px-2 border border-solid border-[#015a62] rounded-md text-primary"
            )}
            on:click={(e) => {
              e.preventDefault();
              addUserLogs(
                `User selected screen layout 1 + 7`,
                $user?.email || "",
                $user?.id || ""
              );
              selected = 8;
            }}
          >
            <svg
              width="60"
              class={cn(
                selected === 8 ? "text-primary" : "text-muted-foreground"
              )}
              height="60"
              id="Layer_2"
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1068 1068"
            >
              <g id="Layer_1-2" data-name="Layer 1">
                <rect
                  fill="currentColor"
                  x="-.19"
                  y=".19"
                  width="798.37"
                  height="798"
                  rx="20"
                  ry="20"
                  transform="translate(798.19 .19) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="809.44"
                  y=".56"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1068.56 -809.44) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="809.44"
                  y="270.19"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1338.19 -539.81) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="809.44"
                  y="539.81"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1607.81 -270.19) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="809.44"
                  y="809.44"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1877.44 -.56) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="539.44"
                  y="809.44"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1607.44 269.44) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="269.44"
                  y="809.44"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1337.44 539.44) rotate(90)"
                />
                <rect
                  fill="currentColor"
                  x="-.56"
                  y="809.44"
                  width="259.12"
                  height="258"
                  rx="20"
                  ry="20"
                  transform="translate(1067.44 809.44) rotate(90)"
                />
              </g>
            </svg>
            <span>1 + 7</span>
          </button>
          <button
            class={cn(
              "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
              selected === 9 &&
                "px-2 border border-solid border-[#015a62] rounded-md text-primary"
            )}
            on:click={(e) => {
              e.preventDefault();
              selected = 9;
              addUserLogs(
                `User selected screen layout 1 + 12`,
                $user?.email || "",
                $user?.id || ""
              );
            }}
          >
            <svg
              width="60"
              height="60"
              class={cn(
                selected === 9 ? "text-primary" : "text-muted-foreground"
              )}
              id="Layer_2"
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1067 1072.23"
            >
              <g id="Layer_1-2" data-name="Layer 1">
                <g>
                  <rect
                    fill="currentColor"
                    x="808.69"
                    y=".56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1067.56 -808.69) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="808.69"
                    y="271.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1338.81 -537.45) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="808.69"
                    y="542.68"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1609.68 -266.58) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="808.69"
                    y="813.92"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1880.92 4.67) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="538.94"
                    y=".56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(797.81 -538.94) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="538.94"
                    y="271.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1069.06 -267.7) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="538.94"
                    y="542.68"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1339.93 3.17) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="538.94"
                    y="813.92"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1611.17 274.42) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="269.19"
                    y="542.68"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1070.18 272.92) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="269.19"
                    y="813.92"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1341.42 544.17) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="-.56"
                    y="542.68"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(800.43 542.68) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="-.56"
                    y="813.92"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1071.67 813.92) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="-1.31"
                    y="1.31"
                    width="530.12"
                    height="527.5"
                    rx="20"
                    ry="20"
                    transform="translate(-1.31 528.81) rotate(-90)"
                  />
                </g>
              </g>
            </svg>
            <span>1 + 12</span>
          </button>
          <button
            class={cn(
              "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
              selected === 10 &&
                "px-2 border border-solid border-[#015a62] rounded-md text-primary"
            )}
            on:click={(e) => {
              e.preventDefault();
              selected = 10;
              addUserLogs(
                `User selected screen layout 2 + 8`,
                $user?.email || "",
                $user?.id || ""
              );
            }}
          >
            <svg
              width="60"
              class={cn(
                selected === 10 ? "text-primary" : "text-muted-foreground"
              )}
              height="60"
              id="Layer_2"
              data-name="Layer 2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1068 1070.12"
            >
              <g id="Layer_1-2" data-name="Layer 1">
                <g>
                  <rect
                    fill="currentColor"
                    x="809.19"
                    y="540.56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1608.06 -269.19) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="809.19"
                    y="811.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1879.31 2.05) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="539.44"
                    y="540.56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1338.31 .56) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="539.44"
                    y="811.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1609.56 271.8) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="269.69"
                    y="540.56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1068.56 270.31) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="269.69"
                    y="811.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1339.8 541.56) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="-.06"
                    y="540.56"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(798.81 540.06) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    x="-.06"
                    y="811.8"
                    width="258.87"
                    height="257.75"
                    rx="20"
                    ry="20"
                    transform="translate(1070.05 811.31) rotate(90)"
                  />
                  <rect
                    fill="currentColor"
                    width="528"
                    height="528"
                    rx="20"
                    ry="20"
                    transform="translate(0 528) rotate(-90)"
                  />
                  <rect
                    fill="currentColor"
                    x="540"
                    width="528"
                    height="528"
                    rx="20"
                    ry="20"
                    transform="translate(540 1068) rotate(-90)"
                  />
                </g>
              </g>
            </svg>
            <span>2 + 8</span>
          </button>
          <div
            class={cn(
              "flex flex-col items-center justify-evenly py-[2rem] mt-2 w-1/3 gap-1 hover:border-[#015a62] hover:border hover:border-solid rounded-md",
              $selectedLayout > 11 &&
                "px-2 border border-solid border-[#015a62] rounded-md text-primary"
            )}
          >
            <div class="flex justify-center items-center gap-2">
              <div class="flex flex-col w-full">
                <input
                  type="number"
                  bind:value={customRows}
                  min="1"
                  max="50"
                  step="1"
                  on:input={(e: any) =>
                    (customRows = parseInt(e.target?.value))}
                  class="bg-gray rounded-md"
                />
                <span class="text-xs">R</span>
              </div>
              <span class="text-sm">X</span>
              <div class="flex flex-col w-full">
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  on:input={(e: any) =>
                    (customColumns = parseInt(e.target?.value))}
                  bind:value={customColumns}
                  class="bg-gray rounded-md"
                />
                <span class="text-xs">C</span>
              </div>
            </div>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
    <!-- </LayoutDialog> -->
    <p class="text-xs text-black/[.4] dark:text-white">Layouts</p>
  </span>
</div>
