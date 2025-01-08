<script lang="ts">
  import SidePannel from "@/components/analytics/side-pannel.svelte";
  import { user } from "@/stores";
  import { moksaToken } from "@/stores/moksa-token";

  let moksaObj = {
    token: $moksaToken,
    user: $user,
  };

  console.log(moksaObj, "moksaObj");
</script>

<div class="hidden lg:block">
  <SidePannel moksa={moksaObj} />
</div>