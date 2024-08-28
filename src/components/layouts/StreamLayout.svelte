<script lang="ts">
  import PocketBase from "pocketbase";
  import { mode } from "mode-watcher";
  import { activeCamera, markRoi } from "@/lib/stores";
  import { cn } from "@/lib";
  import {
    selectedNode,
    filteredNodeCameras,
    canvasCoordinates,
    view,
    cameraCounts,
  } from "@/lib/stores";
  import Stream from "@/components/stream/Stream.svelte";
  import type { Camera } from "@/types.d.ts";
  import * as Carousel from "@/components/ui/carousel/index.js";
  import AddCameraDialog from "../dialogs/AddCameraDialog.svelte";
  import {
    AArrowUp,
    Disc2,
    Expand,
    ImageDown,
    Menu,
    PenTool,
    RefreshCcw,
    Users,
    X,
  } from "lucide-svelte";
  import { Shrink } from "lucide-svelte";
  import { addUserLog } from "@/lib/addUserLog";
  import { page } from "$app/stores";
  import Sortable from "sortablejs";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { get } from "svelte/store";

  export let handleSingleSS: () => void;
  export let isAllFullScreen: boolean;
  export let data;
  export let currpanel;

  let streamCount =
    $selectedNode.camera.length === $filteredNodeCameras.length
      ? $selectedNode.camera.length
      : $filteredNodeCameras.length === 0
        ? $selectedNode.camera.length
        : $filteredNodeCameras.length; // Number of video streams
  let layoutRows = 1; // Default layout rows
  let layoutColumns = 1; // Default layout columns
  let totalPages = 1;
  let isSingleFullscreen: boolean = false;
  let videos: { [key: string]: HTMLElement } = {};
  let cells: HTMLDivElement;
  let ele;
  let slideIndex: number = 0;
  let cameraStatusData = [];

  const neededUrl = $page.url.hostname;

  const handleRefreshError = (event) => {
    console.log("inside handle refresh error");
    console.log(event);
    refreshVideoStream(event.detail.cameraId);
  };

  const handleH265Error = (event) => {
    console.log("first");
    console.log(event);
    const { cameraId } = event.detail;
    console.log(`Handling H265 error for camera ID: ${cameraId}`); // Debug: Log when handling
    const video = videos[cameraId];
    if (video) {
      video.mode = "mse";
      if (video) {
        video.remove();
        delete videos[cameraId];
      }
      initVideo(
        $selectedNode.camera.find((c) => c.id === cameraId),
        "mse",
      );
      // initVideo($selectedNode.camera.find((c) => c.id === cameraId));
    }
  };

  const initVideo = async (camera: Camera, mode) => {
    const index = $selectedNode.camera.findIndex((cam) => cam.id === camera.id);
    if (videos[camera.id]) {
      console.log("video c.id exists", camera.name);
      return;
    }
    let video = document.createElement("video-stream") as VideoStreamType;
    video.id = `stream-${camera.id}`;
    video.mode = "mse";
    video.url = camera.url;
    video.src = new URL(
      `ws://${neededUrl}:8082/api/ws?src=${camera.id}&nodeID=${1}&cn=${camera.name}`,
    );
    video.style.position = "relative";
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.zIndex = "10";
    video.background = true;
    video.visibilityCheck = false;
    videos[camera.id] = video;
  };

  const singleFullscreen = (slotIndex: number) => {
    let cell = document.getElementById(`grid-cell-${slotIndex}`);
    cell?.requestFullscreen({ navigationUI: "show" });
    const camera = $selectedNode.camera[slotIndex];
    if (camera) {
      videos[camera.id].remove();
      delete videos[camera.id];
      camera.id = camera.id.replace("_FULL", "");
      camera.id += "_FULL";
      console.log("camera url: ", camera.url, camera.id);
      initVideo(camera);
    }
    console.log(camera);
    isSingleFullscreen = true;
  };

  const exitSingleFullscreen = (slotIndex: number) => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      const camera = $selectedNode.camera[slotIndex];
      if (camera) {
        videos[camera.id].remove();
        delete videos[camera.id];
        camera.id = camera.id.replace("_FULL", "");
        console.log("camera url: ", camera.url, camera.id);
        initVideo(camera);
      }
      isSingleFullscreen = false;
    }
  };

  const onFullscreenChange = (event) => {
    if (isSingleFullscreen) {
      if (document.fullscreenElement) {
        const fullscreenElementId = document.fullscreenElement?.id;
        ele = fullscreenElementId;
      }
    }
    if (!document.fullscreenElement) {
      console.log("Exited fullscreen mode");
      const parent = document.getElementById(ele);
      const videoStreamElement = parent.querySelector("video-stream");
      if (videoStreamElement) {
        const matchingCamera = $selectedNode.camera.find(
          (c) => c.url === videoStreamElement.url,
        );
        const matchingCameraId = matchingCamera ? matchingCamera.id : null;
        if (matchingCameraId !== null) {
          isSingleFullscreen = false;
          videos[matchingCameraId].remove();
          delete videos[matchingCameraId];
          initVideo(matchingCamera);
        }
      } else {
        console.log("No video-stream element found in the parent.");
      }
      isSingleFullscreen = false;
      updateLayout($selectedNode.maxStreamsPerPage);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    }
  };

  const refreshVideoStream = (cameraId: string) => {
    const videoElement = videos[cameraId];
    if (videoElement) {
      if (
        videoElement.src instanceof WebSocket &&
        videoElement.src.readyState === WebSocket.OPEN
      ) {
        console.log("first");
        videoElement.src.close();
      }
      // console.log(videoElement);
      videoElement.remove();
      delete videos[cameraId];
      const camera = $selectedNode.camera.find((c) => c.id === cameraId);
      // console.log(camera.name);
      if (camera) {
        initVideo(camera);
      }
    }
  };

  function handleSlideChange() {
    const startIndex = slideIndex * $selectedNode.maxStreamsPerPage;
    const endIndex = startIndex + $selectedNode.maxStreamsPerPage;
    const camerasOnSlide = $selectedNode.camera.slice(startIndex, endIndex);
    const cameraIds = camerasOnSlide.map((camera) => camera.id);
    cameraIds.forEach((cameraId) => {
      refreshVideoStream(cameraId);
    });
  }

  function handlePrevious() {
    if (slideIndex > 0) {
      const startIndex = slideIndex * $selectedNode.maxStreamsPerPage;
      const endIndex = startIndex + $selectedNode.maxStreamsPerPage;
      const camerasOnSlide = $selectedNode.camera.slice(startIndex, endIndex);
      camerasOnSlide.forEach((c) => {
        if (videos[c.id]) {
          console.log("removing last slide socket", c.name);
          // videos[c.id].src.close();
          videos[c.id].remove();
          delete videos[c.id];
        }
      });

      slideIndex -= 1;

      if (
        $selectedNode.maxStreamsPerPage === 0 ||
        $selectedNode.maxStreamsPerPage === 10 ||
        $selectedNode.maxStreamsPerPage === 13 ||
        $selectedNode.maxStreamsPerPage === 5 ||
        $selectedNode.maxStreamsPerPage === 7
      ) {
        console.log("handle next all sockets already called");
      } else {
        const newStartIndex = slideIndex * $selectedNode.maxStreamsPerPage;
        const newEndIndex = newStartIndex + $selectedNode.maxStreamsPerPage;
        const newCamerasOnSlide = $selectedNode.camera.slice(
          newStartIndex,
          newEndIndex,
        );
        newCamerasOnSlide.map((c) => {
          if (!videos[c.id]) {
            initVideo(c);
          } else {
            if (videos[c.id].url !== c.url) {
              console.log("first");
              videos[c.id].url = c.url;
              videos[c.id].src = new URL(
                `ws://${neededUrl}:8082/api/ws?src=${c.id}&nodeID=${1}&cn=${c.name}`,
              );
            }
          }
        });
      }
    }
    handleSlideChange();
  }

  function handleNext() {
    if (slideIndex < totalPages - 1) {
      const startIndex = slideIndex * $selectedNode.maxStreamsPerPage;
      const endIndex = startIndex + $selectedNode.maxStreamsPerPage;
      const camerasOnSlide = $selectedNode.camera.slice(startIndex, endIndex);
      camerasOnSlide.forEach((c) => {
        if (videos[c.id]) {
          console.log("removing last slide socket", c.name);
          // videos[c.id].src.close();
          videos[c.id].remove();
          delete videos[c.id];
        }
      });

      slideIndex += 1;

      if (
        $selectedNode.maxStreamsPerPage === 0 ||
        $selectedNode.maxStreamsPerPage === 10 ||
        $selectedNode.maxStreamsPerPage === 13 ||
        $selectedNode.maxStreamsPerPage === 5 ||
        $selectedNode.maxStreamsPerPage === 7
      ) {
        console.log("handle next all sockets already called");
      } else {
        const newStartIndex = slideIndex * $selectedNode.maxStreamsPerPage;
        const newEndIndex = newStartIndex + $selectedNode.maxStreamsPerPage;
        const newCamerasOnSlide = $selectedNode.camera.slice(
          newStartIndex,
          newEndIndex,
        );
        newCamerasOnSlide.map((c) => {
          if (!videos[c.id]) {
            initVideo(c);
          } else {
            if (videos[c.id].url !== c.url) {
              console.log("first");
              videos[c.id].url = c.url;
              videos[c.id].src = new URL(
                `ws://${neededUrl}:8082/api/ws?src=${c.id}&nodeID=${1}&cn=${c.name}`,
              );
            }
          }
        });
      }
    }
    handleSlideChange();
  }

  let prevName = $selectedNode.name;

  const updateLayout = (maxStreamsPerPage: number) => {
    if ($selectedNode.name !== prevName) {
      Object.keys(videos).forEach((videoId) => {
        const videoElement = videos[videoId];
        if (videoElement) {
          videoElement.remove();
        }
      });
      videos = {};
      prevName = $selectedNode.name;
    }
    slideIndex = 0;

    if (
      $selectedNode.maxStreamsPerPage === 0 ||
      $selectedNode.maxStreamsPerPage === 10 ||
      $selectedNode.maxStreamsPerPage === 13 ||
      $selectedNode.maxStreamsPerPage === 5 ||
      $selectedNode.maxStreamsPerPage === 7
    ) {
      console.log("inside if for calling sockets");
      $selectedNode.camera.map((c) => {
        if (!videos[c.id]) {
          // console.log("c", c);
          initVideo(c);
        } else {
          if (videos[c.id].url !== c.url) {
            videos[c.id].url = c.url;
            videos[c.id].src = new URL(
              `ws://${neededUrl}:8082/api/ws?src=${c.id}&nodeID=${1}&cn=${c.name}`,
            );
          }
        }
      });
    } else {
      const startIndex = slideIndex * maxStreamsPerPage;
      const endIndex = startIndex + maxStreamsPerPage;
      const camerasOnSlide = $selectedNode.camera.slice(startIndex, endIndex);
      // console.log(
      //   "inside else for calling sockets",
      //   camerasOnSlide,
      //   startIndex,
      //   endIndex,
      // );
      camerasOnSlide.map((c) => {
        if (!videos[c.id]) {
          initVideo(c);
        } else {
          if (videos[c.id].url !== c.url) {
            console.log("first");
            videos[c.id].url = c.url;
            videos[c.id].src = new URL(
              `ws://${neededUrl}:8082/api/ws?src=${c.id}&nodeID=${1}&cn=${c.name}`,
            );
          }
        }
      });
    }

    streamCount =
      $selectedNode.camera.length === $filteredNodeCameras.length
        ? $selectedNode.camera.length
        : $filteredNodeCameras.length === 0
          ? $selectedNode.camera.length
          : $filteredNodeCameras.length;

    if (maxStreamsPerPage === 0) {
      // Automatic Layout

      const squareRoot = Math.ceil(Math.sqrt(streamCount));
      if (Number.isInteger(Math.sqrt(streamCount))) {
        layoutColumns = squareRoot;
      } else {
        layoutColumns = squareRoot <= 4 ? squareRoot : 5;
      }

      layoutRows = Math.ceil(streamCount / layoutColumns);
    } else if (
      streamCount !== 0 &&
      maxStreamsPerPage !== 10 &&
      maxStreamsPerPage !== 13 &&
      maxStreamsPerPage !== 5 &&
      maxStreamsPerPage !== 7
    ) {
      const squareRoot = Math.ceil(Math.sqrt(maxStreamsPerPage));
      layoutColumns = squareRoot;
      layoutRows = squareRoot;
    } else if (
      streamCount !== 0 &&
      maxStreamsPerPage !== 5 &&
      (maxStreamsPerPage === 10 ||
        maxStreamsPerPage === 13 ||
        maxStreamsPerPage === 7)
    ) {
      layoutColumns = 4;
      layoutRows = 4;
    } else if (streamCount !== 0 && maxStreamsPerPage === 5) {
      layoutColumns = 3;
      layoutRows = 3;
    }

    totalPages =
      maxStreamsPerPage === 10
        ? Math.ceil(streamCount / 10)
        : maxStreamsPerPage === 13
          ? Math.ceil(streamCount / 13)
          : maxStreamsPerPage === 5
            ? Math.ceil(streamCount / 6)
            : maxStreamsPerPage === 7
              ? Math.ceil(streamCount / 8)
              : Math.ceil(streamCount / (layoutRows * layoutColumns));

     setTimeout(() => {
      createRoiLines();
      initSortable();
    }, 2000);
  };

  $: {
    if (isSingleFullscreen) {
      document.addEventListener("fullscreenchange", onFullscreenChange);
    } else {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    }
  }

  $: {
    if ($filteredNodeCameras.length === $selectedNode.camera.length) {
      //  if(!$markRoi){
      updateLayout($selectedNode.maxStreamsPerPage);
      // } else {
      //   updateLayout(0);
      // }
    } else {
      updateLayout(0);
    }
  }

  onMount(() => {
    setTimeout(() => {
      initSortable();
    }, 100);
  });

  function initSortable() {
    if (cells) {
      Sortable.create(cells, {
        animation: 250,
        chosenClass: "chosen",
        dragClass: "dragged",
        handle: ".grab-handle",
        onEnd: function (evt) {
          const newOrder = Array.from(cells.children).map((child) => child.id);
          const draggedElement = evt.item;
          updateListWithNewOrder(newOrder, draggedElement);
        },
      });
    } else {
      console.log("sortable cells not found");
    }
  }

  $: bigCellIndex = [10, 13, 5, 7].includes($selectedNode.maxStreamsPerPage)
    ? 0
    : null;

  function setBigCell(index) {
    bigCellIndex = index;
  }

  let draw = false;
  let canvas, ctx, rect;

  function toggleDraw() {
    draw = !draw;
    if (draw) {
      setTimeout(() => {
        if ($view === 2) {
          setupCanvas();
        } else {
          setupCanvasForLine();
        }
      }, 0);
    }
  }

  function setupCanvas() {
    canvas = document.getElementById("roicanvas");
    ctx = canvas.getContext("2d");
    rect = canvas.getBoundingClientRect();

    const points = [
      { x: 50, y: 50, isDragging: false, color: "red" },
      { x: 150, y: 50, isDragging: false, color: "red" },
      { x: 150, y: 150, isDragging: false, color: "red" },
      { x: 50, y: 150, isDragging: false, color: "red" },
    ];

    let shapeIsDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    canvas.width = rect.width;
    canvas.height = rect.height;

    function updateCanvasCoordinates() {
      const videoResolution = { width: 640, height: 640 };
      canvasCoordinates.set(
        points.map((point) => ({
          x: Math.round((point.x / rect.width) * videoResolution.width),
          y: Math.round((point.y / rect.height) * videoResolution.height),
        })),
      );
    }

    function drawPoints() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fill();
      ctx.strokeStyle = "red";
      ctx.stroke();
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
      });
    }

    function pointInShape(x, y) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      return ctx.isPointInPath(x, y);
    }

    function isWithinBounds(point) {
      return (
        point.x >= 0 &&
        point.x <= rect.width &&
        point.y >= 0 &&
        point.y <= rect.height
      );
    }

    canvas.addEventListener("mousedown", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let onPoint = false;

      points.forEach((point) => {
        if (
          Math.abs(mouseX - point.x) < 10 &&
          Math.abs(mouseY - point.y) < 10
        ) {
          point.isDragging = true;
          onPoint = true;
        }
      });

      if (!onPoint && pointInShape(mouseX, mouseY)) {
        shapeIsDragging = true;
        dragOffsetX = mouseX;
        dragOffsetY = mouseY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (shapeIsDragging) {
        const dx = mouseX - dragOffsetX;
        const dy = mouseY - dragOffsetY;
        let allWithinBounds = true;
        points.forEach((point) => {
          const newX = point.x + dx;
          const newY = point.y + dy;
          if (!isWithinBounds({ x: newX, y: newY })) {
            allWithinBounds = false;
          }
        });

        if (allWithinBounds) {
          points.forEach((point) => {
            point.x += dx;
            point.y += dy;
          });
          dragOffsetX = mouseX;
          dragOffsetY = mouseY;
          drawPoints();
          updateCanvasCoordinates();
        }
      } else if (points.some((p) => p.isDragging)) {
        const point = points.find((p) => p.isDragging);
        const newX = mouseX;
        const newY = mouseY;
        if (isWithinBounds({ x: newX, y: newY })) {
          point.x = newX;
          point.y = newY;
          drawPoints();
          updateCanvasCoordinates();
        }
      }

      if (pointInShape(mouseX, mouseY) || points.some((p) => p.isDragging)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    });

    canvas.addEventListener("mouseup", () => {
      shapeIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
    });

    canvas.addEventListener("mouseout", () => {
      shapeIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
      canvas.style.cursor = "default";
    });

    drawPoints();
    updateCanvasCoordinates();
  }

  function setupCanvasForLine() {
    canvas = document.getElementById("roicanvas");
    ctx = canvas.getContext("2d");
    rect = canvas.getBoundingClientRect();

    const points = [
      { x: 50, y: 50, isDragging: false, color: "blue" },
      { x: 150, y: 150, isDragging: false, color: "blue" },
    ];

    let lineIsDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    canvas.width = rect.width;
    canvas.height = rect.height;

    function updateCanvasCoordinates() {
      const videoResolution = { width: 640, height: 640 };
      canvasCoordinates.set(
        points.map((point) => ({
          x: Math.round((point.x / rect.width) * videoResolution.width),
          y: Math.round((point.y / rect.height) * videoResolution.height),
        })),
      );
    }

    function drawLinePoints() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.strokeStyle = "blue";
      ctx.stroke();
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();
      });
    }

    function isWithinBounds(point) {
      return (
        point.x >= 0 &&
        point.x <= rect.width &&
        point.y >= 0 &&
        point.y <= rect.height
      );
    }

    canvas.addEventListener("mousedown", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      let onPoint = false;

      points.forEach((point) => {
        if (
          Math.abs(mouseX - point.x) < 10 &&
          Math.abs(mouseY - point.y) < 10
        ) {
          point.isDragging = true;
          onPoint = true;
        }
      });

      if (!onPoint) {
        lineIsDragging = true;
        dragOffsetX = mouseX;
        dragOffsetY = mouseY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (lineIsDragging) {
        const dx = mouseX - dragOffsetX;
        const dy = mouseY - dragOffsetY;
        let allWithinBounds = true;
        points.forEach((point) => {
          const newX = point.x + dx;
          const newY = point.y + dy;
          if (!isWithinBounds({ x: newX, y: newY })) {
            allWithinBounds = false;
          }
        });

        if (allWithinBounds) {
          points.forEach((point) => {
            point.x += dx;
            point.y += dy;
          });
          dragOffsetX = mouseX;
          dragOffsetY = mouseY;
          drawLinePoints();
          updateCanvasCoordinates();
        }
      } else if (points.some((p) => p.isDragging)) {
        const point = points.find((p) => p.isDragging);
        const newX = mouseX;
        const newY = mouseY;
        if (isWithinBounds({ x: newX, y: newY })) {
          point.x = newX;
          point.y = newY;
          drawLinePoints();
          updateCanvasCoordinates();
        }
      }

      if (points.some((p) => p.isDragging)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    });

    canvas.addEventListener("mouseup", () => {
      lineIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
    });

    canvas.addEventListener("mouseout", () => {
      lineIsDragging = false;
      points.forEach((point) => {
        point.isDragging = false;
      });
      canvas.style.cursor = "default";
    });

    drawLinePoints();
    updateCanvasCoordinates();
  }

  function updateListWithNewOrder(newOrder, draggedItem) {
    const cell = document.getElementById("grid-cell-0");
    const stream = cell?.querySelector("video-stream");
    if (stream) {
      const matchingCamera = $selectedNode.camera.find(
        (c) => c.url === stream.url,
      );
      const matchingCameraId = matchingCamera ? matchingCamera.id : null;
    } else {
      console.log("here");
    }
  }

  function createRoiLines() {
    if (
      $selectedNode.camera.some(
        (camera) =>
          camera.expand?.inference?.lineCrossing &&
          camera.expand?.inference?.lineData.length > 0,
      )
    ) {
      $selectedNode.camera.forEach((camera, index) => {
        // console.log(camera.lineData)
        if (
          camera.expand?.inference?.lineCrossing &&
          camera.expand?.inference?.lineData.length > 0
        ) {
          const canvas = document.getElementById(`lineCanvas-${index}`);
          if (canvas) {
            canvas.style.borderRadius = "14px";
            drawLineData(canvas, camera.expand?.inference?.lineData);
          }
        }
      });
    }
  }

  function drawLineData(canvas, lineData) {
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    // Scale points to fit the canvas dimensions
    const scaledPoints = lineData.map((point) => ({
      x: (point.x / 640) * canvas.width,
      y: (point.y / 640) * canvas.height,
    }));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < scaledPoints.length; i += 2) {
      if (i + 1 < scaledPoints.length) {
        ctx.beginPath();
        ctx.moveTo(scaledPoints[i].x, scaledPoints[i].y);
        ctx.lineTo(scaledPoints[i + 1].x, scaledPoints[i + 1].y);
        ctx.strokeStyle = "red";
        ctx.stroke();
      }
    }

    scaledPoints.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    });
  }

  //     let currentIndex = $selectedNode.maxStreamsPerPage;
  //   // console.log(currentIndex)
  //   let refreshInterval;

  //   function refreshCamera() {
  //     const maxStreams = $selectedNode.maxStreamsPerPage;
  //     const totalCameras = $selectedNode.camera.length;

  //     if (maxStreams !== 0 && currentIndex >= maxStreams) {
  //       currentIndex = 0;
  //     }

  //     const camera = $selectedNode.camera[currentIndex];
  //     if (camera) {
  //       refreshVideoStream(camera.id);
  //       console.log(
  //         "Refreshing camera with index & name:",
  //         currentIndex,
  //         camera.name,
  //       );
  //     }

  //     if (maxStreams !== 0) {
  //       currentIndex = (currentIndex + 1) % Math.min(maxStreams, totalCameras);
  //     } else {
  //       currentIndex = (currentIndex + 1) % totalCameras;
  //     }
  //   }

  //   function startRefreshing() {
  //     refreshCamera();
  //     refreshInterval = setInterval(refreshCamera, 15000);
  //   }

  //     onMount(() => {
  //     if ($selectedNode) {
  //       stopRefreshing()
  //       setTimeout(() => {
  //         startRefreshing();
  //       }, 15000);
  //     }
  //   });

  //   function stopRefreshing() {
  //   if (refreshInterval) {
  //     clearInterval(refreshInterval);
  //     refreshInterval = null;
  //   }
  // }

  // onDestroy(() => {
  //   stopRefreshing();
  // });

  let currentIndex = 0;
  let refreshTimeout;
  let isRefreshing = false;

  function refreshCamera() {
    if (
      !$selectedNode ||
      !$selectedNode.camera ||
      $selectedNode.camera.length === 0
    ) {
      console.log("No cameras to refresh");
      scheduleNextRefresh(); // Schedule next refresh even if there are no cameras
      return;
    }

    const totalCameras = $selectedNode.camera.length;

    if (currentIndex >= totalCameras) {
      currentIndex = 0;
    }

    const camera = $selectedNode.camera[currentIndex];
    if (camera) {
      console.log(
        `Refreshing camera: ${camera.name} (${currentIndex + 1}/${totalCameras})`,
      );
      refreshVideoStream(camera.id);
    }

    currentIndex = (currentIndex + 1) % totalCameras;
    scheduleNextRefresh();
  }

  function scheduleNextRefresh() {
    const interval = calculateDynamicInterval();
    refreshTimeout = setTimeout(() => {
      if (!isRefreshing) return;
      refreshCamera();
    }, interval);
  }

  function calculateDynamicInterval() {
    let interval = 15000;
    const cameraCount = get(selectedNode).camera.length;
    if (cameraCount > 20) interval = 20000;
    if (cameraCount > 50) interval = 30000;
    return interval;
  }

  function startRefreshing() {
    if (isRefreshing) return;
    isRefreshing = true;
    currentIndex = 0;
    refreshCamera();
  }

  function stopRefreshing() {
    isRefreshing = false;
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    }
  }

  onMount(() => {
    if ($selectedNode) {
      stopRefreshing();
      setTimeout(startRefreshing, 15000);
    }
  });

  onDestroy(() => {
    stopRefreshing();
    if (isRefreshing) {
      console.log("on destroy is refresh true");
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
    } else {
      console.log("on destroy is refresh false");
    }
  });
