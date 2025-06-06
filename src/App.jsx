import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [useDeviceId, setUseDeviceId] = useState(false); // Only use deviceId after user selects
  const [cameraAccessible, setCameraAccessible] = useState(true);
  const [cameraError, setCameraError] = useState("");

  // Handle scan result
  const handleScan = (result) => {
    if (result && result !== scanResult && !isProcessing) {
      setIsProcessing(true);
      setScanResult(result);
      window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");
      setIsScannerActive(false);
      setTimeout(() => {
        handleClose();
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Close scanner and notify parent iframe
  const handleClose = () => {
    setIsProcessing(false);
    window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*");
    setIsScannerActive(false);
    setScanResult(null);
  };

  // Listen for messages from parent iframe to open/close scanner
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === "START_SCANNER") {
        setIsScannerActive(true);
      } else if (event.data.type === "STOP_SCANNER") {
        setIsScannerActive(false);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // On mount, check camera access and list video devices
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setCameraAccessible(true);
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(videoInputs);
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraAccessible(false);
        setCameraError("Camera permission is required to scan QR codes.");
      });
  }, []);

  // Handle camera selection from dropdown
  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    // Validate deviceId exists in current videoDevices list
    if (videoDevices.find((d) => d.deviceId === deviceId)) {
      setSelectedDeviceId(deviceId);
      setUseDeviceId(!!deviceId);
    } else {
      // Fallback to default if invalid deviceId selected
      setSelectedDeviceId("");
      setUseDeviceId(false);
    }
  };

  if (!cameraAccessible) {
    return (
      <div className="scanner-overlay">
        <div className="scanner-box">
          <button className="close-button" onClick={handleClose}>
            <span>❌</span>
          </button>
          <h2>QR Scanner</h2>
          <p style={{ color: "red" }}>{cameraError}</p>
          <p>Please allow camera access and refresh the page.</p>
        </div>
      </div>
    );
  }

  return isScannerActive ? (
    <div className="scanner-overlay">
      <div className="scanner-box">
        <button className="close-button" onClick={handleClose}>
          <span>❌</span>
        </button>
        <h2>QR Scanner</h2>

        {/* Camera Switcher */}
        {videoDevices.length > 1 && (
          <select value={selectedDeviceId} onChange={handleDeviceChange}>
            <option value="">Default (Back Camera)</option>
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
        )}

        {/* Scanner */}
        <Scanner
          onScan={handleScan}
          constraints={
            useDeviceId && selectedDeviceId
              ? { deviceId: { exact: selectedDeviceId } }
              : { facingMode: "environment" }
          }
          onError={(error) => {
            console.error("Scanner error:", error);
            if (error.name === "OverconstrainedError") {
              // Fallback to default camera on error
              setUseDeviceId(false);
              setSelectedDeviceId("");
            }
          }}
        />
      </div>
    </div>
  ) : null;
};

export default App;
