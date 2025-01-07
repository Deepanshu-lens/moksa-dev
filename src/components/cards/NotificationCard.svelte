<script lang="ts">
  import * as Card from "@/components/ui/card";
  export let seen = true;
  // export let title;
  // export let time;
  // export let description;
  // export let actions;

  export let notification;

  const formatTime = (time) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diff / (1000 * 60));
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }
  };
</script>

<Card.Root
  class={`border ${seen ? "bg-[#FAFAFA]" : "bg-[#3D81FC1A]"} rounded-md min-h-[100px]  w-full`}
>
  <Card.Content class="p-2 w-full flex items-start gap-4">
    <span class="flex items-center gap-1 flex-shrink-0">
      <!-- {#if !seen}
        <span class="flex-shrink-0 size-1 bg-red-500 rounded-full" />{/if} -->
      <span class="grid place-items-center bg-[#050F41] rounded-md">
        <img
          src="/images/notification.png"
          alt="notification-thumbnail"
          class="size-[32px] flex-shrink-0 mt-1 object-contain"
        />
      </span>
    </span>
    <span class="flex flex-col gap-1 w-full">
      <span class="flex items-center justify-between"
        ><h2 class="font-medium text-black">Theft Detected!</h2>
        <p class="text-[#686868] text-[11px] mr-1">
          {formatTime(notification?.createdAt)}
        </p></span
      >
      <p class="text-[#686868] text-[11px]">
        Suspecious activity detected for store <strong
          >{notification?.store_name || notification?.store_id}
        </strong>,
        {#if notification?.theftProbability}
          with probability of {notification?.theftProbability}
        {/if}
        {#if notification?.video_uri}
          <br /> Watch clip
          <a
            href={notification?.video_uri}
            target="_blank"
            class="text-[#3D81FC] underline bold">here</a
          >
        {/if}
      </p>
    </span>
  </Card.Content>
</Card.Root>
