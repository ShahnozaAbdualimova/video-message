async function uploadVideo() {
  const blob = new Blob(recordedChunks, { type: "video/webm" });
  const formData = new FormData();
  formData.append("file", blob, "video.webm");

  await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
}
