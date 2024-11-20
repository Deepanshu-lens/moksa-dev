<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  export let message = "";
  onMount(() => {
    if (message) {
      console.log(message);
      // Trigger the toast error message on the client side
      toast(message);
    }
  });
</script>
