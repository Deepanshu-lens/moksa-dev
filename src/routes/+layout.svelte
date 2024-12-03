<script lang="ts">
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";
  import { Toaster } from "@/components/ui/sonner";
  import { fade } from "svelte/transition";
  import { onMount, setContext } from "svelte";
  import Navbar from "@/components/navbar/Navbar.svelte";
  import type { User } from "@/types.d.ts";
  import { cn } from "@/lib";

  export let data;
  const user = data.user as User;
  const session = data.session;
  $: console.log("layout", data);

  setContext("user", user);

  onMount(async () => {
    if (user?.email) {
      try {
        await fetch("/api/tabOpened", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
      } catch (error) {
        console.error("Failed to log tab open:", error);
      }
    }
    window.addEventListener("beforeunload", async (event) => {
      if (user?.email) {
        try {
          await fetch("/api/tabClosed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
            keepalive: true,
          });
        } catch (error) {
          console.error("Failed to log tab close:", error);
        }
      }
    });
  });
</script>

<ModeWatcher defaultMode="light" />
<Toaster richColors />

{#if !user}
  <slot />
{:else}
  {#if !data.url.includes("login") && !data.url?.includes("register")}
    <Navbar {user} sessionId={session?.id} {session} mToken={data.mToken} />
  {/if}
  {#if session && user}
    {#key data.url}
      <main
        class={cn(
          "flex items-start justify-between bg-background w-full overflow-y-hidden",
          data.url?.includes("login") || data.url?.includes("register")
            ? "h-screen"
            : "max-h-[calc(100vh-75px)]",
        )}
      >
        <div
          class={`
                right
                h-screen
                transition-all ease-in-out duration-500 ${data.url?.includes("login") ? "h-screen" : "max-h-[calc(100vh-75px)]"}
                flex-1
                overflow-x-clip
                `}
          in:fade={{ delay: 600, duration: 300 }}
          out:fade={{ delay: 0, duration: 300 }}
        >
          <slot />
        </div>
      </main>
    {/key}
  {/if}
  <!-- </main> -->
{/if}
