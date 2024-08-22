<script lang="ts">
	import { size } from '@floating-ui/dom';
	import { Accordion as AccordionPrimitive } from "bits-ui";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import { cn } from "@/lib.js";
	import { page } from "$app/stores";
    import { Plus } from "lucide-svelte";

	type $$Props = AccordionPrimitive.TriggerProps;
	type $$Events = AccordionPrimitive.TriggerEvents;

	let className: $$Props["class"] = undefined;
	export let level: AccordionPrimitive.HeaderProps["level"] = 3;
	export { className as class };
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		class={cn(
			"flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
			className
		)}
		{...$$restProps}
		on:click
	>
		<slot />
		{#if $page.url.pathname === '/home'}
		 <!-- <span
                class=" bg-primary rounded-lg p-1.5"
              > -->
			  <ChevronDown size={32} class="transition-transform duration-200 text-white bg-primary p-1.5 rounded-lg" />
			<!-- </span> -->
			{:else}
			<ChevronDown class="h-4 w-4 transition-transform duration-200" />
		{/if}
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
