<script lang="ts">
  import NotificationCard from "../cards/NotificationCard.svelte";
  export let liveData;

  const notifications = [
    // {
    //   title: "Theft Alert!",
    //   description:
    //     `Suspicious activity detected. . View Video.`,
    //   seen: false,
    //   time: "5min",
    //   actions: true,
    // },
    // {
    //   title: "Server Alert",
    //   description: "Server CPU usage is at 90%.",
    //   seen: true,
    //   time: "10min",
    //   actions: false,
    // },
    // {
    //   title: "Low Efficiency",
    //   description:
    //     "Employee efficiency has dropped below the acceptable threshold for the past 3 days.",
    //   seen: true,
    //   time: "2hr",
    //   actions: false,
    // },
    // {
    //   createdAt: "2024-10-07T09:35:59.563Z",
    //   updatedAt: "2024-10-07T09:35:59.568Z",
    //   is_valid: false,
    //   isPrevented: false,
    //   id: 1938,
    //   traceId: "30",
    //   store_id: 2,
    //   theftProbability: 100.8,
    //   camera_id: 1,
    //   video_uri:
    //     "https://s3.amazonaws.com/prod.moksa.upload/None/ji6kdl0gpxw9abc_20240905050918.mp4",
    //   validated_by: null,
    //   date_validated: null,
    //   cost_saved: null,
    //   itemName: null,
    // },
  ];
</script>

<article
  class="z-40 top-12 gap-2 px-2 py-4 bg-white rounded-lg right-2 absolute dropdown-shadow w-[340px] flex flex-col max-h-[450px] overflow-y-auto overflow-h-auto hide-scrollbar"
>
  {#if $liveData.length === 0}
    <p class="text-center text-gray-500">No notifications yet</p>
  {:else}
    {#each $liveData as notification, index}
      <!-- <NotificationCard
    key={index}
    title={notification.title}
    description={notification.description}
    seen={notification.seen}
    time={notification.time}
    actions={notification.actions}
    /> -->
      <NotificationCard {notification} />
    {/each}
  {/if}
</article>
