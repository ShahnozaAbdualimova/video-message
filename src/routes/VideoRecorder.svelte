<script>
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';

  let videoElement;
  let videoStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let videoUrl = '';
  const isModalOpen = writable(false);
  let isRecording = false;
  let isVideoPlaying = false;
  let recordingTime = 0; 
  let playbackProgress = 0; 
  let videoDuration = 0; 

  async function openModal() {
    isModalOpen.set(true);
    await startRecording();
  }

  function closeModal() {
    stopRecording();
    isModalOpen.set(false);
  }

  async function startRecording() {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (videoElement) {
      videoElement.srcObject = videoStream;
      videoElement.play();
    }
    mediaRecorder = new MediaRecorder(videoStream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      videoUrl = URL.createObjectURL(blob);
      videoDuration = Math.round(recordingTime); 
    };

    mediaRecorder.start();
    isRecording = true;

    recordingTime = 0;
    const timer = setInterval(() => {
      recordingTime += 1; 
      if (recordingTime >= 60) { 
        stopRecording();
        clearInterval(timer); 
      }
    }, 1000);
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      videoStream.getTracks().forEach((track) => track.stop());
    }
    isRecording = false;
  }

  function handleIconMouseDown() {
    openModal();
  }

  function handleIconMouseUp() {
    closeModal();
  }

  function playWithSound() {
    isVideoPlaying = true;
    const videoEl = document.getElementById('saved-video');
    if (videoEl) {
      videoEl.muted = false;
      videoEl.currentTime = 0;
      videoEl.play();

      videoEl.ontimeupdate = () => {
        playbackProgress = (videoEl.currentTime / videoEl.duration) * 100; 
      };

      videoEl.addEventListener('ended', () => {
        isVideoPlaying = false;
        playbackProgress = 0; 
      });
    }
  }
</script>

<span
  class="camera-icon"
  on:mousedown={handleIconMouseDown}
  on:mouseup={handleIconMouseUp}
>
  📷
</span>

{#if $isModalOpen}
  <div class="modal" on:click={closeModal} transition:fade>
    <div class="modal-content" on:click|stopPropagation>
      <video bind:this={videoElement} playsinline muted autoplay></video>
    </div>
  </div>
{/if}

{#if videoUrl}
  <video
    id="saved-video"
    class:small-video={!isVideoPlaying}
    class:large-video={isVideoPlaying}
    muted
    autoplay
    loop={!isVideoPlaying}
    src={videoUrl}
    style="border: 5px solid hsl({playbackProgress}, 100%, 50%)"
    on:click={playWithSound}
  ></video>
  <h3>{videoDuration}</h3>
{/if}

<h1 class="styled-heading">About <span class="highlighted">Furniture</span></h1>
<style>
  .styled-heading {
  font-family: 'Playfair Display', serif;
  font-weight: bold;
}

.highlighted {
  position: relative;
  display: inline-block;
}

.highlighted::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -5px; /* Adjust this to move the line closer or farther */
  width: 100%;
  height: 2px; /* Thickness of the underline */
  background-color: #0000FF; /* Blue color for the underline */
}

</style>
