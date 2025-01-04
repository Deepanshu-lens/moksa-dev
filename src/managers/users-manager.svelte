<script lang="ts">
  import pb from "@/lib/pb";
  import { moksaUsers } from "@/stores/moksa-user";
  import { onMount } from "svelte";
  export let moksa;

  const today = new Date();
  const oneYearAgo = new Date(today);
  const oneWeekAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  oneWeekAgo.setDate(today.getDate() - 7);

  const allUsers = async () => {
    const allUsers = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/getAllUsers/1/100`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${moksa?.token}`,
        },
      }
    );
    return allUsers.json();
  };

  const safeExecute = async (fn: () => Promise<any>) => {
    try {
      return (await fn()) || [];
    } catch (error) {
      console.error(`Error executing function: ${error}`);
      return [];
    }
  };

  // get user role from pb
  const getUserRole = async () => {
    const { roleName } = await pb
      ?.collection("roles")
      .getOne(moksa?.user?.role);
    return roleName;
  };

  onMount(async () => {
    const userData = await safeExecute(allUsers);
    // const userRole = await getUserRole();
    moksaUsers.set({
      users: userData?.data?.data,
    //   userRole,
    });
  });
</script>
