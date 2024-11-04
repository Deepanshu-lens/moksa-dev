<script lang="ts">
  import { writable } from "svelte/store";
  import Stream from "./Stream.svelte";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import Spinner from "../ui/spinner/Spinner.svelte";
  import {
    activeCamera,
    fullscreen,
    selectedNode,
    alertPanelHide,
    events,
    markRoi,
    filteredNodeCameras,
    canvasCoordinates,
    view,
  } from "@/lib/stores";
  import {
    Disc2,
    ImageDown,
    Bell,
    Expand,
    Filter,
    Minimize,
    Monitor,
    ChevronRight,
    ScanSearch,
    ChevronDown,
    Link,
    Users,
    Heater,
  } from "lucide-svelte";

  import { Cctv, LayoutPanelLeft } from "lucide-svelte";
  import { Button } from "../ui/button";
  import PocketBase from "pocketbase";
  import html2canvas from "html2canvas";
  import { Settings } from "lucide-svelte";
  import StreamLayout from "../layouts/StreamLayout.svelte";
  import JSZip from "jszip";
  import EventModal from "../modal/EventModal.svelte";
  import type { Gallery } from "@/types";
  import ComfortableProfileCard from "../cards/ComfortableProfileCard.svelte";
  import * as Accordion from "@/components/ui/accordion";
  import { addUserLog } from "@/lib/addUserLog";
  import TopBar from "../mobile/TopBar.svelte";
  import StreamView from "../mobile/StreamView.svelte";
  import MenuMob from "../mobile/MenuMob.svelte";
  import NodeSelection from "../node/NodeSelection.svelte";
  import CameraList from "../lists/CameraList.svelte";
  import LayoutDialog from "../dialogs/LayoutDialog.svelte";
  import AddCameraDialog from "../dialogs/AddCameraDialog.svelte";
  import { page } from "$app/stores";
  import Switch from "../ui/switch/switch.svelte";
  import Control from "../PTZ/Control.svelte";

  import * as Dialog from "@/components/ui/dialog";
  export let data;
  export let url;
  // console.log('streamviwe',data);
  const { user } = data;
  const { token } = data;
  const { nodes } = data;
  const selectedDetections = writable([]);
  let ptzControl = writable("");
  let animateHeader = false;
  let comfort = false;

  const search = new URLSearchParams(window.location.search);
  const screens = parseInt(search.get("s") ?? "1");
  const cameraCount = $selectedNode.camera.length;
  const isMobile = writable(false);

  let recording = false;
  let slideRecording = false;
  let recordDropdownOpen = false;
  let snipDropDownOpen = false;
  let captureRef: HTMLElement;
  let isAllFullScreen = false;
  let displayLayouts = false;
  let nodeCameras = false;
  let selectedEvent = null;
  let galleryItems: Gallery[] = [];
  let unknownItems = [];
  let batchedGallery: Gallery[] = [];
  let batchedUnknownGallery = [];
  let selectedScreen = null;
  let showRightPanel = true;
  let eventType = false;
  let roiCamera = null;
  let intrusionDetection = false;
  let lineCrossing = false;
  let linePerson = false;
  let lineVehicle = false;
  let intrusionPerson = false;
  let intrusionVehicle = false;
  let intrusionPersonThresh = 0.7;
  let intrusionVehicleThresh = 0.7;
  let linePersonThresh = 0.7;
  let lineVehicleThresh = 0.7;

  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
  const searchParams = new URLSearchParams(window.location.search);
  let pages = parseInt(searchParams.get("p") ?? "0");
  let activePage = pages === null ? 0 : Number(pages) + 1;
  let queryString = `?p=${Number(pages) === 0 ? 1 : activePage}&g=${$selectedNode.maxStreamsPerPage}`;
  let basePath = `/session/${$selectedNode.session}`;
  let fullURL = basePath + queryString;

  onMount(() => {
    const updateScreenSize = () => {
      isMobile.set(window.innerWidth <= 768);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => {
      window.removeEventListener("resize", updateScreenSize);
    };
  });

  const handleSingleSS = async () => {
    if ($activeCamera) {
      const element = document.getElementById(`stream-${$activeCamera}`);
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

  const captureSlideScreenshot = async (index: number) => {
    const num = index === null || index === undefined ? "0" : index;
    const element = document.getElementById(`slide-${num}`);
    if (captureRef) {
      const canvas = await html2canvas(captureRef);
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

  const captureAllScreenshot = async () => {
    const zip = new JSZip();
    for (let i = 0; i < $selectedNode.camera.length; i++) {
      const element = document.getElementById(
        `stream-${$selectedNode.camera[i].id}`,
      );
      if (element) {
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/webp");
        zip.file(
          `screenshot_${$selectedNode.camera[i].name}_${$selectedNode.camera[i].id}.webp`,
          imgData.split(";base64,").pop(),
          { base64: true },
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

  function toggleFullscreen() {
    fullscreen.update((value) => !value);
  }

  function handleFullscreenChange() {
    isAllFullScreen = !!document.fullscreenElement;
    fullscreen.set(!!document.fullscreenElement);
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  onDestroy(() => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  });

  $: {
    if ($fullscreen && captureRef) {
      captureRef.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  function openEventDialog(eventData) {
    selectedEvent = eventData;
  }

  async function getGallery(): Promise<Gallery[]> {
    const galleryItem = await PB.collection("faceGallery").getFullList({
      sort: "-lastSeen",
      expand: "events",
      fields: "name,lastSeen,expand.events.frameImage,images",
    });

    return galleryItem.map((e) => ({
      name: e.name,
      lastSeen: e.lastSeen,
      savedData: e.images,
      images: e.expand.events
        ? e.expand.events
            .map((f) => f.frameImage)
            .slice(-8)
            .reverse()
        : [],
      created: new Date(),
      updated: new Date(),
    }));
  }

  async function getUnknowns(): Promise<Gallery[]> {
    const galleryItem = await PB.collection("impostors").getList(1, 10, {
      sort: "-lastSeen",
      expand: "events",
      fields: "name,lastSeen,expand.events.frameImage",
    });

    return galleryItem.items.map((e) => ({
      name: "Unknown",
      lastSeen: e.lastSeen,
      images: e.expand.events
        .map((f) => f.frameImage)
        .slice(-8)
        .reverse(),
      created: new Date(),
      updated: new Date(),
    }));
  }

  async function updateGallery() {
    if (batchedGallery.length > 0) {
      galleryItems = await getGallery();
      // gallery.set([...batchedGallery, ...$gallery].slice(0, 200));
      batchedGallery = [];
    }
    setTimeout(updateGallery, 1000);
  }

  async function updateUnknowns() {
    if (batchedUnknownGallery.length > 0) {
      unknownItems = await getUnknowns();
      batchedUnknownGallery = [];
    }
    setTimeout(updateUnknowns, 1000);
  }

  function toggleDisplayLayouts() {
    displayLayouts = !displayLayouts;
  }

  onMount(async () => {
    PB.autoCancellation(false);
    galleryItems = data.galleryItems;
    unknownItems = data.imposterItems;
    PB.collection("faceGallery").subscribe("*", async (e) => {
      console.log("New change in gallery ", e.action, e.record);
      batchedGallery.push(e.record);
    });
    PB.collection("impostors").subscribe("*", async (e) => {
      batchedUnknownGallery.push(e.record.id);
    });
    setTimeout(updateGallery, 1000);
    setTimeout(updateUnknowns, 1000);
  });

  //////
  // mob
  /////

  let liveFullscreen = writable(false);
  let showAlerts = writable(false);
  let editMode = writable(false);
  let landscape = writable(false);
  let activeStreamIndex = writable(null);
  let currpanel = 2;
  let showItems = true;

  function handleCheckboxChange(deviceName, event) {
    console.log("working");
    selectedDetections.update((current) => {
      const index = current.indexOf(deviceName);
      if (event.target.checked) {
        if (index === -1) current.push(deviceName);
      } else {
        if (index !== -1) current.splice(index, 1);
      }
      return [...current]; // Spread into a new array to trigger reactivity
    });
    event.stopPropagation(); // Prevent the dropdown from closing
  }

  async function updateAi() {
    if (!$canvasCoordinates || Object.keys($canvasCoordinates).length === 0) {
      if (intrusionDetection === false && $view === 2) {
        await PB.collection("ai_inference")
          .update(roiCamera?.inference, {
            roiData: null,
            intrusionDetection: false,
            intrusionPerson: false,
            intrusionVehicle: false,
          })
          .then((res) => {
            toast.success("Intrusion detection removed for this camera!");
            return;
          })
          .catch((err) => {
            console.error(
              `Error removing intrusion detection for this camera: ${err}`,
            );
          });
      } else if (lineCrossing === false && $view === 1) {
        await PB.collection("ai_inference")
          .update(roiCamera?.inference, {
            lineData: null,
            lineCrossing: false,
            linePerson: false,
            lineVehicle: false,
          })
          .then((res) => {
            toast.success("Line crossing detection removed for this camera!");
            console.log(res);
            roiCamera = null;
            filteredNodeCameras.set($selectedNode.camera);
            $selectedDetections = [];
            return;
          })
          .catch((err) => {
            console.error(
              `Error removing line crossing detection for this camera: ${err}`,
            );
          });
      } else {
        toast.error(`Roi not set`);
        return;
      }
    } else {
      console.log("roidata updateai", roiCamera);
      if ($view === 2) {
        await PB.collection("ai_inference")
          .update(roiCamera?.inference, {
            roiData: $canvasCoordinates,
            intrusionDetection: intrusionDetection,
            intrusionPerson: intrusionPerson,
            intrusionVehicle: intrusionVehicle,
            intrusionPersonThresh: intrusionPerson ? 0.7 : null,
            intrusionVehicleThresh: intrusionVehicle ? 0.7 : null,
          })
          .then((res) => {
            console.log(res);
            roiCamera = null;
            filteredNodeCameras.set($selectedNode.camera);
            $selectedDetections = [];
            toast.success("Intrusion detection Data Updated!");
          })
          .catch((err) => console.log(err));
      } else {
        await PB.collection("ai_inference")
          .update(roiCamera?.inference, {
            lineData: $canvasCoordinates,
            lineCrossing: lineCrossing,
            linePerson: linePerson,
            lineVehicle: lineVehicle,
            linePersonThresh: linePerson ? 0.7 : null,
            lineVehicleThresh: lineVehicle ? 0.7 : null,
          })
          .then((res) => {
            console.log(res);
            roiCamera = null;
            filteredNodeCameras.set($selectedNode.camera);
            $selectedDetections = [];

            toast.success("Line Crossing Data updated!");
          })
          .catch((err) => console.log(err));
      }
    }
  }

  let showLC = true;
  let showD = true;
  let showM = true;
  let showFilterPopup = false;

  const filteredEvents = writable([]);

  function filterEvents(events) {
    return events.filter((event) => {
      if (showLC && showD && showM) {
        return true;
      } else if (showLC && showD && !showM) {
        return event.matchScore === 0;
      } else if (showLC && !showD && showM) {
        return (
          event.title === "Line Crossed" ||
          (event.title !== "Line Crossed" && event.matchScore > 0)
        );
      } else if (!showLC && showM && showD) {
        return !event.title.includes("Line Crossed");
      } else if (showLC && !showD && !showM) {
        return event.title === "Line Crossed";
      } else if (showD && !showLC && !showM) {
        return event.matchScore === 0 && event.title.includes("Face");
      } else if (showM && !showLC && !showD) {
        return event.matchScore !== 0;
      } else {
        return false;
      }
    });
  }

  $: filteredEvents.set(filterEvents($events));
  $: console.log($ptzControl);

  let selectedVideo = null;
  let dialogOpen = false;

  async function openVideoDialog(videoUri) {
    dialogOpen = true;

    const response = await fetch("https://api.moksa.ai/stream", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: videoUri }),
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to get signed URL");
    }
    const blob = await response.blob();
    const videoUrl = URL.createObjectURL(blob);
    selectedVideo = videoUrl;
    console.log("Video URL:", selectedVideo);
  }

  // $: if (dialogOpen === false && selectedVideo) {
  //   URL.revokeObjectURL(selectedVideo);
  // }
</script>

<!-- desk -->
{#if !$isMobile}
  <section class="sm:flex flex-row-reverse hidden">
    <div
      class=" flex flex-col gap-5 2xl:gap-6 items-center justify-center px-2 bg-gradient-to-b from-[#000610] via-[#000307] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"
    >
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          on:click={() => {
            toggleFullscreen();
            addUserLog(`user clicked on fulscreen, top panel`);
          }}
          class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white/[.7] bg-transparent text-white/[.7] group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
          ><Expand class="h-[22px] w-[22px]" /></button
        >
        <p
          class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white/[.7] pointer-events-none"
        >
          Fullscreen
        </p>
      </span>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <AddCameraDialog sNode="" {nodes} {user}>
          <button
            on:click={() => {
              addUserLog(`user clicked on Add Camera button, top panel`);
            }}
            class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white/[.7] bg-transparent text-white/[.7] group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
            ><Cctv class="h-[22px] w-[22px]" />
          </button>
        </AddCameraDialog>
        <p
          class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white/[.7] pointer-events-none whitespace-nowrap"
        >
          Add Store
        </p>
      </span>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          on:click={() => {
            alertPanelHide.set(!$alertPanelHide);
            currpanel = 1;
            localStorage.setItem(
              "alertPanelHide",
              JSON.stringify($alertPanelHide),
            );
            addUserLog(`user set alert panel hide to ${$alertPanelHide} `);
          }}
          class={$alertPanelHide
            ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white border-opacity-70 bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
          ><Bell class="h-[22px] w-[22px]" /></button
        >
        <p
          class={`pointer-events-none text-xs ${$alertPanelHide ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
        >
          Alerts
        </p>
      </span>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <a
          href={fullURL}
          target="_blank"
          rel="noreferrer"
          class="flex items-center justify-center gap-2 cursor-pointer relative lg:scale-95 2xl:scale-100 hover:text-primary"
          on:click={() =>
            addUserLog("user clicked on exted display, top panel")}
        >
          <button
            on:click={() => (selectedScreen = 3)}
            class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white/[.7] bg-transparent text-white/[.7] group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
            ><Monitor class="h-[22px] w-[22px]" /></button
          >
        </a>
        <p
          class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white/[.7] pointer-events-none"
        >
          Extend
        </p>
      </span>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          on:click={() => {
            filteredNodeCameras.set($selectedNode.camera);
            markRoi.set(!$markRoi);
            currpanel = 3;
          }}
          class={!$markRoi
            ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white border-opacity-70 bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
          ><ScanSearch class="h-[22px] w-[22px]" />
        </button>
        <p
          class={`pointer-events-none text-xs ${!$markRoi ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
        >
          Mark ROI
        </p>
      </span>
      <!-- <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          disabled
          on:click={() => {
            recordDropdownOpen = !recordDropdownOpen;
            snipDropDownOpen = false;
            addUserLog("user clicked on start recording, top panel ");
          }}
          class={!recordDropdownOpen
            ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white border-opacity-70 bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
          ><Disc2 class="h-[22px] w-[22px]" />
          {#if recordDropdownOpen}
            <div
              id="dropdown"
              class="z-50 dark:text-white text-black flex items-center border justify-center bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow w-40 absolute right-12"
            >
              <ul class="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
                <li class="w-full">
                  <button
                    on:click={() => {
                      slideRecording = true;
                    }}
                    class="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                  >
                    Current View
                  </button>
                </li>
                <li class="w-full">
                  <button
                    class="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                  >
                    Selected Screen
                  </button>
                </li>
                <li class="w-full">
                  <button
                    on:click={() => {
                      slideRecording = true;
                    }}
                    class="block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                  >
                    All Screens
                  </button>
                </li>
              </ul>
            </div>
          {/if}
        </button>
        <p
          class={`pointer-events-none text-xs ${!recordDropdownOpen ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
        >
          Record
        </p>
      </span> -->
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          on:click={() => {
            snipDropDownOpen = !snipDropDownOpen;
            recordDropdownOpen = false;
            addUserLog("user clicked on screen snip, top panel ");
          }}
          class={!snipDropDownOpen
            ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white border-opacity-70 bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
          ><ImageDown class="h-[22px] w-[22px]" />
          {#if snipDropDownOpen}
            <div
              id="dropdown"
              class="z-50 dark:text-white text-black flex items-center border justify-center bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow w-40 absolute right-12"
            >
              <ul class="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
                <li class="w-full">
                  <button
                    class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
                    on:click={() => {
                      captureSlideScreenshot(screens);
                      addUserLog(
                        "user selected option currentView for screen snip",
                      );
                    }}
                  >
                    Current View
                  </button>
                </li>
                <li class="w-full">
                  <button
                    class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
                    on:click={() => {
                      if ($activeCamera === "") {
                        toast.warning("Please select a stream to screen snip.");
                      } else {
                        handleSingleSS();
                        addUserLog(
                          "user selected option Selected Screen for screen snip",
                        );
                      }
                    }}
                  >
                    Selected Screen
                  </button>
                </li>
                <li class="w-full">
                  <button
                    on:click={() => {
                      captureAllScreenshot();
                      addUserLog(
                        "user selected option all Screen for screen snip",
                      );
                    }}
                    class=" px-4 py-2 hover:bg-[rgba(92,75,221,.1)] rounded-md dark:hover:bg-gray-600 dark:hover:text-white w-full"
                  >
                    All Screens
                  </button>
                </li>
              </ul>
            </div>
          {/if}
        </button>
        <p
          class={`pointer-events-none text-xs ${!snipDropDownOpen ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
        >
          Snip
        </p>
      </span>
      <span class="group flex-col flex items-center justify-center gap-0.5">
        <button
          on:click={() => {
            displayLayouts = !displayLayouts;
            nodeCameras = false;
            addUserLog("user clicked display and layouts, left pane");
          }}
          class={!displayLayouts
            ? ` disabled:cursor-not-allowed text-white/[.7] h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white border-opacity-70 bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
            : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black/[.7] bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
          ><LayoutPanelLeft class="h-[22px] w-[22px]" />
          {#if displayLayouts}
            <span
              class="z-40 w-[200px] border flex items-center justify-center bg-background dark:text-white text-black divide-y divide-gray-100 shadow-dropdown rounded-lg shadow absolute right-12"
            >
              <ul class="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <li
                  class="w-full"
                  on:click={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <LayoutDialog {toggleDisplayLayouts}>
                    <button
                      class="block rounded-md px-4 py-2 text-center hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                    >
                      Manage Screen layouts
                    </button>
                  </LayoutDialog>
                </li>
                <li class="w-full">
                  <button
                    class="rounded-md cursor-not-allowed text-center block px-4 py-2 hover:bg-[rgba(92,75,221,.1)] dark:hover:bg-gray-600 dark:hover:text-white w-full disabled:cursor-not-allowed"
                  >
                    Manage Displays
                  </button>
                </li>
              </ul>
            </span>
          {/if}
        </button>
        <p
          class={`pointer-events-none text-xs ${!displayLayouts ? "group-hover:text-[#07E1A4] text-white/[.7] dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
        >
          Layouts
        </p>
      </span>
    </div>

    <div
      class={"w-full h-[calc(100vh-75px)] hidden sm:flex items-start justify-end relative z-10"}
      bind:this={captureRef}
    >
      <div
        class={isAllFullScreen
          ? "w-full h-screen flex items-center justify-center"
          : "w-full h-full flex items-center justify-center"}
      >
        <StreamLayout
          {handleSingleSS}
          {isAllFullScreen}
          {data}
          {currpanel}
          {user}
        />
        <!-- <Player {videos} /> -->
      </div>

      {#if isAllFullScreen}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <button
          class="absolute disabled:cursor-not-allowed top-2 left-2 flex items-center gap-2 cursor-pointer bg-[rgba(0,0,0,.5)] text-white z-20"
          on:click={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
              isAllFullScreen = false;
              addUserLog(`user clicked on minimize fullscreen `);
            }
          }}
        >
          <Minimize />
          Exit Fullscreen
        </button>
      {/if}

      {#if showRightPanel}
        {#if !$alertPanelHide || $markRoi}
          <!-- class={`-rotate-90 absolute top-44 z-[999] transition-position ease-in-out duration-500 flex ${isAllFullScreen && showRightPanel ? "right-[12.7rem]" : showRightPanel && !isAllFullScreen ? "2xl:right-[12.7rem] xl:right-[8.7em]  right-[8%]" : !showRightPanel ? "-right-20 opacity-0" : "-right-20"}`} -->

          <span
            class={`-rotate-90 absolute  z-[999] transition-position ease-in-out duration-500 flex ${isAllFullScreen && showRightPanel && !$markRoi && !$alertPanelHide ? " min-[1250px]:right-[15.4%] min-[1400px]:right-[14.2%] 2xl:right-[12.7rem] lg:right-[12.7rem] right-[9.8rem] top-44" : isAllFullScreen && showRightPanel && $markRoi && $alertPanelHide ? "min-[1250px]:right-[15.4%] min-[1400px]:right-[14.2%] 2xl:right-[12.7rem] lg:right-[12.7rem] right-[9.8rem] top-44" : isAllFullScreen && showRightPanel && $markRoi && !$alertPanelHide ? "lg:right-[9.8rem] right-[6.7rem]  top-44" : !isAllFullScreen && showRightPanel && $markRoi && !$alertPanelHide ? " min-[1350px]:right-[11.4%] 2xl:right-[9.7rem] lg:top-32 xl:top-36 2xl:top-44 lg:right-[12.6%]" : !isAllFullScreen && showRightPanel && $markRoi && $alertPanelHide ? "2xl:right-[12.8rem] min-[1350px]:right-[15%] min-[1250px]:right-[16.6%] lg:right-[17.5%] md:right-[15.7%] 2l:top-44 xl:top-40 lg:top-32 top-[5.2rem]" : !isAllFullScreen && showRightPanel && !$markRoi && !$alertPanelHide ? "2xl:right-[12.8rem] min-[1350px]:right-[15%] min-[1250px]:right-[16.6%] lg:right-[17.5%] md:right-[15.7%] 2l:top-44 xl:top-40 lg:top-32 top-[5.2rem]" : "right-0"}`}
          >
            {#if !$alertPanelHide}
              <button
                on:click={() => (currpanel = 1)}
                class={`cursor-pointer w-[100px] h-[32px] rounded-t-xl ${isAllFullScreen ? "text-white bg-slate-800" : "text-black dark:text-white bg-white dark:bg-slate-800"} z-[800] flex items-center justify-center gap-2 shad text-sm ${currpanel === 1 && "font-extrabold"}`}
                >Alerts
              </button>
            {/if}
            <button
              on:click={() => (currpanel = 2)}
              class={` cursor-pointer w-[100px] h-[32px] rounded-t-xl ${isAllFullScreen ? "text-white bg-slate-800" : "text-black dark:text-white bg-white dark:bg-slate-800"} shad z-[800] flex items-center justify-center gap-2 text-sm ${currpanel === 2 && "font-extrabold"}`}
              >Cameras
            </button>
            {#if $markRoi}
              <button
                on:click={() => {
                  currpanel = 3;
                  filteredNodeCameras.set($selectedNode.camera);
                }}
                class={` cursor-pointer w-[100px] h-[32px] rounded-t-xl ${isAllFullScreen ? "text-white bg-slate-800" : "text-black dark:text-white bg-white dark:bg-slate-800"} shad z-[800] flex items-center justify-center gap-2 text-sm ${currpanel === 3 && "font-extrabold"}`}
                >Mark ROI
              </button>
            {/if}
          </span>
        {/if}
      {/if}

      <button
        on:click={() => (showRightPanel = !showRightPanel)}
        class={`absolute ${showRightPanel ? ` ${isAllFullScreen ? "right-[15rem] lg:right-[18rem]" : "right-[14rem] lg:right-[17rem] xl:right-[18rem]"} ` : "right-0"} py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800 top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[99999]`}
      >
        <ChevronRight
          class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700`}
        />
      </button>

      <div
        id="infopanel"
        class={`h-full border-solid 
         border-x-[1px] flex-shrink-0
         transition-width ease-in-out duration-500 overflow-y-scroll z-[998] hide-scrollbar
        ${showRightPanel ? "w-1/4 opacity-100" : "w-0 opacity-0"} relative max-w-72`}
      >
        <!-- <button
        on:click={() => (showRightPanel = false)}
        class="absolute top-1/2 -translate-y-1/2 bg-[#f9f9f9] grid place-items-center py-1 z-[99999] shadow-md"
      >
        <ChevronRight />
      </button> -->
        {#if !$alertPanelHide && currpanel === 1}
          <div
            class={`backdrop-filter  
          z-10 trasition ease-in-out w-full max-w-md  flex-shrink-0
         duration-200 ${
           animateHeader
             ? "shadow-xl rounded-b-md backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40 bg-background/95 "
             : "rounded-none border-b"
         }
         ${isAllFullScreen && "border-none"}`}
          >
            <div
              class={`flex items-center w-full
   justify-between  px-4  ${
     animateHeader ? "my-3  text-sm " : "my-3 font-medium"
   } trasition ease-in-out duration-200`}
            >
              <div
                class={`flex justify-center items-center gap-2 ${isAllFullScreen && "text-white text-xl"}`}
              >
                <Bell size={18} />
                <h3>Alerts</h3>
              </div>
              <div
                class=" dark:text-white flex gap-2 items-center cursor-pointer text-sm relative"
              >
                <Settings size={18} />
                <button on:click={() => (showFilterPopup = !showFilterPopup)}>
                  <Filter size={18} />
                </button>
                {#if showFilterPopup}
                  <div
                    class="z-50 dark:text-white text-black flex flex-col border gap-2 p-2 bg-background divide-y divide-gray-100 shadow-dropdown rounded-lg shadow w-40 absolute right-0 top-6"
                  >
                    <label class="flex items-center gap-2">
                      <input type="checkbox" bind:checked={showLC} />
                      Line Crossing
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" bind:checked={showD} />
                      Detected
                    </label>
                    <label class="flex items-center gap-2">
                      <input type="checkbox" bind:checked={showM} />
                      Matched
                    </label>
                    <button on:click={() => (showFilterPopup = false)}
                      >Close</button
                    >
                  </div>
                {/if}
              </div>
            </div>
          </div>
          <div
            class={`flex flex-row items-center justify-center gap-4 ${isAllFullScreen ? "bg-[#333]" : "bg-[#f9f9f9] dark:bg-[#333]"} p-2`}
          >
            <!-- <button
              on:click={() => (comfort = true)}
              class={!comfort
                ? `bg-transparent font-medium ${isAllFullScreen ? "text-slate-50" : "text-[#afafaf]"} text-sm`
                : `font-medium text-sm px-4 py-2 rounded-md ${isAllFullScreen ? "bg-black text-slate-200" : "bg-white text-[#727272] dark:bg-black dark:text-slate-200"}`}
              >Comfortable</button
            > -->
            <button
              on:click={() => (comfort = false)}
              class={comfort
                ? `bg-transparent font-medium ${isAllFullScreen ? "text-slate-50" : "text-[#afafaf]"} text-sm`
                : `font-medium text-sm px-4 py-2 rounded-md ${isAllFullScreen ? "bg-black text-slate-200" : "bg-white text-[#727272] dark:bg-black dark:text-slate-200"}`}
              >Informative</button
            >
          </div>
          {#if comfort}
            <Accordion.Root multiple value={["open"]} class="m-4">
              <Accordion.Item value="open">
                <Accordion.Trigger>Knowns</Accordion.Trigger>
                <Accordion.Content>
                  <!-- {#if galleryItems.length > 0} -->
                  {#each galleryItems as galleryItem}
                    <ComfortableProfileCard {galleryItem} {isAllFullScreen} />
                  {/each}
                  <!-- {:else}
            <Spinner/>
            {/if} -->
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
            <Accordion.Root class="m-4">
              <Accordion.Item value="item-2">
                <Accordion.Trigger>Unknowns</Accordion.Trigger>
                <Accordion.Content>
                  {#each unknownItems as galleryItem}
                    <ComfortableProfileCard {galleryItem} {isAllFullScreen} />
                  {/each}
                </Accordion.Content>
              </Accordion.Item>
            </Accordion.Root>
          {:else}
            <ul class="overflow-y-scroll h-[calc(100vh-150px)] no-scrollbar">
              {#if $events.length > 0}
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                {#if $filteredEvents.length > 0}
                  {#each $filteredEvents as event}
                    <!-- {@const date = new Date(event.created)} -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <li
                      class="w-full fade-in-15 transition-all duration-200"
                      on:click={() => {
                        openEventDialog(event);
                        addUserLog(`user clicked on alert panel event`);
                      }}
                    >
                      <article
                        class={`relative items-center gap-2 mx-2 my-4 p-2
          flex bg-[#f9f9f9] dark:bg-black
          rounded-xl shadow-md text-base border 
          ${isAllFullScreen ? "bg-black text-white " : "hover:scale-[1.01] dark:shadow-slate-800 hover:shadow-lg "}
        `}
                      >
                        {#if event.title === "Theft Control"}
                          <div class="flex flex-col items-start w-full">
                            <span
                              class=" flex w-full items-center justify-between pb-1"
                            >
                              <h3 class={"font-bold text-base"}>
                                {event.title}
                              </h3>
                              {#if event.video_uri !== ""}
                                <button
                                  class="flex items-center gap-1 text-xs text-blue-400 text-semibold cursor-pointer"
                                  on:click={() => {
                                    console.log("video_url");
                                    openVideoDialog(event.video_uri);
                                  }}
                                >
                                  <Link size={12} /> Link
                                </button>
                              {/if}
                            </span>
                            <span class="flex items-center gap-4 w-full">
                              <span class="flex gap-1 flex-col">
                                <p class="text-xs font-medium">
                                  StoreId: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.store_id}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  CameraId: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.camera_id}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Validated At: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.date_validated}
                                  </span>
                                </p>
                              </span>
                              <span class="flex gap-1 flex-col">
                                <p class="text-xs font-medium">
                                  Theft Probability: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.theftProbability}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Validated By: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.validated_by}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Cost Saved: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.cost_saved}
                                  </span>
                                </p>
                              </span>
                            </span>
                          </div>
                        {:else if event.title === "Safety"}
                          <div class="flex flex-col items-start w-full">
                            <h3 class={"font-bold text-base pb-1"}>
                              {event.title}
                            </h3>
                            <span
                              class="flex gap-2 items-center w-full border-b pb-1"
                            >
                              <p class="text-sm font-medium">
                                Id: <span class="font-normal text-black/[.6]">
                                  {event.emp_id}
                                </span>
                              </p>
                              <p class="text-sm font-medium">
                                Time Sop: <span
                                  class="font-normal text-black/[.6]"
                                >
                                  {event.time_sop === "" ||
                                  event.time_sop === null ||
                                  event.time_sop === undefined
                                    ? "N/A"
                                    : event.time_sop}
                                </span>
                              </p>
                            </span>

                            <span class="flex items-center gap-1 pt-1">
                              <span class="flex flex-col gap-1 items-end">
                                <p
                                  class="flex gap-2 text-semibold text-xs items-center"
                                >
                                  <span
                                    class="w-[2px] h-[10px] rounded-lg bg-[#015a62] flex-shrink-0"
                                  />Mask
                                </p>
                                <p class="text-black/[.6] text-xs">
                                  {event.wearing_mask}
                                </p>
                              </span>
                              <span class="flex flex-col gap-1 items-end">
                                <p
                                  class="flex gap-2 text-semibold text-xs items-center"
                                >
                                  <span
                                    class="w-[2px] h-[10px] rounded-lg bg-[#015a62] flex-shrink-0"
                                  />Uniform
                                </p>
                                <p class="text-black/[.6] text-xs">
                                  {event.wearing_uniform}
                                </p>
                              </span>
                              <span class="flex flex-col gap-1 items-end">
                                <p
                                  class="flex gap-2 text-semibold items-center text-xs"
                                >
                                  <span
                                    class="w-[2px] h-[10px] rounded-lg bg-[#015a62] flex-shrink-0"
                                  />Apron
                                </p>
                                <p class="text-black/[.6] text-xs">
                                  {event.wearing_apron}
                                </p>
                              </span>
                              <span class="flex flex-col gap-1 items-end">
                                <p
                                  class="flex gap-2 items-center text-semibold text-xs"
                                >
                                  <span
                                    class="w-[2px] h-[10px] rounded-lg bg-[#015a62] flex-shrink-0"
                                  />Hairnet
                                </p>
                                <p class="text-black/[.6] text-xs">
                                  {event.wearing_hair_net}
                                </p>
                              </span>
                              <span class="flex flex-col gap-1 items-end">
                                <p
                                  class="flex gap-2 items-center text-semibold text-xs"
                                >
                                  <span
                                    class="w-[2px] h-[10px] rounded-lg bg-[#015a62] flex-shrink-0"
                                  />gloves
                                </p>
                                <p class="text-black/[.6] text-xs">
                                  {event.wearing_gloves}
                                </p>
                              </span>
                            </span>
                          </div>
                        {:else if event.title === "People Count"}
                          <div class="flex flex-col items-start w-full">
                            <span
                              class="flex items-start gap-2 border-b pb-2 w-full relative"
                            >
                              <span
                                class="rounded-full bg-white size-[40px] grid place-items-center text-[#000065]"
                              >
                                <Users size={20} />
                              </span>
                              <span class="flex flex-col gap-2">
                                <h3 class={"font-semibold text-sm leading-4"}>
                                  {event.title}
                                </h3>
                                <p
                                  class="w-full font-semibold text-[#186AFD] text-[10px] leading-[14px] whitespace-nowrap"
                                >
                                  Camera ID: {event.camera_id} | Moksa ID: {event.moksa_id}
                                </p>
                              </span>
                              <p
                                class="font-semibold text-[10px] text-black whitespace-nowrap absolute right-1 -top-1"
                              >
                                Store ID: {event.store_id}
                              </p>
                            </span>
                            <span
                              class="flex w-full items-center justify-between py-1"
                            >
                              <p class="text-xs font-semibold text-black">
                                Going in: {event.going_in}
                              </p>
                              <p class="text-xs font-semibold text-black">
                                Going out: {event.going_out}
                              </p>
                            </span>
                          </div>
                        {:else if event.title === "Heat Map"}
                          <div class="flex flex-col items-start w-full">
                            <span class="flex items-start gap-4 w-full">
                              <span
                                class="rounded-full bg-white size-[40px] grid place-items-center text-[#000065]"
                              >
                                <Heater size={20} />
                              </span>
                              <h3 class={"font-medium text-base leading-5"}>
                                {event.title} Data Updated for Store ID:
                                <span class="text-semibold text-[#186AFD]"
                                  >{event.storeId}</span
                                >
                              </h3>
                            </span>
                          </div>
                        {:else if event.title === "Employee Efficiency"}
                          <div class="flex flex-col items-start w-full">
                            <span
                              class="flex items-start gap-2 border-b pb-2 w-full relative"
                            >
                              <span
                                class="rounded-full bg-white size-[40px] grid place-items-center text-[#000065]"
                              >
                                <Users size={20} />
                              </span>
                              <span class="flex flex-col gap-2">
                                <h3 class={"font-semibold text-sm leading-4"}>
                                  {event.title}
                                </h3>
                                <p
                                  class="w-full font-semibold text-[#186AFD] text-[10px] leading-[14px] whitespace-nowrap"
                                >
                                  Camera ID: {event.camera_id} | Moksa ID: {event.moksa_id}
                                </p>
                              </span>
                              <p
                                class="font-semibold text-[10px] text-black whitespace-nowrap absolute right-1 -top-1"
                              >
                                Store ID: {event.store_id}
                              </p>
                            </span>
                            <span class="flex items-center gap-4 w-full">
                              <span class="flex gap-1 flex-col">
                                <p class="text-xs font-medium">
                                  Mobile: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.mobile}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Mobile used: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.mobile_used}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Efficiency score: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.employeeEfficiency}
                                  </span>
                                </p>
                              </span>
                              <span class="flex gap-1 flex-col">
                                <p class="text-xs font-medium">
                                  Quantity: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.quantity}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Customer: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.customer}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Idle: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.idle}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Log In: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.log_in}
                                  </span>
                                </p>
                              </span>
                              <span class="flex gap-1 flex-col">
                                <p class="text-xs font-medium">
                                  Follow safety: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.follow_safety}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Present in store: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.present_in_store}
                                  </span>
                                </p>
                                <p class="text-xs font-medium">
                                  Log Out: <span
                                    class="font-normal text-black/[.6]"
                                  >
                                    {event.log_out}
                                  </span>
                                </p>
                              </span>
                            </span>
                          </div>
                        {/if}
                      </article>
                    </li>
                  {/each}
                {:else}
                  <li class="p-4">
                    No events found, select filters to see events
                  </li>
                {/if}
              {/if}
            </ul>
          {/if}
        {:else if $markRoi && currpanel === 3}
          <div
            class={`backdrop-filter  
          z-10 trasition ease-in-out w-full max-w-md 
         duration-200 ${
           animateHeader
             ? "shadow-xl rounded-b-md backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40 bg-background/95 "
             : "rounded-none border-b"
         }
         ${isAllFullScreen && "border-none"}`}
          >
            <div
              class={`flex items-center w-full relative
   justify-between  px-4  ${
     animateHeader ? "my-3  text-sm " : "my-3 font-medium"
   } trasition ease-in-out duration-200`}
            >
              <div
                class={`flex justify-center items-center gap-2 ${isAllFullScreen && "text-white text-xl"}`}
              >
                <h3>Mark ROI</h3>
              </div>
            </div>
          </div>
          <!-- <div
            class="flex items-center justify-center rounded-lg border-black/[.13] dark:border-white/[.13] border-solid border-[1px] p-1 w-[90%] h-[60px] mx-auto my-4"
          >
            <button
              on:click={() => view.set(1)}
              class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-full h-full ${$view === 1 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
              >Line Crossing</button
            >
            <button
              on:click={() => view.set(2)}
              class={`rounded-lg text-xs leading-[18px] px-[10px] py-[3px] font-medium w-1/2 h-full ${$view === 2 ? "text-white bg-[#015a62]" : "bg-transparent"}`}
              >Intrusion Detection</button
            >
          </div> -->
          {#if $view === 2}
            <div class="px-4 py-4 flex flex-col gap-1">
              <label for="camera" class="text-black/[.7] text-sm"
                >Select Camera</label
              >
              <div class="relative w-full">
                <select
                  class={`block text-primary capitalize font-semibold rounded-md appearance-none w-full bg-[#F6F6F6] border-2 py-2 text-sm px-2 leading-tight `}
                  on:change={(event) => {
                    const selectedCam = $selectedNode?.camera.find(
                      (cam) => cam.id === event.target.value,
                    );
                    console.log(selectedCam);
                    // activeCamera.set(selectedCam)
                    roiCamera = selectedCam;
                    filteredNodeCameras.set([selectedCam]);
                    // console.log($filteredNodeCameras);
                    intrusionDetection =
                      selectedCam?.expand?.inference?.intrusionDetection;
                    lineCrossing = selectedCam?.expand?.inference?.lineCrossing;
                    intrusionPerson =
                      selectedCam?.expand?.inference?.intrusionPerson;
                    intrusionVehicle =
                      selectedCam?.expand?.inference?.intrusionVehicle;
                    intrusionPersonThresh =
                      selectedCam?.expand?.inference?.intrusionPersonThresh;
                    intrusionVehicleThresh =
                      selectedCam?.expand?.inference?.intrusionVehicleThresh;
                    linePerson = selectedCam?.expand?.inference?.linePerson;
                    lineVehicle = selectedCam?.expand?.inference?.lineVehicle;
                    linePersonThresh =
                      selectedCam?.expand?.inference?.linePersonThresh;
                    lineVehicleThresh =
                      selectedCam?.expand?.inference?.lineVehicleThresh;
                  }}
                >
                  <option value="" disabled selected>Select from list</option>
                  {#each $selectedNode?.camera as cam}
                    <option value={cam.id}>{cam.name}</option>
                  {/each}
                </select>
                <ChevronDown
                  size={22}
                  class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none cursor-pointer outline-none"
                />
              </div>
            </div>
            {#if roiCamera}
              <div class="flex items-center gap-2 px-4">
                <label
                  for="line-crossing-toggle"
                  class="text-black/[.7] text-sm">Intrusion Detection</label
                >
                <Switch
                  id="line-crossing-toggle"
                  bind:checked={intrusionDetection}
                />
              </div>
              {#if intrusionDetection}
                <div class="flex items-center py-2 gap-2 px-4">
                  <label
                    for="person-detection-toggle"
                    class="text-black/[.7] text-sm">Person Detection</label
                  >
                  <Switch
                    id="person-detection-toggle"
                    bind:checked={intrusionPerson}
                  />
                </div>

                <div class="flex items-center gap-2 py-2 px-4">
                  <label
                    for="vehicle-detection-toggle"
                    class="text-black/[.7] text-sm">Vehicle Detection</label
                  >
                  <Switch
                    id="vehicle-detection-toggle"
                    bind:checked={intrusionVehicle}
                  />
                </div>
              {/if}
              <div class="w-full p-4 flex items-center">
                <Button
                  on:click={() => {
                    updateAi();
                  }}>Save</Button
                >
              </div>
            {/if}
          {:else}
            <div class="px-4 py-4 flex flex-col gap-1">
              <label for="camera" class="text-black/[.7] text-sm"
                >Select Camera</label
              >
              <div class="relative w-full">
                <select
                  id="selectedCamSelect"
                  class={`block text-primary capitalize font-semibold rounded-md appearance-none w-full bg-[#F6F6F6] border-2 py-2 text-sm px-2 leading-tight `}
                  on:change={(event) => {
                    const selectedCam = $selectedNode?.camera.find(
                      (cam) => cam.id === event.target.value,
                    );
                    // console.log(selectedCam);
                    // activeCamera.set(selectedCam)
                    roiCamera = selectedCam;
                    filteredNodeCameras.set([selectedCam]);
                    // console.log($filteredNodeCameras);
                    intrusionDetection =
                      selectedCam?.expand?.inference?.intrusionDetection;
                    lineCrossing = selectedCam?.expand?.inference?.lineCrossing;
                    intrusionPerson =
                      selectedCam?.expand?.inference?.intrusionPerson;
                    intrusionVehicle =
                      selectedCam?.expand?.inference?.intrusionVehicle;
                    intrusionPersonThresh =
                      selectedCam?.expand?.inference?.intrusionPersonThresh;
                    intrusionVehicleThresh =
                      selectedCam?.expand?.inference?.intrusionVehicleThresh;
                    linePerson = selectedCam?.expand?.inference?.linePerson;
                    lineVehicle = selectedCam?.expand?.inference?.lineVehicle;
                    linePersonThresh =
                      selectedCam?.expand?.inference?.linePersonThresh;
                    lineVehicleThresh =
                      selectedCam?.expand?.inference?.lineVehicleThresh;
                  }}
                >
                  <option value="" disabled selected>Select from list</option>
                  {#each $selectedNode?.camera as cam}
                    <option value={cam.id}>{cam.name}</option>
                  {/each}
                </select>
                <ChevronDown
                  size={22}
                  class="text-[#727272] absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none cursor-pointer outline-none"
                />
              </div>
            </div>
            {#if roiCamera}
              <div class="flex items-center gap-2 px-4">
                <label
                  for="line-crossing-toggle"
                  class="text-black/[.7] text-sm">Line Crossing Detection</label
                >
                <Switch bind:checked={lineCrossing} />
              </div>
              {#if lineCrossing}
                <div class="flex items-center py-2 gap-2 px-4">
                  <label
                    for="person-detection-toggle"
                    class="text-black/[.7] text-sm">Person Detection</label
                  >
                  <Switch
                    id="person-detection-toggle"
                    bind:checked={linePerson}
                  />
                </div>
                <div class="flex items-center gap-2 py-2 px-4">
                  <label
                    for="vehicle-detection-toggle"
                    class="text-black/[.7] text-sm">Vehicle Detection</label
                  >
                  <Switch
                    id="vehicle-detection-toggle"
                    bind:checked={lineVehicle}
                  />
                </div>
              {/if}
              <div class="w-full p-4 flex items-center gap-4">
                <Button
                  on:click={() => {
                    updateAi();
                    document.getElementById("selectedCamSelect").value = "";
                  }}>Save</Button
                >
                <Button
                  variant="secondary"
                  on:click={() => {
                    markRoi.set(false);
                    roiCamera = null;
                    filteredNodeCameras.set($selectedNode.camera);
                    $selectedDetections = [];
                    document.getElementById("selectedCamSelect").value = "";
                  }}>Cancel</Button
                >
              </div>
            {/if}
          {/if}
        {:else}
          <NodeSelection {isAllFullScreen} {nodes} {url} {user} />
          <CameraList
            {isAllFullScreen}
            {showItems}
            {user}
            {data}
            {ptzControl}
          />
          {#if $ptzControl !== ""}
            <Control {ptzControl} />
          {/if}
        {/if}
      </div>
    </div>
  </section>
{/if}

<!-- mob -->
{#if $isMobile}
  <section
    class="mob min-h-screen w-full text-black relative sm:hidden bg-[#f5f6f7]"
  >
    {#if !$landscape}
      <TopBar
        {data}
        displayIcons={true}
        bind:liveFullscreen={$liveFullscreen}
        bind:editMode={$editMode}
        bind:landscape={$landscape}
      />
    {/if}
    <StreamView
      {galleryItems}
      bind:landscape={$landscape}
      bind:activeStreamIndex={$activeStreamIndex}
      bind:liveFullscreen={$liveFullscreen}
      bind:showAlerts={$showAlerts}
      bind:editMode={$editMode}
      {data}
    />
    <MenuMob
      bind:landscape={$landscape}
      bind:showAlerts={$showAlerts}
      bind:activeStreamIndex={$activeStreamIndex}
    />
  </section>
{/if}
<!-- {#if selectedEvent}
  <EventModal {selectedEvent} on:close={() => (selectedEvent = null)} />
{/if} -->

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Video Playback</Dialog.Title>
    </Dialog.Header>
    <div class="flex items-center justify-center w-full h-full">
      {#if selectedVideo}
        <video
          class="video-player"
          width="640"
          height="360"
          controls
          autoplay
          muted
          controlsList="nodownload"
          disablePictureInPicture
        >
          <source src={selectedVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      {:else}
        <Spinner />
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>

<style>
  .shad {
    box-shadow: -3px 3px 4px 0px #0000001f;
  }
</style>
