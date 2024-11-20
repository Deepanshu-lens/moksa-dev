<script>
  import {
    Radio,
    PlayCircle,
    Calendar,
    Image,
    SettingsIcon,
  } from "lucide-svelte";

  const menuListMob = [
    {
      text: "Live",
      href: `/`,
    },
    {
      text: "Playback",
      href: `/playback`,
    },
    {
      text: "Events",
      href: `/events`,
    },
    {
      text: "Gallery",
      href: `/gallery`,
    },
    {
      text: "Configuration",
      href: `/configuration`,
    },
  ];

  const currentPath = window.location.pathname; // Gets the path of the URL
</script>

<header
  class="flex lg:hidden fixed bottom-0 left-0 w-full z-40 backdrop-blur-lg"
  id="navMobile"
>
  <nav
    class="bg-[white] dark:bg-[#1e1f25] flex flex-row items-center justify-between px-4 w-full pb-2 rounded-t-xl"
  >
    {#each menuListMob as menu}
      <div class={currentPath === menu.href.split("?")[0] ? "-mt-6" : "-mt-2"}>
        <!-- <a href={menu.href}> -->
        <div class={`flex flex-col justify-center items-center pt-[8px] `}>
          <span
            class={`${
              currentPath === menu.href.split("?")[0]
                ? "bg-white p-2 rounded-full"
                : "bg-transparent"
            } `}
          >
            {#if menu.text === "Live"}
              <Radio
                class={` h-[40px] w-[40px] p-2 ${
                  currentPath === menu.href.split("?")[0]
                    ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                    : "text-[#505050]"
                }`}
              />
            {:else if menu.text === "Playback"}
              <PlayCircle
                class={` h-[40px] w-[40px] p-2 ${
                  currentPath === menu.href.split("?")[0]
                    ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                    : "text-[#505050]"
                }`}
              />
            {:else if menu.text === "Events"}
              <Calendar
                class={` h-[40px] w-[40px] p-2 ${
                  currentPath === menu.href.split("?")[0]
                    ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                    : "text-[#505050]"
                }`}
              />
            {:else if menu.text === "Gallery"}
              <Image
                class={` h-[40px] w-[40px] p-2 ${
                  currentPath === menu.href.split("?")[0]
                    ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                    : "text-[#505050]"
                }`}
              />
            {:else}
              <SettingsIcon
                class={` h-[40px] w-[40px] p-2 ${
                  currentPath === menu.href.split("?")[0]
                    ? "text-white  bg-gradient-to-tr from-[#015a62] to-[#01b4c5] rounded-full "
                    : "text-[#505050]"
                }`}
              />
            {/if}
          </span>
          <span
            class={`text-[12px] font-medium ${
              currentPath === menu.href.split("?")[0]
                ? "text-[#015a62]"
                : "text-[#505050] dark:text-[rgba(255,255,255,.6)"
            }`}
          >
            {menu.text}
          </span>
        </div>
        <!-- </a> -->
      </div>
    {/each}
  </nav>
</header>
