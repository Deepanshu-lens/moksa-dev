<script lang="ts">
  import Separator from "@/components/ui/separator/separator.svelte";
  import * as Accordion from "@/components/ui/accordion/index";
  import {
    ChevronRight,
    Expand,
    Filter,
    Gift,
    ListFilter,
    Search,
    Ticket,
  } from "lucide-svelte";
  import TicketList from "@/components/lists/ticketList.svelte";
  import type { ITickets } from "@/types.d.ts";
  import Input from "@/components/ui/input/input.svelte";
  import Button from "@/components/ui/button/button.svelte";
  // import RaiseTicketDialog from "@/components/dialogs/RaiseTicketDialog.svelte";
  import TicketDialog from "@/components/dialogs/TicketDialog.svelte";
  import * as Dialog from "@/components/ui/dialog";
  import Label from "@/components/ui/label/label.svelte";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { tickets } from "@/lib/stores.js";
  let showRightPanel: boolean = true;
  let requestDialogOpen = false;
  let dummyTickets: ITickets[] = [
    {
      id: "1",
      name: "Ticket 01",
      severity: "Critical",
      createdAt: "5 Apr, 2024: 12:00 PM IST",
      createdBy: "John Doe",
      location: "Gurugram",
      assignedTo: "Jane Doe",
      status: "Resolved",
      resolvedAt: "6 Apr, 2024: 12:00 PM IST",
      resolvedBy: "Self",
      comments: "Temporary spike in usage due to updates",
    },
    {
      id: "2",
      name: "Ticket 02",
      severity: "Critical",
      createdAt: "5 Apr, 2024: 12:00 PM IST",
      createdBy: "John Doe",
      location: "Gurugram",
      assignedTo: "Jane Doe",
      status: "Resolved",
      resolvedAt: "6 Apr, 2024: 12:00 PM IST",
      resolvedBy: "Self",
      comments: "Temporary spike in usage due to updates",
    },
    {
      id: "3",
      name: "Ticket 03",
      severity: "Critical",
      createdAt: "5 Apr, 2024: 12:00 PM IST",
      createdBy: "John Doe",
      location: "Gurugram",
      assignedTo: "Jane Doe",
      status: "Resolved",
      resolvedAt: "6 Apr, 2024: 12:00 PM IST",
      resolvedBy: "Self",
      comments: "Temporary spike in usage due to updates",
    },
  ];

  export let data;

  // const { tickets } = data;
  const { nodes } = data;
  const { token } = data;

  const handleSubmitRequestFeature = async (event: any) => {
    event.preventDefault(); // Prevent the default form submission

    // Create a FormData object from the form
    const formData = new FormData(event.target);

    // Get the values from the form
    const title = formData.get("title");
    const message = formData.get("message");

    // You can also perform your async operation here
    // Make the API call
    try {
      const response = await fetch(
        "https://api.moksa.ai/requestfeature/create",
        {
          method: "POST",
          body: JSON.stringify({ title, message }),
          headers: {
            // Correctly place headers here
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response?.json();
      if (data?.status === 201) {
        toast.success("feature requested successfully");
        requestDialogOpen = false;
      }
    } catch (error) {
      toast.error(
        error?.message || "Something went wrong while requesting feature",
      );
      console.log(error, "error");
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        `https://api.moksa.ai/customerComplaints/getAllComplaints/1/10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      tickets.set(data?.data?.data || []);
    } catch (error) {
      console.log(error?.message, "error while fetching complaints");
    }
  };

  onMount(() => {
    // getting complaints
    fetchComplaints();
  });
</script>

<section class="flex flex-1 w-full h-screen justify-between relative">
  <!-- left section -->
  <div class="h-full w-full">
    <!-- replace the bg here-->
    <div
      class="flex justify-between items-center h-[50%] bg-[url('/images/Background.png')] bg-cover relative"
    >
      <!-- searchbar -->
      <div
        class="flex flex-col items-center justify-center w-full gap-6 relative"
      >
        <h1 class="text-3xl font-semibold">How can we help you?</h1>
        <div class="relative w-[45%]">
          <Input
            placeholder="Have a question? Ask or enter a search term here ..."
            class="w-full rounded-full py-6 pr-10"
          />
          <Button
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 rounded-full p-2.5"
          >
            <Search size={18} />
          </Button>
        </div>
      </div>
      <!-- Overlapping boxes -->
      <div
        class="absolute bottom-0 h-auto w-full flex flex-wrap justify-around transform translate-y-48"
      >
        <div class="bg-white drop-shadow-lg rounded-lg w-1/4 p-10">
          <TicketDialog {nodes} {token}>
            <div class="flex flex-col items-center gap-2 justify-center">
              <Ticket size={45} class="text-blue-500" />
              <h1 class="text-xl font-semibold">Raise ticket?</h1>
              <p class="text-center text-sm text-gray-500 font-medium">
                Raise a ticket, and we'll reply ASAP or come back later.
              </p>
            </div>
          </TicketDialog>
        </div>
        <div class="bg-white shadow-md rounded-lg w-1/4 p-10">
          <div class="flex flex-col items-center gap-2">
            <Gift size={45} class="text-blue-500" />
            <h1 class="text-xl font-semibold">Feature</h1>
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <p class="text-center text-sm text-gray-500 font-medium">
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              If you want to request any additional feature
              <span
                on:click={() => {
                  requestDialogOpen = true;
                }}
                class="text-blue-500 cursor-pointer hover:underline hover:underline-offset-2"
                >click here</span
              >
            </p>
          </div>
        </div>
        <div class="w-full flex items-center justify-between mt-6">
          <div class="flex gap-3 justify-evenly items-center w-1/3 px-20">
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="46"
                height="46"
                rx="23"
                fill="url(#paint0_linear_318_3735)"
              />
              <g clip-path="url(#clip0_318_3735)">
                <path
                  d="M24.9165 35.1902C24.9165 34.6664 24.7288 34.218 24.3535 33.845C23.9781 33.472 23.5269 33.2855 22.9998 33.2855C22.4727 33.2855 22.0215 33.472 21.6462 33.845C21.2708 34.218 21.0831 34.6664 21.0831 35.1902C21.0831 35.714 21.2708 36.1624 21.6462 36.5354C22.0215 36.9084 22.4727 37.0949 22.9998 37.0949C23.5269 37.0949 23.9781 36.9084 24.3535 36.5354C24.7288 36.1624 24.9165 35.714 24.9165 35.1902ZM29.8998 31.3808V14.6196C29.8998 14.4132 29.8239 14.2347 29.6722 14.0839C29.5205 13.9331 29.3408 13.8577 29.1331 13.8577H16.8665C16.6588 13.8577 16.4791 13.9331 16.3274 14.0839C16.1757 14.2347 16.0998 14.4132 16.0998 14.6196V31.3808C16.0998 31.5872 16.1757 31.7657 16.3274 31.9165C16.4791 32.0673 16.6588 32.1427 16.8665 32.1427H29.1331C29.3408 32.1427 29.5205 32.0673 29.6722 31.9165C29.8239 31.7657 29.8998 31.5872 29.8998 31.3808ZM25.2998 11.1911C25.2998 10.9372 25.172 10.8102 24.9165 10.8102H21.0831C20.8276 10.8102 20.6998 10.9372 20.6998 11.1911C20.6998 11.4451 20.8276 11.5721 21.0831 11.5721H24.9165C25.172 11.5721 25.2998 11.4451 25.2998 11.1911ZM32.1998 10.8102V35.1902C32.1998 36.0156 31.8963 36.7298 31.2894 37.333C30.6824 37.9361 29.9637 38.2377 29.1331 38.2377H16.8665C16.0359 38.2377 15.3172 37.9361 14.7102 37.333C14.1033 36.7298 13.7998 36.0156 13.7998 35.1902V10.8102C13.7998 9.98483 14.1033 9.27057 14.7102 8.66742C15.3172 8.06427 16.0359 7.7627 16.8665 7.7627H29.1331C29.9637 7.7627 30.6824 8.06427 31.2894 8.66742C31.8963 9.27057 32.1998 9.98483 32.1998 10.8102Z"
                  fill="white"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_318_3735"
                  x1="1.41424"
                  y1="-2.43085e-06"
                  x2="41.1575"
                  y2="6.60339"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#02A7FD" />
                  <stop offset="1" stop-color="#141C64" />
                </linearGradient>
                <clipPath id="clip0_318_3735">
                  <rect
                    width="18.4"
                    height="30.475"
                    fill="white"
                    transform="translate(13.7998 7.7627)"
                  />
                </clipPath>
              </defs>
            </svg>
            <span>+1 313-749-8832</span>
          </div>
          <div class="flex gap-3 justify-evenly items-center w-1/3 px-20">
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="46"
                height="46"
                rx="23"
                fill="url(#paint0_linear_318_3740)"
              />
              <g clip-path="url(#clip0_318_3740)">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M19.4429 24.6779L23.0025 27.1118L26.4338 24.7446L34.1254 32.333C33.9224 32.3992 33.7078 32.4328 33.4814 32.4336H12.5186C12.2419 32.4336 11.9778 32.3795 11.735 32.2827L19.4429 24.6779ZM35.5781 18.4417V30.3368C35.5781 30.6475 35.5102 30.9418 35.3895 31.2072L27.8501 23.7685L35.5781 18.4417ZM10.4219 18.5084L18.0216 23.7056L10.5552 31.0739C10.4677 30.838 10.4226 30.5884 10.4219 30.3368V18.5084ZM33.4814 13.5664C34.6385 13.5664 35.5781 14.5047 35.5781 15.6632V16.4003L22.9975 25.0729L10.4219 16.472V15.6632C10.4219 14.506 11.3602 13.5664 12.5186 13.5664H33.4814Z"
                  fill="white"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_318_3740"
                  x1="-1.19094"
                  y1="2.14953"
                  x2="26.5265"
                  y2="9.36688"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#00FEA3" />
                  <stop offset="1" stop-color="#007077" />
                </linearGradient>
                <clipPath id="clip0_318_3740">
                  <rect
                    width="25.1562"
                    height="25.1562"
                    fill="white"
                    transform="translate(10.4219 10.4219)"
                  />
                </clipPath>
              </defs>
            </svg>
            <span>info@moksa.ai</span>
          </div>
          <div class="flex gap-3 justify-evenly items-center w-1/3 px-20">
            <svg
              width="46"
              height="46"
              viewBox="0 0 46 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="46"
                height="46"
                rx="23"
                fill="url(#paint0_linear_318_3745)"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12.518 23.0003C12.518 17.2112 17.2106 12.5186 22.9997 12.5186C28.7888 12.5186 33.4815 17.2112 33.4815 23.0003C33.4815 28.7894 28.7888 33.4821 22.9997 33.4821C21.1864 33.4848 19.4036 33.0152 17.827 32.1195L13.8974 33.4286C13.7127 33.4902 13.5145 33.4992 13.325 33.4545C13.1355 33.4097 12.9622 33.3131 12.8246 33.1755C12.6869 33.0378 12.5903 32.8645 12.5456 32.675C12.5009 32.4856 12.5098 32.2874 12.5714 32.1027L13.8816 28.1731C12.9855 26.5965 12.5155 24.8138 12.518 23.0003ZM18.807 17.7594C18.529 17.7594 18.2624 17.8699 18.0658 18.0664C17.8693 18.263 17.7588 18.5296 17.7588 18.8076C17.7588 19.0856 17.8693 19.3522 18.0658 19.5488C18.2624 19.7454 18.529 19.8558 18.807 19.8558H27.1924C27.4704 19.8558 27.737 19.7454 27.9336 19.5488C28.1302 19.3522 28.2406 19.0856 28.2406 18.8076C28.2406 18.5296 28.1302 18.263 27.9336 18.0664C27.737 17.8699 27.4704 17.7594 27.1924 17.7594H18.807ZM18.807 21.9521C18.529 21.9521 18.2624 22.0626 18.0658 22.2592C17.8693 22.4557 17.7588 22.7223 17.7588 23.0003C17.7588 23.2783 17.8693 23.5449 18.0658 23.7415C18.2624 23.9381 18.529 24.0485 18.807 24.0485H27.1924C27.4704 24.0485 27.737 23.9381 27.9336 23.7415C28.1302 23.5449 28.2406 23.2783 28.2406 23.0003C28.2406 22.7223 28.1302 22.4557 27.9336 22.2592C27.737 22.0626 27.4704 21.9521 27.1924 21.9521H18.807ZM18.807 26.1449C18.529 26.1449 18.2624 26.2553 18.0658 26.4519C17.8693 26.6484 17.7588 26.915 17.7588 27.193C17.7588 27.471 17.8693 27.7376 18.0658 27.9342C18.2624 28.1308 18.529 28.2412 18.807 28.2412H21.9516C22.2295 28.2412 22.4962 28.1308 22.6927 27.9342C22.8893 27.7376 22.9997 27.471 22.9997 27.193C22.9997 26.915 22.8893 26.6484 22.6927 26.4519C22.4962 26.2553 22.2295 26.1449 21.9516 26.1449H18.807Z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_318_3745"
                  x1="1.41424"
                  y1="1.16009e-05"
                  x2="48.2967"
                  y2="6.21497"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#C8C303" />
                  <stop offset="1" stop-color="#597802" />
                </linearGradient>
              </defs>
            </svg>

            <span>Chat Support (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="absolute h-34 left-0 bottom-16 w-auto px-14 py-8 flex flex-col gap-5">
    <div>
        <p class="text-md font-semibold">Log out all devices</p>
        <p class="text-sm text-gray-500">Log out all other active sessions on other devices besides this one</p>
    </div>
    <p class="text-sm text-red-500">Delete my Account</p>
  </div> -->

  <!-- right section -->
  <div
    class={`h-[calc(100vh-75px)] ${showRightPanel ? "w-1/4 max-w-80 p-3" : "w-0"} flex-shrink-0 transition-width ease-in-out duration-500 dark:border-[#292929] border-x-[1px] relative`}
  >
    <button
      on:click={() => (showRightPanel = !showRightPanel)}
      class={`absolute -left-6 py-1 rounded-l-md bg-[#f9f9f9] dark:bg-slate-800  top-1/2 -translate-y-1/2 shadow-md transition-position ease-in-out duration-500 z-[99999]`}
    >
      <ChevronRight
        class={`${showRightPanel ? "rotate-0" : "rotate-180"} transition-transform ease-in-out duration-700`}
      />
    </button>
    <!-- heading -->
    <div
      class={`${showRightPanel ? "opacity-100" : "opacity-0"} flex justify-between items-center pb-5  transtion-opacity ease-in-out duration-500 `}
    >
      <h1 class="text-2xl font-semibold">My Ticket</h1>
      <TicketDialog {nodes} {token}>
        <button
          class="p-2 grid place-items-center rounded-full text-[#3D81FC] cursor-pointer hover:underline hover:underline-offset-2"
        >
          Raise a Ticket
        </button>
      </TicketDialog>
    </div>
    <Separator class="mb-2" />

    <!-- ticket list -->
    <TicketList tickets={$tickets || []} />
  </div>
</section>

<!-- Request  -->
<Dialog.Root bind:open={requestDialogOpen}>
  <Dialog.Content class="sm:max-w-[720px]">
    <Dialog.Header>
      <Dialog.Title>Request Feature</Dialog.Title>
    </Dialog.Header>
    <div class="flex items-center w-full h-full">
      <form action="" method="post" on:submit={handleSubmitRequestFeature}>
        <div class="p-2 w-full">
          <Label>Title</Label>
          <Input
            type="text"
            placeholder="title"
            class="mb-2 w-[30rem]"
            name={"title"}
          />
        </div>
        <div class="p-2">
          <Label>Message</Label>
          <Input
            type="text"
            placeholder="message"
            class="mb-2 w-[30rem]"
            name={"message"}
          />
        </div>
        <Button type="submit" class="my-3">submit</Button>
      </form>
    </div>
  </Dialog.Content>
</Dialog.Root>
