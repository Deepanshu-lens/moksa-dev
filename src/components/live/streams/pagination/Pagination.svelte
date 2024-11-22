<script lang="ts">
  import * as Pagination from "@/components/ui/pagination/index.js";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import { writable } from "svelte/store";
  import pb from "@/lib/pb";
  import { cameras, totalCameras, selectedNode } from "@/stores";

  export let MAX_CAMERAS_PER_PAGE = 9;
  export let initialPage = 0;

  const currentPage = writable(initialPage); // Tracks the current page

  // Function to fetch cameras for the current page
  const fetchCameras = async (page: number) => {
    try {
      const response = await pb
        .collection("camera")
        .getList(page, MAX_CAMERAS_PER_PAGE, {
          fields: "id,name,url,subUrl,save",
          filter: `node.id ?= "${$selectedNode}"`,
        });
      cameras.set(response.items); // Update the cameras store with new data
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  // Handle pagination navigation
  const nextPage = () => {
    console.log("calling next page");
    currentPage.update((page) => {
      if ((page + 1) * MAX_CAMERAS_PER_PAGE < $totalCameras) {
        fetchCameras(page + 1);
        return page + 1;
      }
      return page;
    });
  };

  const goToPage = (page: any) => {
    console.log(
      "calling got page",
      page,
      page * MAX_CAMERAS_PER_PAGE,
      $totalCameras
    );
    currentPage.update((current) => {
      if (page >= 0 ) {
        fetchCameras(page);
        return page;
      }
      return current; // Return current page if the requested page is out of bounds
    });
  };

  const prevPage = () => {
    console.log("calling prev page");
    currentPage.update((page) => {
      if (page > 0) {
        fetchCameras(page - 1);
        return page - 1;
      }
      return page;
    });
  };

  $: if (MAX_CAMERAS_PER_PAGE) {
    currentPage.set(initialPage - 1);
    fetchCameras(initialPage - 1);
  }
</script>

<Pagination.Root
  count={$totalCameras}
  perPage={MAX_CAMERAS_PER_PAGE}
  siblingCount={1}
  let:pages
  let:currentPage
>
  <Pagination.Content>
    <Pagination.Item>
      <Pagination.PrevButton
        on:click={() => prevPage()}
        disabled={currentPage === 1}
      >
        <ChevronLeft class="h-4 w-4" />
        <span class="hidden sm:block">Previous</span>
      </Pagination.PrevButton>
    </Pagination.Item>
    {#each pages as page (page.key)}
      {#if page.type === "ellipsis"}
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
      {:else}
        <Pagination.Item>
          <Pagination.Link
            {page}
            isActive={currentPage === page.value}
            on:click={() => {
              goToPage(page.value);
            }}
          >
            {page.value}
          </Pagination.Link>
        </Pagination.Item>
      {/if}
    {/each}
    <Pagination.Item>
      <Pagination.NextButton
        on:click={() => nextPage()}
        disabled={currentPage * MAX_CAMERAS_PER_PAGE >= $totalCameras}
      >
        <span class="hidden sm:block">Next</span>
        <ChevronRight class="h-4 w-4" />
      </Pagination.NextButton>
    </Pagination.Item>
  </Pagination.Content>
</Pagination.Root>
