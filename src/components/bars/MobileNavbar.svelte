<script>
  import MobileMenu from "./MobileNavs/MobileMenu.svelte";
  import MobileNav from "./MobileNavs/MobileNav.svelte";
  let isLoggedIn = !!window.localStorage.getItem("pb_auth_token");
  const currentPath = window?.location?.pathname;
</script>

{#if isLoggedIn && import.meta.env.PUBLIC_BRAND_NAME !=="Moksa AI"}
  {#if currentPath === "/"}
    <MobileMenu />
  {/if}
  <MobileNav />
{/if}
