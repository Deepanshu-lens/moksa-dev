<script lang="ts">
  import SidePannel from "@/components/analytics/side-pannel.svelte";
  import { user } from "@/stores";
  import { moksaToken } from "@/stores/moksa-token";

  let moksaObj = {
    token: $moksaToken,
    user: $user,
  };
</script>

<div class="hidden lg:block">
  {#if !!$moksaToken}
    <SidePannel moksa={moksaObj} />
  {/if}
</div>
