<script>
  import { toast } from "svelte-sonner";
  import { page } from "$app/stores";
  import { MessageCircleMore, X } from "lucide-svelte";
  import { Check } from "lucide-svelte";
  export let data;
  import PocketBase from "pocketbase";

  const { account } = data;
  const { user } = data;

  $: console.log("user", user);
  $: console.log("user", user);

  let profile = {
    name: user?.firstName + " " + user?.lastName,
    email: user?.email || "",
    role: user?.role || "",
    phone: data?.user?.phoneNumber || "",
    userId: data?.user?.moksaId | "",
    avatar: data?.user?.avatar || "",
  };

  console.log(user, "accounts here");

  let accountEmail = user.email;
  let password = "";
  let confirmPassword = "";
  let oldPassword = "";
  let profilePicture = null;
  let profilePictureUrl = null;

  $: if (profilePicture && profilePicture[0]) {
    profilePictureUrl = URL.createObjectURL(profilePicture[0]);
  }

  let phoneNumber = user.phoneNumber;
  const pb = new PocketBase(`https://server.moksa.ai`);

  import { goto } from "$app/navigation";

  async function updatePassword() {
    try {
      // const update = await pb.collection('users').update(user.id, {
      //   oldPassword: oldPassword,
      //   password: password,
      //   passwordConfirm: confirmPassword,
      // });
      const update = await fetch("/api/user/passwordReset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          password: password,
          passwordConfirm: confirmPassword,
        }),
      });
      console.log(update);
      if (update.ok) {
        toast.success("Password updated successfully");
      } else {
        toast.error("Failed to update password");
        toast.error(update.message);
      }
      pb.authStore.clear();
      window.location.reload();
      goto("/login?message=Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error) {
        // Handle specific PocketBase errors
        if (error.data.code === 400) {
          toast.error(
            "Invalid old password or password confirmation does not match.",
          );
        } else {
          toast.error(
            "An error occurred while updating the password. Please try again.",
          );
        }
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    }
  }

  async function saveProfilePicture() {
    if (profilePicture && profilePicture[0]) {
      const file = profilePicture[0];
      const reader = new FileReader();
      const updateData = new FormData();
      updateData.append("avatar", file);
      const picUpdate = await pb
        .collection("users")
        .update(user.id, updateData);
      console.log(picUpdate);
      profilePicture = null;
      profilePictureUrl = null;
      window.location.reload();
    }
  }

  function getProfilePicture(collectionId, recordId, fileName, size = "0x0") {
    return `https://server.moksa.ai/api/files/${collectionId}/${recordId}/${fileName}?thumb=${size}`;
  }
</script>

