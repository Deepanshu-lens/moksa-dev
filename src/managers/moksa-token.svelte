<script lang="ts">
  import { moksaToken } from "@/stores/moksa-token";
  import { onMount } from "svelte";

  const login = async () => {
    const email = "main.user@moska.ai";
    const password = "qweqweqwe";

    try {
      await fetch(`https://dev.api.moksa.ai/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      })
        .then(async (res) => {
          const data = await res.json();
          console.log(data,'data');
          if (data.data && data.data.token) {
            const token = data.data.token;
            console.log(token,'token')
            // moksaToken.set(token);
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
  };

  onMount(() => {
    console.log($moksaToken);
    if (!!$moksaToken) {
      console.log("Token already exists");
      return;
    }
    login();
  });
</script>
