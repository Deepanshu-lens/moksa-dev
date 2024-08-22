<script lang="ts">
  import { cn } from "@/lib";
  import type { HTMLAttributes } from "svelte/elements";

  type $$Props = HTMLAttributes<HTMLTableSectionElement>;

  let className: $$Props["class"] = undefined;
  export { className as class };
</script>

<tbody class={cn(className)} {...$$restProps}>
  <slot />
</tbody>
