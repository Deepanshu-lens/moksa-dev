<script lang="ts">
  import { addUserLog } from "@/lib/addUserLog";
  import { User2Icon, ChevronUp, Edit3, Check, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  export let selected;
  export let text;
  export let userData;
  export let records: LoginEvent[];
  export let user: User;

  let showUpdateUsernameModal = false;
  let showUpdateEmailModal = false;
  let showUpdatePasswordModal = false;
  let username: string | null;
  let email: string | null;

  function formatDateTime(dateTimeString: string) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("en-US", options);
  }

  function handleUsernameUpdate() {
    if (username.length > 0) {
      fetch("/api/user/updateUsername", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newName: username,
          sessionId: user.session,
        }),
      })
        .then((response) => {
          showUpdateUsernameModal = false;
          toast(`Username updated from ${user.name} to ${username}`);
          addUserLog(
            `user clicked on save username, username updated to ${username}`,
          );
        })
        .catch((err) => console.log(err));
    } else {
      toast.error("Username too small!");
    }
  }
</script>

<div
  class="flex flex-col justify-center w-[348px] px-[19px] py-[13px] border-b-[1px] border-solid border-[#e0e0e0] rounded-[8px] bg-white mb-20"
>
  <button class="flex flex-row items-center" on:click={() => (selected = "")}>
    <User2Icon class="text-[#015a62] mr-4 h-[30px] w-[30px]" />
    <span class="text-[#015a62]">{text}</span>
    <ChevronUp class="h-[30px] w-[30px] ml-auto text-[#015a62]" />
  </button>
  <p class="text-black font-medium text-sm py-2 my-2">User details</p>
  <div class="pb-4 flex flex-col items-start justify-start gap-4">
    <span class="text-[#505050] text-xs font-medium">User name</span>
    <div class="flex flex-col items-start justify-start gap-4">
      <input
        id="usernameInput"
        autoComplete="off"
        placeholder={userData.user?.name}
        type="text"
        class="py-4 w-[300px] px-3 rounded-md border-2 border-solid border-[#979797] focus:border-[#015a62] dark:focus:border-[#015a62] text-xs text-[#979797] dark:bg-[#2d2d2d] dark:border-[#333] dark:text-[#929292] disabled:cursor-not-allowed"
        disabled={!showUpdateUsernameModal}
        bind:value={username}
      />
      {#if !showUpdateUsernameModal}
        <button
          on:click={() => (showUpdateUsernameModal = true)}
          class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[80px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
        >
          Edit
          <Edit3 class="h-[20px] w-[20px]" />
        </button>
      {:else}
        <div class="flex items-center gap-4">
          <button
            on:click={() => handleUsernameUpdate()}
            class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[85px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
          >
            Save
            <Check class="scale-90" />
          </button>
          <button
            on:click={() => {
              username = null;
              showUpdateUsernameModal = false;
            }}
            class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[105px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
          >
            Discard
            <X class="scale-90" />
          </button>
        </div>
      {/if}
    </div>

    <span class="text-[#505050] text-xs font-medium">Email Id</span>
    <form
      action="?/updateEmail"
      method="POST"
      class="flex flex-col items-start justify-start gap-4"
    >
      <input
        id="emailInput"
        autoComplete="off"
        type="email"
        name="email"
        placeholder={userData.user?.email}
        class="py-4 w-[300px] px-3 rounded-md border-2 border-solid border-[#979797] focus:border-[#015a62] dark:focus:border-[#015a62] text-xs text-[#979797] dark:bg-[#2d2d2d] dark:border-[#333] dark:text-[#929292] disabled:cursor-not-allowed"
        disabled={!showUpdateEmailModal}
        bind:value={email}
      />

      {#if !showUpdateEmailModal}
        <button
          on:click={() => (showUpdateEmailModal = true)}
          class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[80px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
        >
          Edit
          <Edit3 class="h-[20px] w-[20px]" />
        </button>
      {:else}
        <div class="flex items-center gap-4">
          <button
            type="submit"
            class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[85px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7] disabled:cursor-not-allowed"
          >
            Save
            <Check class="scale-90" />
          </button>
          <button
            on:click={() => {
              email = null;
              showUpdateEmailModal = false;
            }}
            class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[105px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7] disabled:cursor-not-allowed"
          >
            Discard
            <X class="scale-90" />
          </button>
        </div>
      {/if}
    </form>

    <span class="text-[#505050] text-xs font-medium">Password</span>

    {#if !showUpdatePasswordModal}
      <form
        action="?/updatePass"
        method="POST"
        class="flex flex-col items-start justify-start gap-4"
      >
        <input
          autoComplete="off"
          type="password"
          placeholder="**************"
          class="py-4 w-[300px] pl-3 rounded-md border-2 border-solid border-[#979797] focus:border-[#015a62] dark:focus:border-[#015a62] text-xs text-[#979797] dark:bg-[#2d2d2d] dark:border-[#333] dark:text-[#929292] disabled:cursor-not-allowed"
          disabled={!showUpdatePasswordModal}
        />
        <button
          on:click={() => (showUpdatePasswordModal = true)}
          class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[80px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
        >
          Edit
          <Edit3 class="h-[20px] w-[20px]" />
        </button>
      </form>
    {:else}
      <div class="flex flex-col justify-start gap-4">
        <input
          type="email"
          name="email"
          autoComplete="off"
          placeholder="Verified Email"
          class="py-4 w-[300px] px-3 rounded-md border-2 border-solid border-[#979797] focus:border-[#015a62] dark:focus:border-[#015a62] text-xs text-[#979797] dark:bg-[#2d2d2d] dark:border-[#333] dark:text-[#929292] disabled:cursor-not-allowed"
          disabled={!showUpdatePasswordModal}
          bind:value={email}
        />
        <div class="flex flex-col items-start justify-start gap-4">
          <div class="flex items-center gap-4">
            <button
              type="submit"
              class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[85px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
            >
              Save
              <Check class="scale-90" />
            </button>
            <button
              on:click={() => {
                email = null;
                showUpdatePasswordModal = false;
              }}
              class="text-sm font-medium dark:text-white/[.7] flex gap-2 items-center w-[105px] h-[35px] px-3 py-2 bg-black/[.08] hover:bg-black/[0.18] dark:bg-white/[0.08] dark:hover:bg-white/[0.18] border-[1px] border-solid border-[rgb(145,158,171)]/[.24] rounded-md text-black/[.7]"
            >
              Discard
              <X class="scale-90" />
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
  <p class="text-black font-medium text-sm py-2 mt-2">Roles</p>
  <p class="text-black font-medium text-sm py-2 mt-2">Permissions</p>
  <p class="text-black font-medium text-sm py-2 mt-2">Policies</p>
  <p class="text-black font-medium text-sm py-2 mt-2">General</p>
  <p class="text-black font-medium text-sm py-2 mt-2">Login events</p>
  {#if records?.length > 0}
    {#each records as item, index}
      <li class="flex items-center gap-4 px-4 text-sm pb-4">
        <h2>{index + 1} :</h2>
        <p>Login Time: {formatDateTime(item?.created)}</p>
      </li>
    {/each}
  {:else}
    <span class="px-6 text-sm">Loading...</span>
  {/if}
  <p class="text-black font-medium text-sm py-2 mt-2">Device autorization</p>
  <!-- <p class="text-black font-medium text-sm py-2 mt-2">System Logs</p>
  {#if logs?.length > 0}
    {#each logs as item, index}
      <li class="flex items-center justify-evenly gap-4 px-6 pb-6">
        <p class="flex-shrink-0">
          <span class="text-base font-medium"> Event Time: </span>
          {formatDateTime(item?.created)}
        </p>
        <p>
          <span class="text-base font-medium"> Event: </span>

          {item.event}
        </p>
      </li>
    {/each}
  {:else}
    <span class="px-6 text-sm">Loading...</span>
  {/if} -->
</div>
