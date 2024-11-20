<script lang="ts">
    import { onMount } from "svelte";
  // minimal configure
  import { data } from "./Data";
  import Icon from "@iconify/svelte";
  let leafletInstance: any;
    let map: any;
    let customIcon: any;
    let buttonTemplate: string;
    let customControl: any;
    let root: any;
    let autocomplete: any;
  
    onMount(() => {
  
      leafletInstance = window.L;
      const map = leafletInstance.map("map", {
        center: [23.193888516198705, 78.71084779007197],
        zoom: 5,
      });
      // const map = leafletInstance.map("map")
      // map.setView([28.509941525979272, 77.04205682200237],7)
      leafletInstance
      // .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      .tileLayer('https://tile.osm.ch/switzerland/{z}/{x}/{y}.png',
        // .tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
        // .tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
         {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            // '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
            // '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; ',
            ext: 'png'
  
        })
        .addTo(map);
        const customIcon= leafletInstance.icon({
          iconUrl:'svg/mapicon3.svg',
          iconSize:[32,32],
        })
      //https://leaflet-extras.github.io/leaflet-providers/preview/
  
  // Listen for zoomend event on the map
  // Define a function to add markers based on zoom level
  // Function to add markers based on zoom level
  function addMarkersBasedOnZoom() {
    if (map.getZoom() <= 11) {
      // Zoom level is low, remove all active markers
      map.eachLayer((layer) => {
        if (layer instanceof leafletInstance.Marker && layer.options.icon.options.iconUrl === 'svg/mapicon3.svg') {
          map.removeLayer(layer);
        }
      });
  
      // Show sites with critical and non-critical situations
      data.forEach((site) => {
        const hasCritical = site.devices.some(device => device.situation === 'Critical');
        const hasNonCritical = site.devices.some(device => device.situation === 'Non-Critical');
  
        if (hasCritical || hasNonCritical) {
          let iconUrl = hasCritical ? 'svg/mapicon1.svg' : 'svg/mapicon2.svg';
          
          const customIcon = leafletInstance.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32],
          });
          
          const marker = leafletInstance
            .marker(site.location, {
              title: site.sitename,
              icon: customIcon,
            })
            .bindPopup(createPopupContent(site.devices,site))
            .addTo(map);
  
          // Add click event listener to marker
          marker.on("click", () => {
            // Zoom to marker and show popup
            map.setView(site.location, 12); // Zoom level can be adjusted as needed
            marker.openPopup();
          });
        }
      });
    } else {
      // Zoom level is higher than 10, show all sites including active
      data.forEach((site) => {
        let iconUrl = 'svg/mapicon3.svg'; // Default icon for all active devices
  
        const hasCritical = site.devices.some(device => device.situation === 'Critical');
        const hasNonCritical = site.devices.some(device => device.situation === 'Non-Critical');
  
        if (hasCritical) {
          iconUrl = 'svg/mapicon1.svg'; // Icon for at least one critical device
        } else if (hasNonCritical) {
          iconUrl = 'svg/mapicon2.svg'; // Icon for at least one non-critical device
        }
  
        const customIcon = leafletInstance.icon({
          iconUrl: iconUrl,
          iconSize: [32, 32],
        });
  
        const marker = leafletInstance
          .marker(site.location, {
            title: site.sitename,
            icon: customIcon,
          })
          .bindPopup(createPopupContent(site.devices,site))        .addTo(map);
  
        // Add click event listener to marker
        marker.on("click", () => {
          // Zoom to marker and show popup
          map.setView(site.location); // Zoom level can be adjusted as needed
          marker.openPopup();
        });
      });
    }
  }
  function createPopupContent(devices, site) {
    let popupContent = `<div class="flex flex-col text-[17px] text-white">${site.sitename}</div><div class="flex flex-col text-white opacity-60 mb-[4px] text-[15px]">Devices</div><div class="flex flex-col">`;
  
    devices.forEach(device => {
      let color = '';
      if (device.situation === 'Critical') {
        color = '#ffffff';
      } else if (device.situation === 'Non-Critical') {
        color = '#ffffff';
      } else {
        color = '#ffffff';
      }
      popupContent += `<div style="background-color: #061831; color:${color}; padding: 4px; border-radius: 0.375rem; margin-bottom: 4px;" class="flex flex-row items-center gap-2 justify-between">
        <div>
        <img src=${device.imgurl} alt="Device Image"  class="h-[25px] w-[25px]"  />
          </div>
        <div class="text-[13px]">
     ${device.devicename} - ${device.situation}
          </div>
        <div>
        <img src="/svg/popup.svg" alt="Device Image" class="h-[9px] w-[9px]"/>
          </div>
  
        </div>`;
    });
  
    popupContent += '</div>';
  
    return popupContent;
  }
  // Call the function initially to add markers based on the initial zoom level
  addMarkersBasedOnZoom();
  
  // Listen for the zoomend event on the map and add markers based on the zoom level
  map.on("zoomend", () => {
    addMarkersBasedOnZoom();
  });
  
  
  // Listen for the zoomend event on the map and add markers based on the zoom level
  map.on("zoomend", () => {
    addMarkersBasedOnZoom();
  });
  
  
  
  
  // const buttonTemplate = `<div class="flex leaflet-search flex-row gap-2 bg-white items-center ">
  //   <div class="p-2 mx-auto">
  //     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
  // 	<path fill="#828282" d="M232.49 215.51L185 168a92.12 92.12 0 1 0-17 17l47.53 47.54a12 12 0 0 0 17-17ZM44 112a68 68 0 1 1 68 68a68.07 68.07 0 0 1-68-68" />
  // </svg></div>
  
  //   <div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." />
  //     <div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div>
  //     </div> </div>`;
  const buttonTemplate = `<div class="leaflet-search"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M31.008 27.231l-7.58-6.447c-0.784-0.705-1.622-1.029-2.299-0.998 1.789-2.096 2.87-4.815 2.87-7.787 0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12c2.972 0 5.691-1.081 7.787-2.87-0.031 0.677 0.293 1.515 0.998 2.299l6.447 7.58c1.104 1.226 2.907 1.33 4.007 0.23s0.997-2.903-0.23-4.007zM12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path></svg></div><div class="auto-search-wrapper max-height"><input type="text" id="marker" autocomplete="off"  aria-describedby="instruction" aria-label="Search ..." /><div id="instruction" class="hidden">When autocomplete results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.</div></div>`;
  
  
  // create custom button
  const customControl = leafletInstance.Control.extend({
    // button position
    options: {
      position: "topright",
      className: "leaflet-autocomplete",
    },
  
    // method
    onAdd: function () {
      return this._initialLayout();
    },
  
    _initialLayout: function () {
      // create button
      const container = leafletInstance.DomUtil.create(
        "div",
        "leaflet-bar " + this.options.className
      );
  
      leafletInstance.DomEvent.disableClickPropagation(container);
  
      container.innerHTML = buttonTemplate;
  
      return container;
    },
  });
  map.addControl(new customControl());
  // input element
  const root = document.getElementById("marker");
  
  function addClassToParent() {
    const searchBtn = document.querySelector(".leaflet-search");
    searchBtn.addEventListener("click", (e) => {
      // toggle class
      e.target
        .closest(".leaflet-autocomplete")
        .classList.toggle("active-autocomplete");
  
      // add placeholder
      root.placeholder = "Search ...";
  
      // focus on input
      root.focus();
  
      // use destroy method
      autocomplete.destroy();
    });
  }
  
  addClassToParent();
  
  // function clear input
  map.on("click", () => {
    document
      .querySelector(".leaflet-autocomplete")
      .classList.remove("active-autocomplete");
  
    clickOnClearButton();
  });
  const autocomplete = new Autocomplete("marker", {
    delay: 1000,
    selectFirst: true,
    howManyCharacters: 2,
  
    onSearch: function ({ currentValue }) {
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(
        currentValue
      )}`;
  
      /**
       * Promise
       */
      return new Promise((resolve) => {
        fetch(api)
          .then((response) => response.json())
          .then((data) => {
            resolve(data.features);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
  
    onResults: ({ currentValue, matches, template }) => {
      const regex = new RegExp(currentValue, "i");
      // checking if we have results if we don't
      // take data from the noResults method
      return matches === 0
        ? template
        : matches
            .map((element) => {
              return `
                <li role="option">
                  <p>${element.properties.display_name.replace(
                    regex,
                    (str) => `<b>${str}</b>`
                  )}</p>
                </li> `;
            })
            .join("");
    },
  
    onSubmit: ({ object }) => {
      const { display_name } = object.properties;
      const cord = object.geometry.coordinates;
      // custom id for marker
      // const customId = Math.random();
  
      // remove last marker
      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === "markerPane") {
          if (layer._icon.classList.contains("leaflet-marker-locate")) {
            map.removeLayer(layer);
          }
        }
      });
  
      // add marker
      const marker = leafletInstance.marker([cord[1], cord[0]], {
        title: display_name,
      });
  
      // add marker to map
      marker.addTo(map).bindPopup(display_name);
  
      // set marker to coordinates
      map.setView([cord[1], cord[0]], 8);
  
      // add class to marker
      leafletInstance.DomUtil.addClass(marker._icon, "leaflet-marker-locate");
    },
  
    // the method presents no results
    noResults: ({ currentValue, template }) =>
      template(`<li>No results found: "${currentValue}"</li>`),
  });
    });
  </script>
  
  <div class="flex flex-col gap-2 py-4">
  
    <div id="map" class="h-[calc(100vh-200px)] w-full z-50 rounded-lg text-black"></div>
    <div class=" flex flex-row gap-4 items-center justify-end">
      <div class="flex flex-row gap-2 items-center">
        <div class="h-[16px] w-[16px]  bg-[#03A185] rounded-sm"></div>
        <span>Active</span>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <div class="h-[16px] w-[16px]  bg-[#B5496E] rounded-sm"></div>
        <span>Critical</span>
      </div>
      <div class="flex flex-row gap-2 items-center">
        <div class="h-[16px] w-[16px]  bg-[#B6834D] rounded-sm"></div>
        <span>Non-Critical</span>
      </div>
    </div>
  </div>