</script>

{#if streamCount > 0 && Object.keys(videos).length > 0}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#if $filteredNodeCameras.length === 1 ? $markRoi : $selectedNode.camera.length !== $filteredNodeCameras.length && $filteredNodeCameras.length !== 0}
    <div
      class={cn(
        `grid w-full h-full ${!isAllFullScreen ? "max-h-[calc(100vh-75px)]" : "max-h-screen"} grid-cols-${layoutColumns} grid-rows-${layoutRows}`,
      )}
      bind:this={cells}
    >
      {#each Array($filteredNodeCameras.length) as _, newIndex}
        {#key newIndex}
          <div id={`grid-cell-${newIndex}`} class="relative">
            <Stream
              videoElement={videos[$filteredNodeCameras[newIndex].id]}
              camera={$filteredNodeCameras[newIndex]}
              on:h265Error={handleH265Error}
              on:refErr={handleRefreshError}
            />
            <span
              class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white py-1 px-3 absolute top-4 left-4 items-center rounded-xl scale-90 z-20"
            >
              <span
                class={`h-2 w-2 ${
                  $filteredNodeCameras[newIndex].save === true
                    ? "bg-[#C12828]"
                    : "bg-[#589e67]"
                } rounded-full`}
              />
              <span class="text-xs font-extrabold">
                {$filteredNodeCameras[newIndex].name}
                <!-- {currpanel} -->
              </span>
            </span>
            <button
              on:click={() => {
                if (isSingleFullscreen === true) {
                  exitSingleFullscreen(newIndex);
                  const streamElement =
                    videos[$filteredNodeCameras[newIndex].id];
                  console.log(streamElement);
                  if (streamElement) {
                    console.log("first");
                    streamElement.remove();
                    delete videos[$filteredNodeCameras[newIndex].id];
                  }
                  initVideo($filteredNodeCameras[newIndex]);
                } else {
                  singleFullscreen(newIndex);
                  const streamElement =
                    videos[$filteredNodeCameras[newIndex].id];
                  if (streamElement) {
                    console.log("first");
                    streamElement.remove();
                    delete videos[$filteredNodeCameras[newIndex].id];
                  }
                  initVideo($filteredNodeCameras[newIndex]);
                }

                addUserLog(
                  `user clicked single camera fulscreen for camera ${$filteredNodeCameras[newIndex].name} having url "${$filteredNodeCameras[newIndex].url}" `,
                );
              }}
              class="absolute p-1 top-4 right-4 cursor-pointer bg-[rgba(0,0,0,.5)] text-white rounded z-20 disabled:cursor-not-allowed"
              >{#if !isSingleFullscreen}
                <Expand size={18} />{:else}
                <Shrink size={18} />{/if}
            </button>
            {#if $markRoi && currpanel === 3}
              {#if !draw}
                <button
                  on:click={toggleDraw}
                  class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white p-2 absolute bottom-4 left-1/2 -translate-x-1/2 items-center rounded-xl scale-90 z-20"
                  ><PenTool size={22} /></button
                >
              {:else}
                <button
                  on:click={toggleDraw}
                  class="flex gap-2 z-[100] bg-[rgba(0,0,0,.5)] text-white p-2 absolute bottom-4 left-1/2 -translate-x-1/2 items-center rounded-xl scale-90"
                  ><X size={22} /></button
                >{/if}
              {#if draw}
                <canvas
                  id="roicanvas"
                  class="bg-transparent z-50 h-full w-full absolute top-0 left-0"
                ></canvas>
              {/if}
            {/if}
          </div>
        {/key}
      {/each}
    </div>
  {:else}
    <Carousel.Root
      class="w-full h-full flex justify-center items-center"
      opts={{ watchDrag: false }}
    >
      <Carousel.Content class="w-full h-full mx-0 px-0">
        {#each Array(totalPages) as _, pageIndex}
          <Carousel.Item class="h-full w-full px-0 mx-0">
            <div
              class={cn(
                `grid  w-full h-full ${!isAllFullScreen ? "max-h-[calc(100vh-75px)]" : "max-h-screen"} grid-cols-${layoutColumns} grid-rows-${layoutRows}`,
                $selectedNode.maxStreamsPerPage === 13 && "grid-area-13",
                $selectedNode.maxStreamsPerPage === 10 && "grid-area-10",
                $selectedNode.maxStreamsPerPage === 5 && "grid-area-5",
                $selectedNode.maxStreamsPerPage === 7 && "grid-area-7",
              )}
              bind:this={cells}
            >
              {#each Array($selectedNode.maxStreamsPerPage !== 0 && $selectedNode.maxStreamsPerPage !== 5 && $selectedNode.maxStreamsPerPage !== 7 ? $selectedNode.maxStreamsPerPage : $selectedNode.maxStreamsPerPage === 5 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : layoutRows * layoutColumns) as _, slotIndex}
                {#if pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex < streamCount}
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  {#key pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div
                       id={`grid-cell-${ pageIndex *
                        ($selectedNode.maxStreamsPerPage === 5 ||
                        $selectedNode.maxStreamsPerPage === 7
                          ? $selectedNode.maxStreamsPerPage + 1
                          : $selectedNode.maxStreamsPerPage) +
                        slotIndex}`}
                      class="relative h-full"
                      style={$selectedNode.maxStreamsPerPage === 10 &&
                      slotIndex === 0
                        ? "grid-area: bigCell1"
                        : $selectedNode.maxStreamsPerPage === 10 &&
                            slotIndex === 1
                          ? "grid-area: bigCell2"
                          : bigCellIndex === slotIndex
                            ? "grid-area: bigCell1"
                            : ""}
                    >
                      {#if [5, 7, 13].includes($selectedNode.maxStreamsPerPage) && bigCellIndex !== slotIndex}
                        <button
                          on:click={() => setBigCell(slotIndex)}
                          class={`cursor-pointer disabled:cursor-not-allowed absolute rounded top-4 ${isAllFullScreen ? "right-12" : "right-20"} flex-shrink-0 p-1 bg-[rgba(0,0,0,.5)] text-white z-20`}
                        >
                          <AArrowUp size={18} />
                        </button>
                      {/if}
                      <Stream
                        videoElement={videos[
                          $selectedNode.camera[
                            pageIndex *
                              ($selectedNode.maxStreamsPerPage === 5 ||
                              $selectedNode.maxStreamsPerPage === 7
                                ? $selectedNode.maxStreamsPerPage + 1
                                : $selectedNode.maxStreamsPerPage) +
                              slotIndex
                          ].id
                        ]}
                        camera={$selectedNode.camera[
                          pageIndex *
                            ($selectedNode.maxStreamsPerPage === 5 ||
                            $selectedNode.maxStreamsPerPage === 7
                              ? $selectedNode.maxStreamsPerPage + 1
                              : $selectedNode.maxStreamsPerPage) +
                            slotIndex
                        ]}
                        on:h265Error={handleH265Error}
                        on:refErr={handleRefreshError}
                      />

                      {#if $selectedNode.camera[pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex]?.expand?.inference?.lineCrossing === true && $selectedNode.camera[pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex]?.expand?.inference?.lineData.length > 0}
                        <canvas
                          id={`lineCanvas-${
                            pageIndex *
                              ($selectedNode.maxStreamsPerPage === 5 ||
                              $selectedNode.maxStreamsPerPage === 7
                                ? $selectedNode.maxStreamsPerPage + 1
                                : $selectedNode.maxStreamsPerPage) +
                            slotIndex
                          }`}
                          class="absolute top-0 left-0 w-full h-full z-30 pointer-events-none"
                          on:click={(e) => {
                            e.preventDefault();
                          }}
                        ></canvas>
                      {/if}
                      <span
                        class="flex gap-2 bg-[rgba(0,0,0,.5)] text-white py-1 px-3 absolute top-4 left-4 items-center rounded-xl scale-90 z-20"
                      >
                        <span
                          class={`h-2 w-2 ${
                            $selectedNode.camera[
                              pageIndex *
                                ($selectedNode.maxStreamsPerPage === 5 ||
                                $selectedNode.maxStreamsPerPage === 7
                                  ? $selectedNode.maxStreamsPerPage + 1
                                  : $selectedNode.maxStreamsPerPage) +
                                slotIndex
                            ].save === true
                              ? "bg-[#C12828]"
                              : "bg-[#589e67]"
                          } rounded-full`}
                        />
                        <span class="text-xs font-extrabold">
                          {$selectedNode.camera[
                            pageIndex *
                              ($selectedNode.maxStreamsPerPage === 5 ||
                              $selectedNode.maxStreamsPerPage === 7
                                ? $selectedNode.maxStreamsPerPage + 1
                                : $selectedNode.maxStreamsPerPage) +
                              slotIndex
                          ].name}
                        </span>
                      </span>

                      {#if $selectedNode.camera[pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex].personCount}
                        <span
                          class="flex gap-2 scale-75 bg-[rgba(0,0,0,.5)] text-white py-1 px-3 absolute bottom-4 left-4 items-center rounded-xl z-20"
                        >
                          <Users size={18} />
                          {$cameraCounts[
                            $selectedNode.camera[
                              pageIndex *
                                ($selectedNode.maxStreamsPerPage === 5 ||
                                $selectedNode.maxStreamsPerPage === 7
                                  ? $selectedNode.maxStreamsPerPage + 1
                                  : $selectedNode.maxStreamsPerPage) +
                                slotIndex
                            ].id
                          ] ?? "N/A"}
                        </span>
                      {/if}

                      {#if $activeCamera === $selectedNode.camera[pageIndex * ($selectedNode.maxStreamsPerPage === 5 || $selectedNode.maxStreamsPerPage === 7 ? $selectedNode.maxStreamsPerPage + 1 : $selectedNode.maxStreamsPerPage) + slotIndex].id}
                        <div
                          id={`${$activeCamera}-menu`}
                          class="z-20 flex justify-center items-center gap-4 self-end mt-auto absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-gradient-to-bl from-[rgba(217,217,217,.2)] to-[rgba(217,217,217,.1)] border border-solid border-[#d3d3d3]"
                        >
                          <button
                            on:click={() => {
                              if (isSingleFullscreen) {
                                console.log("FULLSCREEN2");
                                exitSingleFullscreen(
                                  pageIndex *
                                    ($selectedNode.maxStreamsPerPage === 5 ||
                                    $selectedNode.maxStreamsPerPage === 7
                                      ? $selectedNode.maxStreamsPerPage + 1
                                      : $selectedNode.maxStreamsPerPage) +
                                    slotIndex,
                                );
                              } else
                                singleFullscreen(
                                  pageIndex *
                                    ($selectedNode.maxStreamsPerPage === 5 ||
                                    $selectedNode.maxStreamsPerPage === 7
                                      ? $selectedNode.maxStreamsPerPage + 1
                                      : $selectedNode.maxStreamsPerPage) +
                                    slotIndex,
                                );
                            }}
                            class=" disabled:cursor-not-allowed rounded bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white cursor-pointer"
                          >
                            {#if !isSingleFullscreen}
                              <Expand size={18} />{:else}
                              <Shrink size={18} />{/if}
                          </button>

                          <button
                            on:click={(e) => {
                              e.preventDefault();
                              handleSingleSS();

                              addUserLog(
                                `user clicked capture single screenshot for camera ${
                                  $selectedNode.camera[
                                    pageIndex *
                                      ($selectedNode.maxStreamsPerPage === 5 ||
                                      $selectedNode.maxStreamsPerPage === 7
                                        ? $selectedNode.maxStreamsPerPage + 1
                                        : $selectedNode.maxStreamsPerPage) +
                                      slotIndex
                                  ].name
                                } having url "${
                                  $selectedNode.camera[
                                    pageIndex *
                                      ($selectedNode.maxStreamsPerPage === 5 ||
                                      $selectedNode.maxStreamsPerPage === 7
                                        ? $selectedNode.maxStreamsPerPage + 1
                                        : $selectedNode.maxStreamsPerPage) +
                                      slotIndex
                                  ].url
                                }"`,
                              );
                            }}
                            class="rounded disabled:cursor-not-allowed bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white cursor-pointer"
                            ><ImageDown size={18} />
                          </button>
                          <button
                            on:click={() => {
                              const cameraId =
                                $selectedNode.camera[
                                  pageIndex *
                                    ($selectedNode.maxStreamsPerPage === 5 ||
                                    $selectedNode.maxStreamsPerPage === 7
                                      ? $selectedNode.maxStreamsPerPage + 1
                                      : $selectedNode.maxStreamsPerPage) +
                                    slotIndex
                                ].id;
                              // console.log(cameraId);
                              refreshVideoStream(cameraId);
                              // addUserLog(`user refreshed video stream for camera ${cameraId}`);
                            }}
                            class="rounded disabled:cursor-not-allowed bg-[rgba(255,255,255,0.1)] backdrop-blur-sm p-1.5 min-h-[36px] min-w-[36px] grid place-items-center text-white cursor-pointer"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        </div>
                      {:else}
                        <button
                          on:click={() => {
                            if (isSingleFullscreen) {
                              console.log("FULLSCREEN3");
                              exitSingleFullscreen(
                                pageIndex *
                                  ($selectedNode.maxStreamsPerPage === 5 ||
                                  $selectedNode.maxStreamsPerPage === 7
                                    ? $selectedNode.maxStreamsPerPage + 1
                                    : $selectedNode.maxStreamsPerPage) +
                                  slotIndex,
                              );
                            } else
                              singleFullscreen(
                                pageIndex *
                                  ($selectedNode.maxStreamsPerPage === 5 ||
                                  $selectedNode.maxStreamsPerPage === 7
                                    ? $selectedNode.maxStreamsPerPage + 1
                                    : $selectedNode.maxStreamsPerPage) +
                                  slotIndex,
                              );
                          }}
                          class="absolute p-1 top-4 right-4 cursor-pointer bg-[rgba(0,0,0,.5)] text-white rounded z-20 disabled:cursor-not-allowed"
                          >{#if !isSingleFullscreen}
                            <Expand size={18} />{:else}
                            <Shrink size={18} />{/if}
                        </button>
                      {/if}

                      {#if !isAllFullScreen}
                        <span
                          class="cursor-grab grab-handle absolute rounded top-4 right-12 flex-shrink-0 p-1 bg-[rgba(0,0,0,.5)] text-white z-20"
                        >
                          <Menu size={18} />
                        </span>
                      {/if}

                      <img
                        src={"/images/moksa.png"}
                        alt="logo"
                        class="object-contain w-[15%] absolute right-4 bottom-4 z-20"
                      />
                    </div>
                  {/key}
                {:else}
                  <div
                    class="h-full w-full relative"
                    style={$selectedNode.maxStreamsPerPage === 13 &&
                    slotIndex === 0
                      ? "grid-area: bigCell1"
                      : $selectedNode.maxStreamsPerPage === 10 &&
                          slotIndex === 0
                        ? "grid-area: bigCell1"
                        : $selectedNode.maxStreamsPerPage === 10 &&
                            slotIndex === 1
                          ? "grid-area: bigCell2"
                          : $selectedNode.maxStreamsPerPage === 5 &&
                              slotIndex === 0
                            ? "grid-area: bigCell1"
                            : $selectedNode.maxStreamsPerPage === 7 &&
                                slotIndex === 0
                              ? "grid-area: bigCell1"
                              : ""}
                  >
                    <AddCameraDialog nodes={data.nodes} sNode={""}>
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <button class=" disabled:cursor-not-allowed">
                        <img
                          on:click={() => {
                            addUserLog(
                              `user clicked on add camera on stream panel`,
                            );
                          }}
                          alt="add camera"
                          src={$mode === "light" && !isAllFullScreen
                            ? "/images/plusLight.png"
                            : "/images/plusDark.png"}
                          class="h-full w-full object-contain scale-50 2xl:scale-[.35] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
                        />
                      </button>
                    </AddCameraDialog>
                  </div>
                {/if}
              {/each}
            </div>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
      <Carousel.Previous
        onClick={handlePrevious}
        class="left-8 disabled:invisible text-bold text-[#015a62] dark:text-white"
      />
      <Carousel.Next
        onClick={handleNext}
        class="right-8 disabled:invisible text-bold text-[#015a62] dark:text-white"
      />
    </Carousel.Root>
  {/if}
{:else}
  <div
    class={`h-full w-full ${streamCount === 0 ? "flex justify-center items-center" : "relative"}`}
  >
    <AddCameraDialog nodes={data.nodes} sNode={""}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <button class="disabled:cursor-not-allowed">
        <img
          on:click={() => {
            addUserLog(`user added first camera through streampanel`);
          }}
          alt="add camera"
          src={$mode === "light"
            ? "/images/plusLight.png"
            : "/images/plusDark.png"}
          class={`h-full w-full object-contain dark:scale-[.40] scale-[.20] ${streamCount === 0 ? "" : "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"}`}
        />
      </button>
    </AddCameraDialog>
  </div>
{/if}

<style>
  .grid {
    display: grid !important;
  }
  .grid-rows-1 {
    grid-template-rows: repeat(1, 100%);
  }
  .grid-rows-2 {
    grid-template-rows: repeat(2, 50%);
  }
  .grid-rows-3 {
    grid-template-rows: repeat(3, 33.33%);
  }
  .grid-rows-4 {
    grid-template-rows: repeat(4, 25%);
  }
  .grid-rows-5 {
    grid-template-rows: repeat(5, 20%);
  }
  .grid-rows-6 {
    grid-template-rows: repeat(6, 16.67%);
  }
  .grid-rows-7 {
    grid-template-rows: repeat(7, 14.29%);
  }
  .grid-rows-8 {
    grid-template-rows: repeat(8, 12.5%);
  }
  .grid-rows-9 {
    grid-template-rows: repeat(9, 11.11%);
  }
  .grid-rows-10 {
    grid-template-rows: repeat(10, 10%);
  }
  .grid-cols-1 {
    grid-template-columns: repeat(1, 100%);
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, 50%);
  }
  .grid-cols-3 {
    grid-template-columns: repeat(3, 33.33%);
  }
  .grid-cols-4 {
    grid-template-columns: repeat(4, 25%);
  }
  .grid-cols-5 {
    grid-template-columns: repeat(5, 20%);
  }
  .grid-cols-6 {
    grid-template-columns: repeat(6, 16.67%);
  }
  .grid-cols-7 {
    grid-template-columns: repeat(7, 14.29%);
  }
  .grid-cols-8 {
    grid-template-columns: repeat(8, 12.5%);
  }
  .grid-cols-9 {
    grid-template-columns: repeat(9, 11.11%);
  }
  .grid-cols-10 {
    grid-template-columns: repeat(10, 10%);
  }
  .grid-area-13 {
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(4, 25%);
    grid-template-areas:
      "bigCell1 bigCell1 . ."
      "bigCell1 bigCell1 . ."
      ". . . ."
      ". . . .";
  }
  .grid-area-10 {
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(4, 25%);
    grid-template-areas:
      "bigCell1 bigCell1 bigCell2 bigCell2"
      "bigCell1 bigCell1 bigCell2 bigCell2"
      ". . . ."
      ". . . .";
  }

  .grid-area-5 {
    grid-template-columns: repeat(3, 33.33%);
    grid-template-rows: repeat(3, 33.33%);
    grid-template-areas:
      "bigCell1 bigCell1 ."
      "bigCell1 bigCell1 ."
      ". . . ";
  }
  .grid-area-7 {
    grid-template-columns: repeat(4, 25%);
    grid-template-rows: repeat(4, 25%);
    grid-template-areas:
      "bigCell1 bigCell1 bigCell1  ."
      "bigCell1 bigCell1 bigCell1  ."
      "bigCell1 bigCell1 bigCell1  ."
      ". . . .";
  }
</style>
