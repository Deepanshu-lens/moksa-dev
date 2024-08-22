<script lang="ts">
  import TopBar from "@/components/mobile/TopBar.svelte";
  import { PlusCircle } from "lucide-svelte";
  import { mode } from "mode-watcher";
  console.log($mode);
</script>

<form method="POST" action="?/addNode" class="w-full h-screen bg-[#F5F6F7]">
  <TopBar displayIcons={false} />
  <img
    alt="add-vector"
    src={$mode === "light"
      ? "/images/lightNodeVector.jpg"
      : "/images/darkNodeVector.jpg"}
    class="h-[300px] w-full aspect-square object-cover"
  />
  <p
    class="text-[#0f1010] text-center font-semibold text-3xl tracking-[.381px] mt-[20px]"
  >
    Add Node to get started!
  </p>
  <div class="flex flex-col items-center mt-[30px]">
    <p
      class="text-black font-medium tracking-[.234px] text-xl leading-[16.41px]"
    >
      Node name
    </p>
    <input
      type="text"
      name="name"
      required
      class=" w-[85%] px-4 py-[15px] border-2 border-solid border-[#015a62] mt-10 rounded-[8px] text-black text-lg"
    />
  </div>
  <button
    type="submit"
    class="flex gap-2 px-[120px] py-[15px] bg-[#015a62] text-white mt-[80px] rounded-[8px] justify-center items-center mx-auto"
  >
    <PlusCircle />
    Add Node
  </button>
</form>
.length