<div class="p-4 max-w-7xl mx-auto overflow-auto h-full">
  <div class="grid grid-cols-3 gap-4">
    <!-- Left Profile Card -->
    <div
      class="bg-white border h-[400px] border-gray-200 rounded-xl p-4 flex flex-col items-center col-span-1"
    >
      <h1
        class="uppercase text-sm mb-5 text-gray-00 tracking-wider leading-tight"
      >
        Profile
      </h1>
      <div class="relative">
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img
          src={profilePictureUrl ||
            (user.avatar && getProfilePicture("users", user.id, user.avatar)) ||
            "https://via.placeholder.com/150"}
          alt="Profile Picture"
          class="rounded-full size-[215px] object-contain ring-2 ring-gray-300"
        />
        {#if profilePictureUrl === null}
          <button
            on:click={() => document.getElementById("fileInput").click()}
            class="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.605957"
                y="0.0761719"
                width="71.2121"
                height="71.2121"
                rx="35.6061"
                fill="black"
              />
              <g clip-path="url(#clip0_378_7293)">
                <path
                  d="M14.8481 27.1363C14.8481 24.7863 16.7709 22.8635 19.1209 22.8635H25.53L29.8027 18.5908H42.6209L46.8936 22.8635H53.3027C54.4359 22.8635 55.5227 23.3137 56.324 24.115C57.1253 24.9163 57.5754 26.0031 57.5754 27.1363V48.4999C57.5754 49.6331 57.1253 50.7199 56.324 51.5212C55.5227 52.3225 54.4359 52.7726 53.3027 52.7726H19.1209C17.9877 52.7726 16.9009 52.3225 16.0996 51.5212C15.2983 50.7199 14.8481 49.6331 14.8481 48.4999V27.1363ZM36.2118 48.4999C39.0448 48.4999 41.7617 47.3745 43.765 45.3713C45.7682 43.368 46.8936 40.6511 46.8936 37.8181C46.8936 34.9851 45.7682 32.2681 43.765 30.2649C41.7617 28.2617 39.0448 27.1363 36.2118 27.1363C33.3788 27.1363 30.6618 28.2617 28.6586 30.2649C26.6554 32.2681 25.53 34.9851 25.53 37.8181C25.53 40.6511 26.6554 43.368 28.6586 45.3713C30.6618 47.3745 33.3788 48.4999 36.2118 48.4999ZM36.2118 44.2272C35.3701 44.2272 34.5367 44.0614 33.7591 43.7393C32.9815 43.4172 32.275 42.9451 31.6799 42.35C31.0847 41.7549 30.6126 41.0483 30.2906 40.2707C29.9685 39.4932 29.8027 38.6597 29.8027 37.8181C29.8027 36.9764 29.9685 36.143 30.2906 35.3654C30.6126 34.5879 31.0847 33.8813 31.6799 33.2862C32.275 32.691 32.9815 32.219 33.7591 31.8969C34.5367 31.5748 35.3701 31.409 36.2118 31.409C37.9116 31.409 39.5418 32.0842 40.7437 33.2862C41.9456 34.4881 42.6209 36.1183 42.6209 37.8181C42.6209 39.5179 41.9456 41.1481 40.7437 42.35C39.5418 43.5519 37.9116 44.2272 36.2118 44.2272Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_378_7293">
                  <rect
                    width="42.7273"
                    height="42.7273"
                    fill="white"
                    transform="translate(14.8481 14.3174)"
                  />
                </clipPath>
              </defs>
            </svg>
          </button>
        {:else}
          <button
            class="absolute bottom-0 right-0 bg-green-400 text-white p-2 rounded-full"
            on:click={saveProfilePicture}
          >
            <Check size={30} />
          </button>
          <button
            class="absolute bottom-0 left-0 bg-red-400 text-white p-2 rounded-full"
            on:click={() => {
              profilePicture = null;
              profilePictureUrl = null;
            }}
          >
            <X size={30} />
          </button>
        {/if}
      </div>
      <div class="text-center mt-4">
        <span class="bg-blue-500 text-white text-sm px-3 py-1 rounded-full"
          >{profile.role}</span
        >
        <h2 class="mt-4 text-xl font-semibold">{profile.name}</h2>
        <p class="text-gray-500">{profile?.email}</p>
      </div>
    </div>

    <!-- Right user Settings -->
    <div
      class="bg-white h-[400px] border border-gray-200 rounded-xl p-2 col-span-2"
    >
      <div class="flex justify-between">
        <h3 class="text-lg font-semibold">user Settings</h3>
        <span class="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg"
          >User ID: {profile.userId}</span
        >
      </div>
      <form class="space-y-4">
        <!-- user Email -->
        <div class="flex flex-col items-start gap-2 w-full">
          <label for="accountEmail" class="w-1/3">user email</label>
          <div class="flex gap-6">
            <input
              id="accountEmail"
              type="email"
              value={accountEmail}
              disabled
              class="border border-gray-300 min-w-[350px] p-2 rounded-md"
            />
            <!-- <button class="text-blue-500" on:click={() => document.getElementById('fileInput').click()}>
              edit user image
            </button> -->
            <input
              type="file"
              id="fileInput"
              style="display: none;"
              accept="image/*"
              bind:files={profilePicture}
            />
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col items-start gap-2 w-full">
          <label for="password" class="w-1/3">Password</label>
          <div class="flex gap-6 items-center">
            <input
              id="password"
              type="password"
              class="border border-gray-300 min-w-[350px] p-2 rounded-md"
              bind:value={password}
            />
            {#if password === confirmPassword && password.length > 8 && oldPassword.length > 8}
              <button
                on:click={updatePassword}
                class="text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >Change password</button
              >
            {/if}
          </div>
        </div>

        <div class="flex items-center">
          <!-- Confirm Password -->
          <div class="flex flex-col items-start gap-2 w-full">
            <label for="confirmPassword" class="w-1/3">Confirm password</label>
            <div class="flex gap-6 items-center">
              <input
                id="confirmPassword"
                type="password"
                class="border border-gray-300 min-w-[350px] p-2 rounded-md"
                bind:value={confirmPassword}
              />
              <!-- {#if password === confirmPassword && password.length > 8}
            <span class="text-sm flex items-center gap-2">
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.25098 6.36861L5.68703 10.8047L14.5592 1.29883"
                  stroke="#248303"
                  stroke-width="1.90117"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              Confirm password
            </span>
            {/if} -->
            </div>
          </div>

          <div class="flex flex-col items-start gap-2 w-full">
            <label for="confirmPassword" class="w-1/3">Old password</label>
            <div class="flex gap-6 items-center">
              <input
                id="oldPassword"
                type="password"
                class="border border-gray-300 min-w-[350px] p-2 rounded-md"
                bind:value={oldPassword}
              />
            </div>
          </div>
        </div>

        <!-- Phone Number -->
        <div class="flex flex-col items-start gap-2 w-full">
          <label for="phone" class="w-1/3">Phone number</label>
          <div class="flex gap-6 items-center">
            <input
              id="phone"
              type="text"
              value={phoneNumber || ""}
              class="border border-gray-300 min-w-[350px] p-2 rounded-md"
            />
            <!-- <button class="text-blue-500"> edit svg </button> -->
          </div>
        </div>
      </form>
    </div>

    <!-- Developer Support Section -->
    <div
      class="bg-white h-[250px] border border-gray-200 rounded-xl p-8 col-span-3"
    >
      <div class="grid grid-cols-4">
        <!-- Help Section -->
        <div class="col-span-1 text-center pt-5 ml-8">
          <div class="flex justify-center"><MessageCircleMore size={32} /></div>
          <h3 class="text-lg font-semibold mt-4">Need help?</h3>
          <p class="text-gray-500">
            Have questions or concerns regarding your "user settings"? Our
            developers are here to help!
          </p>
        </div>

        <!-- Developer Support Form -->
        <div class="col-span-3 ml-16">
          <h1 class="font-semibold text-lg">Developer Support</h1>
          <form class="space-y-4 flex h-full items-end gap-5">
            <textarea
              placeholder="Send your queries to us..."
              class="w-[596px] h-[150px] border border-gray-300 p-4 rounded-md"
            ></textarea>
            <button
              type="submit"
              class="bg-blue-500 text-white py-2 px-4 rounded-md w-[140px]"
              >Submit</button
            >
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
