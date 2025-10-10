import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const EyeTracker = ({ onFatigueUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [fatigue, setFatigue] = useState(null);

  useEffect(() => {
    let camera = null;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(async (results) => {
      if (!canvasRef.current || !results.multiFaceLandmarks) return;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const landmarks = results.multiFaceLandmarks[0];
      drawConnectors(ctx, landmarks, FaceMesh.FACEMESH_TESSELATION, {
        color: "#00FF00",
        lineWidth: 0.5,
      });

      // Send frame to backend every few seconds
      const imageBlob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, "image/jpeg")
      );
      if (imageBlob) sendFrameToBackend(imageBlob);
    });

    const sendFrameToBackend = async (imageBlob) => {
      const formData = new FormData();
      formData.append("file", imageBlob, "frame.jpg");

      try {
        const response = await fetch("http://127.0.0.1:8000/analyze_eye", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log("Fatigue result:", data);

        setFatigue(data?.fatigue_level || "N/A");
        if (onFatigueUpdate) onFatigueUpdate(data);
      } catch (error) {
        console.error("Error sending frame:", error);
      }
    };

    if (typeof window !== "undefined") {
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setLoading(false);
    }

    return () => camera && camera.stop();
  }, [onFatigueUpdate]);

  return (
    <div className="text-center">
      {loading && <p>Loading camera...</p>}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        playsInline
        style={{ display: "none" }}
      ></video>
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="rounded-lg shadow-md border border-gray-300"
      />
      {fatigue && (
        <p className="mt-3 text-lg font-semibold text-blue-600">
          Fatigue Level: {fatigue}
        </p>
      )}
    </div>
  );
};

export default EyeTracker;
