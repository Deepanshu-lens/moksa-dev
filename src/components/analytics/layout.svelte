<script lang="ts">
  import SidePannel from "@/components/analytics/side-pannel.svelte";
  export let moksa: any = {};
  import { user } from "@/stores";

  let moksaObj = {
    ...moksa,
    user: $user,
  };
</script>

<div class="hidden lg:block">
  <SidePannel moksa={moksaObj} />
</div>
