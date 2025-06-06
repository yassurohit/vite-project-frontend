import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // On mount, check camera access
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setCameraAccessible(true);
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setCameraAccessible(false);
        setCameraError("Camera permission is required to scan QR codes.");
      });
  }, []);

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

        {/* Scanner */}
        <Scanner
          onScan={handleScan}
          constraints={{ facingMode: "environment" }}
          onError={(error) => {
            console.error("Scanner error:", error);
          }}
        />
      </div>
    </div>
  ) : null;
};

export default App;
