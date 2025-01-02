<script lang="ts">
  import { markRoi } from "./../../lib/stores.ts";
  import { toast } from "svelte-sonner";
  import { selectedNode } from "@/stores";
  import * as Dialog from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import { cn } from "@/lib";
  export let toggleDisplayLayouts: () => void;
  let dialogOpen = false;
  let selected =
    $selectedNode.maxStreamsPerPage === 13
      ? 7
      : $selectedNode.maxStreamsPerPage === 10
        ? 8
        : $selectedNode.maxStreamsPerPage === 5
          ? 9
          : $selectedNode.maxStreamsPerPage === 7
            ? 10
            : Math.sqrt($selectedNode.maxStreamsPerPage);

  const onSubmit = async () => {
    markRoi.set(false);
    $selectedNode.set({
      ...$selectedNode,
      maxStreamsPerPage:
        selected === 7
          ? 13
          : selected === 8
            ? 10
            : selected === 9
              ? 5
              : selected === 10
                ? 7
                : selected * selected,
    });
    dialogOpen = false;
    toggleDisplayLayouts();
    const update = await fetch("/api/node/layoutUpdate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodeId: $selectedNode.id,
        newValue:
          selected === 7
            ? 13
            : selected === 8
              ? 10
              : selected === 9
                ? 5
                : selected === 10
                  ? 7
                  : selected * selected,
      }),
    });
    if (!update.ok) {
      toast.error("Something went wrong. Please try again");
      return;
    } else {
      toast("layout Updated Successfully!");
    }
  };
</script>

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Trigger><slot /></Dialog.Trigger>
  <Dialog.Content class=" sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Screen Layout</Dialog.Title>
      <Dialog.Description>Change Screen Layout</Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-wrap items-center justify-start w-full py-10 px-4">
      {#each Array.from({ length: 7 }, (_, i) => i - 1).toReversed() as layout}
        <div
          class={cn(
            "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1",
            selected === layout + 1 &&
              "px-2 border border-solid border-[#015a62] rounded-md text-primary"
          )}
        >
          <button
            on:click={(e) => {
              e.preventDefault();
              selected = layout + 1;
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
                    width={(100 - 2 * (Math.max(layout + 1, layout + 1) - 1)) /
                      Math.max(layout + 1, layout + 1)}
                    height={(100 - 2 * (Math.max(layout + 1, layout + 1) - 1)) /
                      Math.max(layout + 1, layout + 1)}
                    rx={((100 - 2 * (Math.max(layout + 1, layout + 1) - 1)) /
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
          "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1",
          selected === 9 &&
            "px-2 border border-solid border-[#015a62] rounded-md text-primary"
        )}
        on:click={(e) => {
          e.preventDefault();
          selected = 9;
        }}
      >
        <svg
          width="60"
          height="60"
          class={cn(selected === 9 ? "text-primary" : "text-muted-foreground")}
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
          "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1",
          selected === 10 &&
            "px-2 border border-solid border-[#015a62] rounded-md text-primary"
        )}
        on:click={(e) => {
          e.preventDefault();
          selected = 10;
        }}
      >
        <svg
          width="60"
          class={cn(selected === 10 ? "text-primary" : "text-muted-foreground")}
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
          "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1",
          selected === 7 &&
            "px-2 border border-solid border-[#015a62] rounded-md text-primary"
        )}
        on:click={(e) => {
          e.preventDefault();
          selected = 7;
        }}
      >
        <svg
          width="60"
          height="60"
          class={cn(selected === 7 ? "text-primary" : "text-muted-foreground")}
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
          "flex flex-col items-center justify-evenly py-4 mt-2 w-1/3 gap-1",
          selected === 8 &&
            "px-2 border border-solid border-[#015a62] rounded-md text-primary"
        )}
        on:click={(e) => {
          e.preventDefault();
          selected = 8;
        }}
      >
        <svg
          width="60"
          class={cn(selected === 8 ? "text-primary" : "text-muted-foreground")}
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
    </div>
    <Dialog.Footer>
      <Button
        variant="secondary"
        on:click={() => {
          dialogOpen = false;
        }}>Cancel</Button
      >
      <Button type="submit" on:click={onSubmit}>Save Changes</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
