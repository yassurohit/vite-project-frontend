import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);

  const handleClose = () => {
    setSelectedDeviceId(null);
  };

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((device) => device.kind === "videoinput");
        setVideoDevices(videoInputs);
      })
      .catch((error) => {
        console.error("Error fetching video devices:", error);
      });
  }, []);

  const handleCameraChange = (deviceId) => {
    setSelectedDeviceId(deviceId);
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-box">
        <button className="close-button" onClick={handleClose}>
          <span>❌</span>
        </button>

        <h2>QR Scanner</h2>

        {/* Camera selection dropdown */}
        {videoDevices.length > 1 && (
          <select defaultValue="" onChange={(e) => handleCameraChange(e.target.value)}>
            <option value="">Default Camera</option>
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        )}

        {/* QR Scanner */}
        <Scanner
          onScan={(result) => {
            console.log("Scanned result:", result);
          }}
          onError={(error) => {
            console.error("Scanner error:", error);
          }}
          constraints={
            selectedDeviceId
              ? { video: { deviceId: { exact: selectedDeviceId } } }
              : { video: { facingMode: "environment" } }
          }
        />
      </div>
    </div>
  );
};

export default App;
