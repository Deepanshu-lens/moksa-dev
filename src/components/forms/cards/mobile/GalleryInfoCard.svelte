<script lang="ts">
  import * as Card from "@/components/ui/card";
  import { cn } from "@/lib/utils";
  import type { Gallery } from "@/types";
  export let person: Gallery;
  import TimeAgo from "javascript-time-ago";
  import en from "javascript-time-ago/locale/en";
  TimeAgo.addLocale(en);
  const timeAgo = new TimeAgo("en-US");
</script>

<Card.Root class="w-[90%] rounded-md informative-shadow">
  <Card.Header class="px-4 py-4"
    ><Card.Title>{person.name}</Card.Title></Card.Header
  >
  <Card.Description class="px-4">Created at: {person.created}</Card.Description>
  <Card.Content>
    <div class="pt-4 flex flex-col gap-y-2">
      <div class="flex -space-x-2 overflow-hidden items-center">
        {#each person.images as img}
          <img
            class={cn(
              "inline-block h-10 w-10 rounded-full ring-2 ring-white",
              "lg:w-12",
              "3xl:w-16 3xl:h-16"
            )}
            src={"data:image/jpeg;base64," + img}
            alt=""
          />
        {/each}
      </div>
      <h3>
        Last Updated:
        {timeAgo?.format(new Date(person?.updated))}
      </h3>
    </div>
  </Card.Content>
</Card.Root>
