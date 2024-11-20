<script>
  import Avatar from "@/components/avatar/Avatar.svelte";
  const location = "top";
  const isVertical = location === "left" || location === "right";
</script>

<header
  class={`
  ${
    isVertical
      ? "fixed h-full w-16 md:w-20 flex-col px-4 py-4 lg:py-8 border-l flex justify-between"
      : "md:h-16 w-full px-4 md:px-4 lg:px-12 mt-6"
  }  ${
    location === "top" ? "top-0" : location === "bottom" ? "bottom-0" : ""
  } ${
    location === "left" ? "left-0" : location === "right" ? "right-0" : ""
  }  flex ${
    isVertical ? "items-center justify-between" : "justify-between items-center"
  }`}
>
  <!-- Mobile Actions add/edit/delete -->
  <div class="flex items-start justify-between w-full h-[10vh] border-b">
    <div class="flex items-center justify-between w-full">
      <img
        src="/images/Cielo_logo.svg"
        alt="Cieloview Logo"
        class="h-8 w-auto"
      />
      <Avatar />
    </div>
  </div>
</header>
