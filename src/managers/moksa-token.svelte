<script lang="ts">
  import { moksaToken } from "@/stores/moksa-token";
  import { onMount } from "svelte";

  onMount(() => {
    if (typeof window !== "undefined") {
      let mToken = window.localStorage.getItem("moksa-token");
      if (mToken) {
        moksaToken.set(mToken);
      }
    }
  });
</script>
