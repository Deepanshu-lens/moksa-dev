<script lang="ts">
  import { onMount } from "svelte";
  import { validateUser } from "@/types";
  import pb from "@/lib/pb";
  import { user } from "@/stores/user";

  async function authenticate() {
    if (window.api) {
      console.log("ELECTRON");
      return await window.api.invoke("get-auth-token");
    }
    return localStorage.getItem("pb_auth_token");
  }

  try {
    pb.collection("users").subscribe("*", (e) => {
      if (e.action === "update") {
        const validated = validateUser(e.record);
        if (validated)
          user.update(
            (current) =>
              current && (current.id === validated.id ? validated : current)
          );
      }
    });
  } catch (error) {
    console.error("Failed realtime user");
  }

  onMount(() => {
    authenticate().then((token) => {
      if (token) {
        if (!pb.authStore.model) {
          pb.authStore.save(token);
          pb.collection("users")
            .authRefresh()
            .catch(() => {
              console.error("Failed to refresh authentication.");
            });
        }
        user.set(pb.authStore.model);
      } else {
        if (window.api) {
          const isLoginPage =
            /\/login(\.html)?$/.test(window.location.pathname) ||
            /\/register(\.html)?$/.test(window.location.pathname);
          console.log("CALLED FROM User", isLoginPage);
          if (!isLoginPage) window.api.navigate("/login");
        } else {
          const isLoginPage =
            window.location.pathname === "/login" ||
            window.location.pathname === "/register";
          if (!isLoginPage) window.location.href = "/login";
        }
      }
    });
  });
</script>
