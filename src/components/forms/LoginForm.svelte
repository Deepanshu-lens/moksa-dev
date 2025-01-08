<script lang="ts">
  import pb from "@/lib/pb";
  import { Input } from "@/components/ui/input";
  import { userSchema } from "@/types";
  import { toast } from "svelte-sonner";
  import { validator } from "@felte/validator-zod";
  import Icon from "@iconify/svelte";
  import { createForm } from "felte";
  import { user } from "@/stores";
  import Button from "../ui/button/button.svelte";
  import { addAuthLogs } from "@/lib/logs/authLogs";

  if (pb.authStore.token) {
    pb.authStore.clear();
  }

  const loginSchema = userSchema.pick({ email: true });

  function setCookie(name: string, value: string, days: number) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    window.document.cookie = `${name}=${value}; ${expires}; path=/; Secure; SameSite=Strict`;
  }

  const { form, errors, reset, isSubmitting } = createForm({
    initialValues: { email: "", password: "" },
    extend: validator({ schema: loginSchema }),
    onSubmit: async (values) => {
      const response = await login(values.email, values.password);
      if (!response) {
        reset();
        return;
      }
      await addAuthLogs("login", values.email);

      if (window.api) {
        window.api.navigate("/index");
      } else {
        window.location.href = "/";
      }
    },
    onError: (err) => {
      console.log("Form validation failed:", err);
    },
  });

  async function login(email: string, password: string) {
    // logging in via pb
    let authData;
    try {
      authData = await pb.collection("users").authWithPassword(email, password);
    } catch (error: any) {
      if (error.message === "Failed to authenticate.") {
        toast.error("Invalid email or password. Please try again.");
        return;
      }
      toast.error("Authentication failed. Please try again.");
    }

    // logging in via moksa apis
    try {
      await fetch(`${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (data.data && data.data.token) {
            const token = data?.data?.token;
            console.log(token, "token");
            setCookie("moksa-token", token, 1);
          } else {
            console.log("Token not found in response");
          }
        })
        .catch((err) => {
          console.log(err);
        });

      // const user = await pb
      //   ?.collection("users")
      //   .authWithPassword(email, password);

      // const eventData = { email: email };

      // const event = await pb?.collection("loginEvents").create(eventData);
    } catch (err: any) {
      console.log(err, "error here");
      console.log(
        "login error",
        err.message === undefined ? "User not found" : err.message
      );
    }

    if (authData) {
      let userRole = await pb?.collection("users").getFullList({
        filter: `id="${authData?.record?.id}"`,
        expand: "role",
        fields: "expand",
      });

      let userObj = {
        role: userRole[0]?.expand?.role?.roleName,
        ...authData?.record,
      };

      user.set(userObj);
      if (window.api) {
        await window.api.invoke("save-auth-token", pb.authStore.token);
      } else {
        localStorage.setItem("pb_auth_token", pb.authStore.token);
      }
      return authData;
    }
    toast.error("Authentication failed. Please try again.");
    return;
  }
</script>

<form use:form class="space-y-4 w-full">
  <div class="grid w-full max-w-sm items-center gap-1.5">
    <div class="relative">
      <Icon
        icon="material-symbols:mail-rounded"
        class="w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <Input
        type="email"
        name="email"
        placeholder="Email Address"
        class="pl-10 w-full border border-gray-300 rounded-md"
      />
    </div>
    <div class="text-rose-500 text-xs">
      {#if $errors.email}
        {$errors.email}
      {/if}
    </div>
  </div>

  <div class="grid w-full max-w-sm items-center pb-4">
    <div class="relative">
      <Icon
        icon="material-symbols:password"
        class="w-22 h-22 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        class="pl-10 w-full border border-gray-300 rounded-md"
      />
    </div>
    <div class="text-rose-500 text-xs">
      {#if $errors.password}
        {$errors.password}
      {/if}
    </div>
  </div>

  <!-- Forgot Password link -->
  <div class="w-[350px] flex justify-end">
    <a
      href="/forgot-password"
      class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7]"
    >
      Forgot Password
    </a>
  </div>

  <div class="flex flex-col items-center justify-between mb-10 sm:mb-0">
    <Button
      disabled={$isSubmitting}
      type="submit"
      class="disabled:cursor-not-allowed bg-[#015A62] hover:bg-[#015A62]/[.4] text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline"
    >
      {#if $isSubmitting}
        Submitting ...
      {:else}
        Sign In
      {/if}
    </Button>
    <button
      class="inline-block cursor-pointer align-baseline font-bold text-sm text-[#797c80] /[.7] mt-4"
      on:click={() => {
        if (window.api) {
          window.api.navigate("/register");
        } else {
          window.location.href = "/register";
        }
      }}
    >
      Don't have an account yet?
      <span class="ml-1 text-primary font-semibold"> Sign up </span>
    </button>
  </div>
</form>
