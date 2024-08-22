<script lang="ts">
  import Stream from "./../../components/stream/Stream.svelte";
  import { PUBLIC_BASE_URL } from "$env/static/public";
  import { page } from "$app/stores";
  let videos: { [key: string] } = {};
  const neededUrl = $page.url.hostname;
  // const location = window?.location?.href;
  // const neededUrl =
  //   location?.split("/")[2] === "localhost:5173"
  //     ? PUBLIC_BASE_URL
  //     : location?.split("/")[2]?.split(":")[0];

  const testCameras = {
    name: "2",
    id: "ctdkoq9wyuzuro3",
    url: "rtsp://admin:Admin7890@116.68.244.147",
    save: false,
    face: false,
    vehicle: false,
    faceDetThresh: 0.6,
    faceMatchThresh: 0.3,
    vehicleDetThresh: undefined,
    vehiclePlateThresh: undefined,
    vehicleOCRThresho: undefined,
    saveFolder: "./PlayBack/",
    saveDuration: "",
  };

  const initVideo = (camera: Camera) => {
    if (videos[camera.id]) {
      return;
    }
    let video = document.createElement("video-stream") as VideoStreamType;
    video.id = `stream-${camera.id}`;
    video.mode = "webrtc";
    video.url = camera.url;
    video.src = new URL(
      `ws://${neededUrl}:8082/api/ws?src=${camera.url
        ?.split("@")[1]
        ?.split(":")[0]
        ?.replace(/\./g, "_")}&camID=${camera.id}&nodeID=${1}`,
    );
    video.style.position = "relative";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.zIndex = "10";
    video.background = true;
    video.visibilityCheck = false;
    videos[camera.id] = video;
  };

  const updateLayout = () => {
    if (!videos[testCameras.id]) {
      initVideo(testCameras);
    } else {
      videos[testCameras.id].src = new URL(
        `ws://${neededUrl}:8082/api/ws?src=${testCameras.url
          ?.split("@")[1]
          ?.split(":")[0]
          ?.replace(/\./g, "_")}&camID=${testCameras.id}&nodeID=${1}`,
      );
    }
  };

  $: updateLayout();
</script>

<div class=" h-1/2 w-1/2 grid place-items-center">
  <Stream videoElement={videos[testCameras.id]} camera={testCameras} />
</div>
