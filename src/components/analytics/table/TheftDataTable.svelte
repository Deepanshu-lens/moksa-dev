<script lang="ts">
  import { createTable, Render, Subscribe } from "svelte-headless-table";
  import * as Table from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { ArrowUpDown, Play, Store, User } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import {
    addPagination,
    addTableFilter,
    addSelectedRows,
    addSortBy,
  } from "svelte-headless-table/plugins";
  import { readable, writable } from "svelte/store";
  import * as Dialog from "@/components/ui/dialog";
  import Spinner from "@/components/ui/spinner/Spinner.svelte";
  import axios from "axios";
  const dispatch = createEventDispatcher();
  export let theftData;
  export let token;
  export let dateRange;
  export let selectedStore;

  let currentApiPage = 1;
  let apiPageSize = 100;
  let localPageSize = 5;
  let localPageIndex = 0;

  $: totalApiPages = Math.ceil(($theftData?.total || 0) / apiPageSize);
  $: totalLocalPages = Math.ceil(
    ($theftData?.data?.length || 0) / localPageSize,
  );

  async function loadTheftData(page, size) {
    currentApiPage = page;
    currentApiPage++;
    const today = new Date();
    let startDate = new Date(today);

    switch ($dateRange) {
      case "7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "15 Days":
        startDate.setDate(today.getDate() - 15);
        break;
      case "30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "12 Months":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7);
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    console.log(formatDate(startDate));
    console.log(formatDate(today));
    try {
      const newData = await fetch(
        `https://api.moksa.ai/theft/theftListBasedOnStoreId/${$selectedStore.value}/${formatDate(startDate)}/${formatDate(today)}/${currentApiPage}/${apiPageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await newData.json();
      console.log(data);
      const oldData = $theftData.data;

      $theftData.data = [...oldData, ...data.data.data];
    } catch (error) {
      console.error("Error fetching theft data:", error);
    }
  }

  $: console.log("Table data updated:", $theftData);

  $: dbData = $theftData.data.map((item) => {
    const createdDate = item?.createdAt ? new Date(item?.createdAt) : null;
    const formattedDate = createdDate
      ? createdDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";
    const formattedTime = createdDate
      ? createdDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";

    return {
      storeName: item.name || "N/A",
      date: formattedDate,
      videoLink: "Watch Video",
      videoUri: item.video_uri,
      time: formattedTime,
      theftProbability: item.theftProbability,
      live: item.live,
    };
  });

  let selectedVideo = null;
  let dialogOpen = false;

  $: data = writable(dbData);

  $: readableData = readable(dbData, (set) => {
    const unsubscribe = data.subscribe(set);
    return unsubscribe;
  });

  $: table = createTable(readableData, {
    page: addPagination({ initialPageSize: localPageSize }),
    sort: addSortBy(),
    filter: addTableFilter({
      fn: ({ filterValue, value }: { filterValue: string; value: string }) =>
        value.toLowerCase().includes(filterValue.toLowerCase()),
    }),
    select: addSelectedRows(),
  });

  // [
  //     { header: 'Profile', key: 'profile' },
  //     { header: 'First Name', key: 'first_name' },
  //     { header: 'Last Name', key: 'last_name' },
  //     { header: 'Validated By', key: 'validated_by' },
  //     { header: 'Date Validated', key: 'date_validated' },
  //     { header: 'Video Link', key: 'video_uri' },
  //     { header: 'Store ID', key: 'store_id' },
  //     { header: 'Created At', key: 'createdAt' },
  //     { header: 'Theft Probability', key: 'theftProbability' },
  //     { header: 'Store Name', key: 'name' }
  //   ],

  // $: columns = table.createColumns([
  //   table.column({
  //     accessor: "storeName",
  //     header: "Store Name",
  //   }),
  //   table.column({
  //     accessor: "date",
  //     header: "Date",
  //   }),
  //   table.column({
  //     accessor: "videoLink",
  //     header: "Video Link",
  //   }),
  //   table.column({
  //     accessor: "time",
  //     header: "Time",
  //   }),
  //   table.column({
  //     accessor: "theftProbability",
  //     header: "Theft Probability",
  //   }),
  //   // table.column({
  //   //   accessor: "duration",
  //   //   header: "Duration",
  //   // }),
  // ]);

  $: columns = table.createColumns(
    $theftData.column
      .filter(
        (col) =>
          ![
            "store_id",
            "first_name",
            "last_name",
            "validated_by",
            "date_validated",
          ].includes(col.key),
      )
      .sort((a, b) => {
        const order = [
          "name",
          "theftProbability",
          "createdAt",
          "profile",
          "video_uri",
        ];
        return order.indexOf(a.key) - order.indexOf(b.key);
      })
      .map((col) =>
        table.column({
          accessor:
            col.key === "name"
              ? "storeName"
              : col.key === "video_uri"
                ? "videoLink"
                : col.key === "createdAt"
                  ? "date"
                  : col.key === "profile"
                    ? "time"
                    : col.key,
          header:
            col.header === "Profile"
              ? "Time"
              : col.header === "Created At"
                ? "Date"
                : col.header === "Name"
                  ? "Store"
                  : col.header,
        }),
      ),
  );

  $: ({ headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
    table.createViewModel(columns));

  $: ({ pageIndex, hasNextPage, hasPreviousPage, pageCount } =
    pluginStates.page);

  $: ({ pageIndex, hasNextPage, hasPreviousPage, pageCount } =
    pluginStates.page);

  $: if (dialogOpen === false) {
    if (selectedVideo) {
      console.log("revoking video");
      URL.revokeObjectURL(selectedVideo);
      selectedVideo = null;
    }
  }

  const openVideoDialog = async (videoUri) => {
    const data = { key: videoUri };
    dialogOpen = true;
    try {
      const response = await axios.post(`https://api.moksa.ai/stream`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      // Log the response headers to check the content type and other details
      console.log("Response headers:", response.headers);

      // Create a Blob from the response data
      const videoBlob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const videoUrl = URL.createObjectURL(videoBlob);
      selectedVideo = videoUrl;
      console.log("Video URL:", selectedVideo);
    } catch (error) {
      console.error("Error fetching video:", error);
    }
  };
</script>

<div class="m-0">
  <Table.Root {...$tableAttrs} class="w-full">
    <Table.Header>
      {#each $headerRows as headerRow}
        <Subscribe rowAttrs={headerRow.attrs()}>
          <Table.Row class="bg-transparent flex flex-row border-b items-center">
            {#each headerRow.cells as cell (cell.id)}
              <Subscribe
                attrs={cell.attrs()}
                let:attrs
                props={cell.props()}
                let:props
              >
                <Table.Head
                  {...attrs}
                  class="text-[#727272] whitespace-nowrap h-full flex items-center justify-center flex-1 w-[14.285%]"
                >
                  <Button
                    variant="ghost"
                    on:click={props.sort.toggle}
                    class={`hover:bg-transparent text-[#727272] opacity-60 min-w-[150px] ${cell.id === "storeName" ? "text-start justify-start" : ""}`}
                  >
                    <Render of={cell.render()} />
                    <ArrowUpDown class="ml-2 h-4 w-4" />
                  </Button>
                </Table.Head>
              </Subscribe>
            {/each}
          </Table.Row>
        </Subscribe>
      {/each}
    </Table.Header>
    <div class="w-full h-[350px] overflow-y-auto flex">
      {#if $theftData?.data?.length > 0}
        <Table.Body {...$tableBodyAttrs} class="w-full">
          {#each $pageRows as row (row.id)}
            <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
              <Table.Row
                {...rowAttrs}
                class="border-b flex items-center w-full"
              >
                {#each row.cells as cell (cell.id)}
                  <Subscribe attrs={cell.attrs()} let:attrs>
                    <Table.Cell
                      {...attrs}
                      class="flex w-[14.285%] items-center justify-center flex-1 whitespace-nowrap py-2"
                    >
                      {#if cell.id === "storeName"}
                        <div
                          class="flex items-center gap-2 text-sm min-w-[150px] text-start justify-start"
                        >
                          <Store class="text-blue-600" />
                          <span class="flex gap-2 items-center"
                            >{row.original.storeName}
                            {#if row.original.live}
                              <span class="text-red-500 font-bold text-xs"
                                >Live</span
                              >
                            {/if}
                          </span>
                        </div>
                      {:else if cell.id === "employee"}
                        <div class="flex items-center gap-2">
                          <!-- <img src="/path-to-employee-image.jpg" alt={row.original.employee} class="w-8 h-8 rounded-full" /> -->
                          <User size="20" />
                          <span>{row.original.employee}</span>
                        </div>
                      {:else if cell.id === "videoLink"}
                        <Button
                          variant="link"
                          class="text-red-500 p-0 flex items-center gap-2"
                          on:click={() => {
                            openVideoDialog(row.original.videoUri);
                          }}
                        >
                          <Play size={16} />
                          {row.original.videoLink}
                        </Button>
                      {:else if cell.id === "callHistory"}
                        <span class="flex items-center gap-2">
                          <svg
                            class="w-4 h-4 text-green-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                          {row.original.callHistory}
                        </span>
                      {:else}
                        <Render of={cell.render()} />
                      {/if}
                    </Table.Cell>
                  </Subscribe>
                {/each}
              </Table.Row>
            </Subscribe>
          {/each}
        </Table.Body>
      {:else}
        <Table.Body {...$tableBodyAttrs} class="w-full">
          <Table.Row class="border-b flex items-center w-full">
            <Table.Cell
              class="flex w-[14.285%] items-center justify-center flex-1 whitespace-nowrap py-2"
            >
              <p class="text-center text-gray-500">No data found</p>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      {/if}
    </div>
  </Table.Root>
</div>

{#if $theftData?.data?.length > 0}
  <div class="flex flex-row items-center justify-center space-x-4 py-4">
    <Button
      size="sm"
      variant="outline"
      class="bg-transparent hover:bg-transparent text-[#727272] gap-2"
      on:click={() => ($pageIndex = $pageIndex - 1)}
      disabled={!$hasPreviousPage}
    >
      Previous
    </Button>
    <div class="flex flex-row gap-2 items-center text-sm text-muted-foreground">
      <span class="p-2 rounded-md aspect-square bg-[#015a62] bg-opacity-10">
        {$pageIndex + 1 < 10 ? "0" + ($pageIndex + 1) : $pageIndex + 1}
      </span>
      of
      <span class="p-2 rounded-md aspect-square bg-[#015a62] bg-opacity-20">
        {$pageCount < 10 ? "0" + $pageCount : $pageCount}
      </span> Page.
    </div>

    <Button
      size="sm"
      variant="outline"
      disabled={!$hasNextPage && currentApiPage >= totalApiPages}
      class="bg-transparent hover:bg-transparent text-[#727272] gap-2"
      on:click={() => {
        if ($pageIndex < totalLocalPages - 1) {
          $pageIndex = $pageIndex + 1;
        }
      }}
    >
      Next
    </Button>
  </div>
{/if}
<!-- on:close={() => {
    console.log("revoking video");
    if (selectedVideo) {
      console.log("revoking video");
      URL.revokeObjectURL(selectedVideo);
      selectedVideo = null;
    }
  }} -->

<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Video Playback</Dialog.Title>
    </Dialog.Header>
    <div class="flex items-center justify-center w-full h-full">
      {#if selectedVideo}
        <!-- <video  class="video-player" width="640" height="360" controls autoplay muted  controlsList="nodownload"   disablePictureInPicture >
        <source src={selectedVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video> -->
        <video
          width="640"
          height="360"
          controls
          autoplay
          muted
          controlsList="nodownload"
          disablePictureInPicture
          class="video-player aspect-video h-[360px] w-auto"
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
  .video-player::-internal-media-controls-download-button {
    display: none !important;
  }

  .video-player::-webkit-media-controls-enclosure {
    overflow: hidden !important;
  }

  .video-player::-webkit-media-controls-panel {
    width: calc(100% + 30px) !important;
  }
</style>
