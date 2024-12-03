<script lang="ts">
  import { onMount } from 'svelte';

  export let videoUrls: string[];
  let currentVideoIndex = 0;
  let videoPlayer: HTMLVideoElement;

  function loadAndPlayVideo(index: number) {
    if (index < videoUrls.length) {
      videoPlayer.src = videoUrls[index];
      videoPlayer.load();
      videoPlayer.play().catch(e => console.error('Error playing video:', e));
    }
  }

  function handleEnded() {
    currentVideoIndex++;
    if (currentVideoIndex < videoUrls.length) {
      loadAndPlayVideo(currentVideoIndex);
    }
  }

  onMount(() => {
    if (videoUrls.length > 0) {
      loadAndPlayVideo(currentVideoIndex);
    }
  });
</script>

<video
  bind:this={videoPlayer}
  id="videoPlayer"
  class="h-full w-full"
  controls
  preload="auto"
  on:ended={handleEnded}
>
  Your browser does not support the video tag.
</video>