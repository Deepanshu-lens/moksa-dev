<!-- <div
  class="
    flex
    flex-col
    items-start
    justify-center h-screen w-screen
    dark:bg-dark-add-node
    bg-no-repeat
    pl-32
    bg-light-add-node
    bg-contain
    bg-right
    dark:bg-cover"
>
  <h2 class="text-center text-2xl font-semibold mb-6">
    Add Node to get started!
  </h2>
  <form method="POST" action="?/addNode" class="flex flex-col">
    <label for="nodeName" class="font-medium text-start self-start mb-2">
      Node name
    </label>
    <input
      name="name"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />
    <button
      class="flex max-w-[160px] hover:bg-[#015a62]/[.9] dark:bg-transparent bg-[#015a62] border-2 border-white border-solid dark:hover:bg-[white] dark:hover:text-[#015a62] text-md text-white items-center justify-center py-2 px-6 font-medium rounded-lg"
      type="submit"
    >
      Add Node
    </button>
  </form>
</div> -->

<div class="flex flex-col items-start justify-center h-screen w-screen dark:bg-dark-add-node bg-no-repeat pl-32 pb-10 bg-light-add-node bg-contain bg-right dark:bg-cover">
  <h2 class="text-center text-2xl font-semibold mb-6">
    Add Store to get started!
  </h2>
  <form method="POST" action="?/addNode" class="flex flex-col">
    <label for="nodeName" class="font-medium text-start self-start mb-2">
      Store name
    </label>
    <input
      name="name"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />

    <label for="address" class="font-medium text-start self-start mb-2">
      Address
    </label>
    <input
      name="address"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />

    <label for="pincode" class="font-medium text-start self-start mb-2">
      Pincode
    </label>
    <input
      name="pincode"
      type="number"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />

    <label for="country" class="font-medium text-start self-start mb-2">
      Country
    </label>
    <input
      name="country"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />

    <label for="manager" class="font-medium text-start self-start mb-2">
      Manager
    </label>
    <input
      name="manager"
      required
      class="w-[480px] text-black dark:text-white dark:bg-background bg-transparent font-medium px-4 h-[48px] rounded-md border-2 border-solid border-[#015a62] dark:border-none mb-6"
    />

    <button
      class="flex max-w-[160px] hover:bg-[#015a62]/[.9] dark:bg-transparent bg-[#015a62] border-2 border-white border-solid dark:hover:bg-[white] dark:hover:text-[#015a62] text-md text-white items-center justify-center py-2 px-6 font-medium rounded-lg"
      type="submit"
    >
      Add Store
    </button>
  </form>
</div>