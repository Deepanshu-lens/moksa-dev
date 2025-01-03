<script lang="ts">
  import SidePannel from "@/components/analytics/side-pannel.svelte";
  export let moksa: any = {};
</script>

<div class="hidden lg:block">
  <SidePannel {moksa}/>
</div>
