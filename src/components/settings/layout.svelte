<script lang="ts">
  import ConfigPanel from "../configuration/ConfigPanel.svelte";
  import type { Node } from "@/types";
  import { user } from "@/stores";
  export let moksa;
  moksa = {
    ...moksa,
    user: $user,
  };
  export let data;
  let nodes: Node[] = [];
</script>

<!-- desktop -->
<main
  class="hidden sm:flex items-start justify-between w-full overflow-y-hidden min-h-[calc(100vh-75px)]"
>
  <!-- Main container -->
  <ConfigPanel
    user={moksa?.user}
    records={data?.records}
    logs={data?.logs}
    sessionId={data?.session?.id}
    {data}
    {nodes}
  />
</main>
