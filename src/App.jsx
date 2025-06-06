import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  const [isScannerActive, setIsScannerActive] = useState(true);

  const handleClose = () => {
    setIsScannerActive(false);
    window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*"); // notify parent iframe
  };

  const handleScan = (result) => {
    if (result) {
      console.log("Scanned Result:", result);
      window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*"); // send result to parent iframe
      handleClose(); // close camera after successful scan
    }
  };

  return (
    isScannerActive && (
      <div className="scanner-overlay">
        <div className="scanner-box">
          {/* Cancel button */}
          <button className="close-button" onClick={handleClose}>
            <span>❌</span>
          </button>

          <h2>QR Scanner</h2>

          <Scanner
            onScan={handleScan}
            onError={(error) => {
              console.error("Scanner error:", error);
            }}
            constraints={{
              video: {
                facingMode: { ideal: "environment" },
              },
            }}
          />
        </div>
      </div>
    )
  );
};

export default App;
