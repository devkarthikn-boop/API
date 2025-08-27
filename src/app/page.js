"use client";
import { useState, useRef } from "react";

export default function UploadImage() {
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [file, setFile] = useState(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  // Upload image to server
  const handleUpload = async () => {
    if (!file && !preview) return;

    let base64Data = "";

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        base64Data = reader.result;
        await uploadToServer(base64Data);
      };
    } else if (preview) {
      const canvas = canvasRef.current;
      base64Data = canvas.toDataURL("image/png");
      await uploadToServer(base64Data);
    }
  };

  // Function to send data to API
  const uploadToServer = async (base64Data) => {
    const res = await fetch("/api/photoUpload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: base64Data }),
    });

    const result = await res.json();
    setImageUrl(result.url);
  };

  // Start live capture
  const startCamera = async () => {
    setIsCapturing(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // Capture photo from video
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL("image/png"));
    setIsCapturing(false);

    // Stop camera stream
    const tracks = video.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <input type="file" accept="image/*" onChange={handleFileSelect} />
        <button
          onClick={handleUpload}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Upload
        </button>
      </div>

      <div>
        {!isCapturing ? (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Capture Live Photo
          </button>
        ) : (
          <div>
            <video ref={videoRef} autoPlay className="w-64 h-48 border" />
            <button
              onClick={capturePhoto}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Capture
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} width={300} height={200} className="hidden" />

      {preview && (
        <div>
          <p>Preview:</p>
          <img src={preview} alt="Preview" className="w-64 border" />
        </div>
      )}

     {imageUrl && (
  <div>
    <p>Uploaded Image:</p>
    <img src={imageUrl} alt="Uploaded" width="300" className="mb-2" />
    <p className="text-sm">
      URL:{" "}
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {imageUrl}
      </a>
    </p>
  </div>
)}

    </div>
  );
}
