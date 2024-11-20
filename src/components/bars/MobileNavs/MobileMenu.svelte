<script lang="ts">
  //   import LayoutDialog from "../dialogs/mobile/LayoutDialog.svelte";
  import { selectedNode, selectedCamera, cameras } from "@/stores";
  import { ImageDown, Video } from "lucide-svelte";
  import { Bell } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  let showSelection: string = "";
  import AlertsDrawerMobile from "../AlertsDrawerMobile.svelte";
  import { isAlertMobileOpen } from "@/stores/ui";
  import Icon from "@iconify/svelte";
  import RegisterMobileDialog from "@/components/live/faceRegister/register-mobile-dialog.svelte";
  import html2canvas from "html2canvas";
  import JSZip from "jszip";

  export let showAlerts: boolean;
  export let activeStreamIndex: number | null;

  // selected screen ss
  const handleSingleSS = async () => {
    console.log("clicked");
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

  // all screens ss
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
</script>

<div
  class="flex items-center justify-evenly px-2 fixed w-screen bottom-[66px] z-30 pb-4 pt-2 backdrop-blur-xl"
>
  <!-- Register -->
  <RegisterMobileDialog>
    <button
      class="flex flex-col items-center justify-center gap-1 relative"
      on:click={() =>
        showSelection === "register"
          ? (showSelection = "")
          : (showSelection = "register")}
    >
      <Icon
        icon="material-symbols:familiar-face-and-zone"
        class={`p-[11px] w-[46px] h-[46px] rounded-full ${
          showSelection === "register"
            ? "bg-[#015a62] text-white"
            : "bg-[#e8e9ea] text-[#015a62]"
        }`}
      />
      <span
        class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Register
      </span>
    </button>
  </RegisterMobileDialog>

  <button
    disabled
    class="flex flex-col items-center justify-center gap-1 relative"
    on:click={() =>
      showSelection === "record"
        ? (showSelection = "")
        : (showSelection = "record")}
  >
    <Video
      class={`p-[11px] w-[46px] h-[46px] rounded-full disabled:text-neutral-300 ${
        showSelection === "record"
          ? "bg-[#015a62] text-white"
          : "bg-neutral-300 text-neutral-400"
      }`}
    />
    <span
      class="text-xs text-neutral-300 tracking-[-0.12px] font-medium text-center"
    >
      Record
    </span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if showSelection === "record"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="w-[150px] h-[95px] rounded-md bg-[f5f6f7] shadow-selection flex flex-col items-center justify-center absolute z-20 bg-white bottom-[4.5rem]"
        on:click={(e) => e.stopPropagation()}
      >
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={0}
        >
          Selected screen
        </button>
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          disabled
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={1}
        >
          All screens
        </button>
      </div>
    {/if}
  </button>

  <button
    class="flex flex-col items-center justify-center gap-1 relative"
    on:click={() =>
      showSelection === "snip"
        ? (showSelection = "")
        : (showSelection = "snip")}
  >
    <ImageDown
      class={`p-[11px] w-[46px] h-[46px] rounded-full ${
        showSelection === "snip"
          ? "bg-[#015a62] text-white"
          : "bg-[#e8e9ea] text-[#015a62]"
      }`}
    />
    <span
      class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
    >
      Snip
    </span>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    {#if showSelection === "snip"}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="w-[150px] h-[95px] rounded-md bg-[f5f6f7] shadow-selection flex flex-col items-center justify-center absolute z-20 bg-white bottom-[4.5rem]"
        on:click={(e) => e.stopPropagation()}
      >
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={0}
          on:click={() => {
            if (activeStreamIndex !== null) {
              handleSingleSS();
            } else {
              toast.error(
                "No Stream selected currently, tap on a stream to select it."
              );
              showSelection = "";
            }
          }}
        >
          Selected screen
        </button>
        <!-- svelte-ignore node_invalid_placement_ssr -->
        <button
          on:click={() => {
            captureAllScreenshot();
          }}
          class="text-[#2c2c2c] text-sm focus:bg-[#015a62]/[.12] py-[11px] w-full"
          tabIndex={1}
          on:click={() => {
            if ($selectedNode?.camera.length > 0) {
            } else {
              toast.error("number of streams = 0");
            }
          }}
        >
          All screens
        </button>
      </div>
    {/if}
  </button>

  <AlertsDrawerMobile>
    <button
      class="flex flex-col items-center justify-center gap-1"
      on:click={() => {
        isAlertMobileOpen.update((value) => !value);
      }}
    >
      <Bell
        class={`p-[11px] w-[46px] h-[46px] rounded-full ${
          showAlerts ? "bg-[#015a62] text-white" : "bg-[#e8e9ea] text-[#015a62]"
        }`}
      />
      <span
        class="text-xs text-black/[.6] tracking-[-0.12px] font-medium text-center"
      >
        Alerts
      </span>
    </button>
  </AlertsDrawerMobile>
</div>
