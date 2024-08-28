<script lang="ts">
  import EE from "./../../../components/analytics/EE.svelte";
  import {
    Users,
    ShieldCheck,
    AreaChart,
    Cog,
    Handshake,
    Store,
    LayoutDashboard,
    Search,
  } from "lucide-svelte";
  import Stores from "@/components/analytics/Stores.svelte";
  import Dashboard from "@/components/analytics/Dashboard.svelte";
  import Theft from "@/components/analytics/Theft.svelte";
  import PeopleCounter from "@/components/analytics/PeopleCounter.svelte";
  import Safety from "@/components/analytics/Safety.svelte";
  import { selectedNode } from "@/lib/stores";
  import HeatMap from "@/components/analytics/HeatMap.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import PocketBase from "pocketbase";
  import type { PageServerData } from "./$types";
    import { writable } from "svelte/store";
  let view: number = 1;
  export let data: PageServerData;
  let allStores: any[] = data?.stores?.data?.data;
  let allStoresData: any[] = data?.allstoreData?.data;
  let aisleData: any[] = data?.aisleData?.data?.data;
  let theftandcamera: any[] = data?.theftandcamera?.data?.data;
  let busyness: any[] = data?.busyness.data;
  let efficiency: any[] = data?.efficiency.data;
  let safetyDetails: any[] = data?.safetyDetails.data;
  let theftData: any[] = data?.theftData;
  let usersData: any[] = data?.usersData;
  // let unreadNotifications: any[] = data?.unreadNotifications;
  let aisleStoreData = writable([]);

  // console.log(usersData)
  // console.log(data)

  const session = data.session;
  let nodes: Node[] = [];
  console.log(data)
  // $:console.log(nodes)
  const PB = new PocketBase(`http://${$page.url.hostname}:5555`);
// console.log(aisleData)
onMount(async () => {
   PB.autoCancellation(false);
    nodes = await getNodes();
   const s = nodes.find((n) => n.id === session.activeNode);
          if(s) {
        selectedNode.set(s)
      } else {
        selectedNode.set(nodes[0])
      }
  const asd = await getAisleData()
  aisleStoreData.set(asd)
})

 async function getNodes(): Promise<Node[]> {
  
    if (session.node.length > 0) {
      const nodes = await PB.collection("node").getFullList(200, {
        sort: "created",
        expand: "camera",
        filter: `session~"${session.id}"`,
      });
      return nodes.map(
        (node) =>
          ({
            ...node,
            session: session.id,
            camera:
              node?.camera?.length > 0
                ? (node?.expand?.camera?.reverse().map((cam: Camera) => ({
                    name: cam.name,
                    id: cam.id,
                    url: cam.url,
                  })) as Camera[])
                : [],
          }) as unknown as Node,
      );
    }
    return [];
  }

async function getAisleData(){
    const response = await fetch(`/api/aisle/getByStoreId`,{
      method: 'POST',
      body: JSON.stringify({
        storeId: allStores,
      })
    })
    const data = await response.json()
    return data
}
</script>

