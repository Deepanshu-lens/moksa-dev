<script>
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  let step = 1; // Track the current step
  let email = "";
  let token = "";
  let otpInputs = [];
  let newPassword = "";

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message) {
      toast.error(`${message} Please try again.`);
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.pushState({ path: newUrl }, "", newUrl);
      }, 2000);
    }
  });

  async function sendOtp() {
    // Send OTP to the provided email
    const response = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/sendOtp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );
    const data = await response.json();
    if (data?.status === 200) {
      toast.success(data?.message);
      step = 2; // Move to the OTP input step
    } else {
      toast.error(data?.message || "Failed to send OTP");
    }
  }

  async function verifyOtp() {
    // Gather all OTP digits into a single string
    const otp = otpInputs.map((input) => input.value).join("");

    // Verify the OTP and get the token
    const response = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/getTokenForOtp?otp=${otp}&email=${email}
  `,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (data?.status === 200) {
      token = data.token; // Store the token for the next step
      step = 3; // Move to the final step
      toast.success("OTP verified successfully!"); // Success message
    } else {
      toast.error(data?.message || "Invalid OTP. Please try again."); // Error message for incorrect OTP
    }
  }

  async function resetPassword() {
    // Send the token to reset the password
    const response = await fetch(
      `${import.meta.env.PUBLIC_MOKSA_BASE_URL}/auth/resetPasswordWithOtp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email, newPassword }),
      }
    );
    const data = await response.json();
    if (data?.status === 200) {
      toast.success("Password reset successfully");
      window.location.href = "/login";
    } else {
      toast.error(data?.message || "Failed to reset password");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      sendOtp();
    } else if (step === 2) {
      verifyOtp();
    } else {
      resetPassword();
    }
  };

  function handleOtpInput(event, index) {
    const value = event.target.value;

    // Move to the next input if a digit is entered
    if (value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }

    // If the last input is filled, gather all OTP digits
    if (index === otpInputs.length - 1 && value) {
      const otp = otpInputs.map((input) => input.value).join("");
    }
  }
</script>

<div
  class="flex justify-center items-center w-full relative flex-col sm:flex-row overflow-hidden"
>
  <form on:submit={handleSubmit} class="bg-background relative sm:rounded-none">
    <div
      class="form-cont flex flex-col l items-center justify-center gap-4 mx-auto scale-[.85] sm:scale-100 xl:scale-100 2xl:scale-125 lg:scale-90 md:scale-75"
    >
      <div
        class="flex items-center justify-center sm:justify-start sm:self-start gap-4 -ml-4"
      >
        <img
          src={"/images/moksa.png"}
          alt="logo"
          height={80}
          width={140}
          class="hidden dark:block"
        />
        <img
          src={"/images/moksa-black.png"}
          alt="logo"
          height={80}
          width={140}
          class="block dark:hidden"
        />
      </div>
      <h2 class="font-semibold text-2xl sm:self-start text-[#212B36] font-mono">
        {step === 1
          ? "Forgot Password"
          : step === 2
            ? "Enter OTP"
            : "Reset Password"}
      </h2>
      <p class="text-[#919EAB] text-sm sm:self-start">
        {step === 1
          ? "Provide Registered Email id"
          : step === 2
            ? "Enter the OTP sent to your email"
            : "Enter your new password"}
      </p>

      <div class="mb-4 relative w-[350px] max-h-[40px]">
        {#if step === 1}
          <img
            alt="mail-line"
            src={"/images/mail-line.svg"}
            height={30}
            width={30}
            class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 block dark:hidden"
          />
          <img
            alt="mail-line"
            src={"/images/mail-line2.svg"}
            height={30}
            width={30}
            class="h-[20px] w-[20px] aspect-square absolute top-1/2 left-2 -translate-y-1/2 dark:block hidden"
          />
        {/if}
        {#if step === 1}
          <input
            class="appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-3 font-semibold text-[#637381] leading-tight focus:outline-none focus:shadow-outline"
            autoComplete="off"
            id="email"
            type="email"
            placeholder="email"
            bind:value={email}
            required
          />
        {:else if step === 2}
          <div class="flex gap-2">
            {#each Array(6) as _, index}
              <input
                type="text"
                maxlength="1"
                class="shadow-xs flex w-[40px] items-center justify-center rounded-lg border border-stroke bg-white p-2 text-center text-2xl font-medium text-gray-5 outline-none sm:text-4xl dark:border-dark-3 dark:bg-white/5"
                on:input={(e) => handleOtpInput(e, index)}
                bind:this={otpInputs[index]}
              />
            {/each}
          </div>
        {:else if step === 3}
          <div class="mb-4 relative w-[350px] max-h-[40px]">
            <img
              alt="mail-line"
              src={"/images/password-outline1.svg"}
              height={30}
              width={30}
              class="h-[20px] w-[20px] aspect-square absolute top-2/3 left-2 -translate-y-1/2 dark:block hidden"
            />
            <img
              alt="mail-line"
              src={"/images/password-outline2.svg"}
              height={30}
              width={30}
              class="h-[20px] w-[20px] aspect-square absolute top-2/3 left-2 -translate-y-1/2 block dark:hidden"
            />

            <input
              class={`appearance-none bg-transparent border-b border-b-[#919EAB] dark:border-b-[#919eab]/[.3] rounded w-full h-full py-4 pl-10 pr-10 font-semibold text-[#637381] leading-tight focus:outline-none focus:shadow-outline`}
              autoComplete="off"
              id="password"
              placeholder="Password"
              name="password"
              bind:value={newPassword}
            />
          </div>
        {/if}
      </div>
      <div
        class="flex flex-col items-center justify-between mt-2 mb-10 sm:mb-0"
      >
        <button
          class="bg-[#015A62] hover:bg-[#015A62]/[.4] text-white font-bold py-2 px-4 rounded-md w-full focus:outline-none focus:shadow-outline"
          type="submit"
        >
          {step === 1
            ? "Send OTP"
            : step === 2
              ? "Verify OTP"
              : "Reset Password"}
        </button>
      </div>
    </div>
  </form>
</div>

<!-- {#each Object.keys(providers) as provider}
      {#if providers[provider].authProviderState}
        <button on:click={() => gotoAuthProvider(provider)}
          >Login with {provider}</button
        >
      {/if}
    {/each} -->
