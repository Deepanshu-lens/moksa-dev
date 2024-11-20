<!-- <script lang="ts">
	import { selectedNode } from '@/lib/stores';
  import { onMount } from "svelte";
  let leafletInstance: any;
  let map: any;


  export let NvrData;


  if($selectedNode) {
    console.log('nvrdata',NvrData)
  }


  let data = NvrData.map((record) => ({
    as: record.expand.ip_address?.as,
    country: record.expand.ip_address?.country,
    ipaddress: record.expand.ip_address?.ipaddress,
    isp: record.expand.ip_address?.isp,
    latitude: parseFloat(record.expand.ip_address?.latitude),
    longitude: parseFloat(record.expand.ip_address?.longitude),
    location: record.expand.ip_address?.location,
    region: record.expand.ip_address?.region,
    zip: record.expand.ip_address?.zip,
    status: record?.status?.status,
    userid: record.user_id,
    password: record.password,
  }));


  onMount(() => {
    leafletInstance = window.L;

    const validLatitudes = data.filter(item => item.latitude !== undefined && !isNaN(item.latitude));
    const averageLatitude = validLatitudes.reduce((acc, item) => acc + item.latitude, 0) / validLatitudes.length;

    const validLongitudes = data.filter(item => item.longitude !== undefined && !isNaN(item.longitude));
    const averageLongitude = validLongitudes.reduce((acc, item) => acc + item.longitude, 0) / validLongitudes.length;

    map = leafletInstance.map("map", {
      center: [averageLatitude, averageLongitude],
      zoom: 3,
    });

    leafletInstance.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { minZoom: 0,
          maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

    data.forEach((item) => {
      if (item.latitude !== undefined && !isNaN(item.latitude) && item.longitude !== undefined && !isNaN(item.longitude) && item.country === 'India') {
        const customIcon = leafletInstance.icon({
          iconUrl:
            item.status ? "/svg/mapicon3.svg" : "/svg/mapicon1.svg",
          iconSize: [32, 32],
        });
        const marker = leafletInstance
          .marker([item.latitude, item.longitude], {
            title: item.location,
            icon: customIcon,
          })
          .addTo(map);

        marker.bindPopup(
          `<b>${item.location}</b><br>ISP: ${item.isp}<br>IP: ${item.ipaddress}`,
        );
      }
    });
  });
</script>

<div class="flex flex-col gap-2 py-4 h-full">
  <div id="map" class="h-full w-full z-50 rounded-lg text-black"></div>
</div> -->


<script lang="ts">
  import { selectedNode } from '@/stores';
  import { onMount } from "svelte";
  import { writable, derived } from 'svelte/store';

  export let NvrData;
  let leafletInstance: any;
  let map: any;

  // Reactive statement to handle changes in NvrData or selectedNode
  $: if (NvrData && map) {
    updateMap();
  }

  function updateMap() {
    const data = NvrData.map((record) => ({
      as: record.expand.ip_address?.as,
      country: record.expand.ip_address?.country,
      ipaddress: record.expand.ip_address?.ipaddress,
      isp: record.expand.ip_address?.isp,
      latitude: parseFloat(record.expand.ip_address?.latitude),
      longitude: parseFloat(record.expand.ip_address?.longitude),
      location: record.expand.ip_address?.location,
      region: record.expand.ip_address?.region,
      zip: record.expand.ip_address?.zip,
      status: record?.status?.status,
      userid: record.user_id,
      password: record.password,
    }));

    const validLatitudes = data.filter(item => item.latitude !== undefined && !isNaN(item.latitude));
    const averageLatitude = validLatitudes.reduce((acc, item) => acc + item.latitude, 0) / validLatitudes.length;

    const validLongitudes = data.filter(item => item.longitude !== undefined && !isNaN(item.longitude));
    const averageLongitude = validLongitudes.reduce((acc, item) => acc + item.longitude, 0) / validLongitudes.length;

    // Update map center
    map.setView([averageLatitude, averageLongitude], map.getZoom());

    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    data.forEach((item) => {
      if (item.latitude !== undefined && !isNaN(item.latitude) && item.longitude !== undefined && !isNaN(item.longitude) && item.country === 'India') {
        const customIcon = leafletInstance.icon({
          iconUrl: item.status ? "/svg/mapicon3.svg" : "/svg/mapicon1.svg",
          iconSize: [32, 32],
        });
        const marker = leafletInstance
          .marker([item.latitude, item.longitude], {
            title: item.location,
            icon: customIcon,
          })
          .addTo(map);

        marker.bindPopup(
          `<b>${item.location}</b><br>ISP: ${item.isp}<br>IP: ${item.ipaddress}`,
        );
      }
    });
  }

  onMount(() => {
    leafletInstance = window.L;
    map = leafletInstance.map("map", {
      center: [20.5937, 78.9628], // Default center
      zoom: 3,
    });

    leafletInstance.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  });
</script>

<div class="flex flex-col gap-2 py-4 h-full">
  <div id="map" class="h-full w-full z-50 rounded-lg text-black"></div>
</div>