<main class="flex flex-row-reverse h-[calc(100vh-75px)] w-full">
  <div
    class=" flex flex-col gap-5 items-center justify-center px-2 bg-gradient-to-b from-[#000610] via-[#000307] via-[#050E41] to-[#000307] h-[calc(100vh-75px)]"
  >
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        class={`disabled:cursor-not-allowed  h-[40px] w-[40px] rounded-full shadow-md group border-2 border-solid border-white bg-transparent text-white group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center`}
        ><Search class="h-[22px] w-[22px]" /></button
      >
      <p
        class="text-xs group-hover:text-[#07E1A4] dark:group-hover:text-[#07E1A4] text-white pointer-events-none"
      >
        Search
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 1)}
        class={view !== 1
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><LayoutDashboard class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`pointer-events-none text-center text-xs ${view !== 1 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Dashboard
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 2)}
        class={view !== 2
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><Store class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-center pointer-events-none text-xs ${view !== 2 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Stores
      </p>
    </span>

    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 3)}
        class={view !== 3
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.2503 9.71873L17.5622 10.441C17.604 10.5392 17.6935 10.6045 17.8085 10.627C17.9244 10.648 18.0352 10.6195 18.1188 10.546L18.9301 9.83196C19.0128 9.75921 19.046 9.66096 19.0222 9.55896C18.9983 9.45696 18.9216 9.38046 18.8108 9.34221L18.0583 9.09096L17.2503 9.71873ZM16.1159 12.712C16.5242 12.904 16.808 13.2805 16.8122 13.7163L16.8753 17.9769C16.8838 18.6122 16.306 19.1327 15.5858 19.1402C14.8639 19.1477 14.2724 18.6392 14.2639 18.0054L14.2111 14.4302L11.3747 13.1109L10.9997 12.9362C10.9827 13.0224 10.9648 13.1087 10.9477 13.1934L10.4023 15.9047H10.398C10.3349 16.2257 10.1167 16.5212 9.77157 16.6974L5.34139 18.9826C4.71922 19.3036 3.91896 19.1206 3.55418 18.5716C3.1894 18.0241 3.39736 17.3199 4.02122 16.9989L7.92711 14.9852L8.57485 11.7692C8.54843 11.6792 8.52882 11.5869 8.51774 11.4924C8.40439 10.5804 8.37371 9.78916 8.45042 9.07149C8.95241 7.96973 9.57883 6.83872 11.2451 6.57779C12.0326 6.50129 12.8158 6.68879 13.5053 7.01204C13.5121 7.01579 13.5206 7.01954 13.5274 7.02179C13.8223 7.15979 14.0967 7.32328 14.3481 7.49954C14.3916 7.53029 14.4351 7.56104 14.4768 7.59329L14.9413 8.69953L15.3257 8.40028L15.4322 8.31778L15.572 8.21053L15.8183 8.01853L16.5598 7.44253C16.5862 7.42303 16.6118 7.40428 16.6407 7.38703C16.7328 7.32929 16.8351 7.29103 16.9399 7.27003C17.0575 7.24528 17.1802 7.24303 17.2978 7.26253C17.4811 7.29328 17.6558 7.37578 17.7887 7.50852C18.1075 7.82502 18.0743 8.30953 17.7146 8.58927L16.4277 9.58752L15.1859 10.5513C15.099 10.63 14.9899 10.693 14.8629 10.7335C14.4112 10.8798 13.9092 10.6758 13.7439 10.2768L13.0459 8.61176C13.0152 8.66201 12.9871 8.71376 12.9632 8.76551C12.7297 9.274 12.7169 10.006 12.8515 11.0829C12.8558 11.1212 12.8601 11.1579 12.8626 11.1939L16.1159 12.712ZM11.2068 10.4289C11.1804 10.4177 11.1565 10.4057 11.1301 10.3959L11.2068 10.4289ZM9.14688 6.89038C9.62671 6.46813 10.2574 6.14563 11.1386 6.00913L11.1582 6.00688C12.0966 5.91314 13.0153 6.12764 13.814 6.50188C14.1932 6.68038 14.5495 6.89339 14.8657 7.12813C15.06 7.27213 15.2389 7.42212 15.4043 7.57512L16.1304 7.01037C16.1978 6.95637 16.2719 6.91062 16.3461 6.87012C16.0563 6.39611 15.7461 5.96037 15.4162 5.56437C14.8904 4.93286 14.3168 4.39737 13.7142 3.95188C12.1742 2.81712 10.4304 2.26212 8.73097 2.13763C7.52416 2.04913 6.33948 2.17588 5.26646 2.46612C4.19514 2.75412 3.2372 3.20336 2.47788 3.75988C1.12192 4.75737 0.412832 6.09767 0.879872 7.45895C1.12873 8.18494 2.04066 9.20795 3.147 9.9609C3.74019 10.3659 4.38621 10.6884 5.0041 10.8347C5.58193 10.9727 6.13677 10.9554 6.59445 10.7004C6.92172 10.5182 7.21149 10.2069 7.44075 9.73816C7.53876 9.53865 7.62655 9.34066 7.71603 9.13891C8.06717 8.3514 8.44205 7.51063 9.14688 6.89038ZM14.1284 3.50561C14.1114 3.39611 14.1003 3.28512 14.1003 3.17185C14.1003 1.91635 15.2568 0.900879 16.6809 0.900879C18.1077 0.900879 19.2616 1.91863 19.2616 3.17185C19.2616 4.42736 18.1051 5.44283 16.6809 5.44283C16.4696 5.44283 16.2667 5.41958 16.0699 5.37983C15.4767 4.63808 14.8221 4.01635 14.1284 3.50561Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <p
        class={`text-center pointer-events-none text-xs ${view !== 3 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Theft
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 4)}
        class={view !== 4
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.2398 10.7935C13.6183 10.7935 15.5464 8.86535 15.5464 6.48684C15.5464 4.10834 13.6183 2.18018 11.2398 2.18018C8.86127 2.18018 6.93311 4.10834 6.93311 6.48684C6.93311 8.86535 8.86127 10.7935 11.2398 10.7935Z"
            fill="currentColor"
          />
          <path
            d="M14 18.6665H18.6667V19.5998H14V18.6665Z"
            fill="currentColor"
          />
          <path
            d="M10.0001 20.0002V22.0002C10.0001 22.177 10.0703 22.3465 10.1954 22.4716C10.3204 22.5966 10.49 22.6668 10.6668 22.6668H22.0001C22.1769 22.6668 22.3465 22.5966 22.4715 22.4716C22.5965 22.3465 22.6668 22.177 22.6668 22.0002V15.3335C22.6668 15.1567 22.5965 14.9871 22.4715 14.8621C22.3465 14.7371 22.1769 14.6668 22.0001 14.6668H17.3334V13.6868C17.3334 13.51 17.2632 13.3404 17.1382 13.2154C17.0131 13.0904 16.8436 13.0202 16.6668 13.0202C16.49 13.0202 16.3204 13.0904 16.1954 13.2154C16.0703 13.3404 16.0001 13.51 16.0001 13.6868V14.6668H14.6668V12.2802C13.5339 12.0948 12.388 12.0011 11.2401 12.0002C8.70864 11.9894 6.20553 12.5332 3.90677 13.5935C3.52843 13.772 3.20924 14.0554 2.98709 14.4099C2.76493 14.7644 2.64914 15.1752 2.65344 15.5935V20.0002H10.0001ZM21.3334 21.3335H11.3334V16.0002H16.0001V16.2802C16.0001 16.457 16.0703 16.6265 16.1954 16.7516C16.3204 16.8766 16.49 16.9468 16.6668 16.9468C16.8436 16.9468 17.0131 16.8766 17.1382 16.7516C17.2632 16.6265 17.3334 16.457 17.3334 16.2802V16.0002H21.3334V21.3335Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <p
        class={`text-center pointer-events-none text-xs ${view !== 4 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Employee <br /> Efficiency
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 5)}
        class={view !== 5
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><Users class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-center pointer-events-none text-xs ${view !== 5 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        People <br /> Counter
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 6)}
        class={view !== 6
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><AreaChart class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-center pointer-events-none text-xs ${view !== 6 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Heat Map
      </p>
    </span>
    <span class="group flex-col flex items-center justify-center gap-0.5">
      <button
        on:click={() => (view = 7)}
        class={view !== 7
          ? ` disabled:cursor-not-allowed text-white h-[40px] w-[40px] rounded-full shadow-md  border-2 border-solid  dark:border-white bg-transparent group-hover:text-black group-hover:bg-gradient-to-r group-hover:from-[#EBE60B] group-hover:to-[#07E1A4] group-hover:border-none grid place-items-center `
          : `disabled:cursor-not-allowed relative border-none rounded-full shadow-md h-[40px] w-[40px] text-black bg-gradient-to-r from-[#EBE60B] to-[#07E1A4] grid place-items-center `}
        ><ShieldCheck class="h-[22px] w-[22px]" /></button
      >
      <p
        class={`text-center pointer-events-none text-xs ${view !== 7 ? "group-hover:text-[#07E1A4] text-white dark:group-hover:text-[#07E1A4]" : " text-[#07E1A4]"}`}
      >
        Safety
      </p>
    </span>
  </div>

  {#if view === 1}
    <Dashboard {allStores} {allStoresData} {aisleData} {theftandcamera} {busyness} {efficiency} {safetyDetails} {theftData} token={data.moksaToken}/>
  {:else if view === 2}
    <Stores {allStores} {theftandcamera} {nodes}/>
  {:else if view === 3}
    <Theft {theftandcamera} {allStores} {theftData} token={data.moksaToken}/>
  {:else if view === 4}
    <EE {allStores}/>
  {:else if view === 5}
    <PeopleCounter {allStores} token={data.moksaToken} {usersData} curruser={data.user}/>
  {:else if view === 6}
    <HeatMap {aisleStoreData} {allStores} token={data.moksaToken}/>
  {:else if view === 7}
    <Safety {allStores} token={data.moksaToken}/>
  {/if}
</main>
