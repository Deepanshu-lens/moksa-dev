<script type='ts'>
  import { onDestroy, onMount } from 'svelte';
  import Hls from 'hls.js';

  export let videoPath;
  let video;
  let hls;

  onMount(() => {
    if (videoPath) {
      if (videoPath.endsWith('.m3u8')) {
        // Handle .m3u8 files with HLS.js
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(videoPath);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(e => console.error('Error auto-playing video:', e));
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For browsers that natively support HLS (like Safari)
          video.src = videoPath;
          video.addEventListener('loadedmetadata', function() {
            video.play().catch(e => console.error('Error auto-playing video:', e));
          });
        }
      } else {
        // For other video formats
        video.src = videoPath;
      }
    }
  });

  function handleError(event) {
    console.error('Error playing video:', event);
  }

  onDestroy(() => {
    if (hls) {
      hls.destroy();
    }
  });
</script>

<video class='h-full w-full' id='awsvid'
  bind:this={video} 
  controls 
  on:error={handleError}
>
  Your browser does not support the video tag.
</video>