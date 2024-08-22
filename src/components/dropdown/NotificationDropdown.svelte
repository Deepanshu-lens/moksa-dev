<script lang="ts">
  import NotificationCard from "../cards/NotificationCard.svelte";

  const notifications = [
    {
      title: "Theft Alert!",
      description:
        "Suspicious activity detected. An individual was seen removing items from storage racks. View Video.",
      seen: false,
      time: "5min",
      actions: true,
    },
    {
      title: "Server Alert",
      description: "Server CPU usage is at 90%.",
      seen: true,
      time: "10min",
      actions: false,
    },
    {
      title: "Low Efficiency",
      description:
        "Employee efficiency has dropped below the acceptable threshold for the past 3 days.",
      seen: true,
      time: "2hr",
      actions: false,
    },
  ];
</script>

<article
  class="z-40 top-12 gap-2 px-2 py-4 bg-white rounded-lg right-2 absolute dropdown-shadow w-[340px] flex flex-col max-h-[450px] overflow-h-auto hide-scrollbar"
>
  {#each notifications as notification, index}
    <NotificationCard
      key={index}
      title={notification.title}
      description={notification.description}
      seen={notification.seen}
      time={notification.time}
      actions={notification.actions}
    />
  {/each}
</article>
