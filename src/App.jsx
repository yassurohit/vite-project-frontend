import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  const [isScannerActive, setIsScannerActive] = useState(true);

  const handleClose = () => {
    setIsScannerActive(false);
  };

  return (
    isScannerActive && (
      <div className="scanner-overlay">
        <div className="scanner-box">
          {/* Cancel button with span */}
          <button className="close-button" onClick={handleClose}>
            <span>❌</span>
          </button>

          <h2>QR Scanner</h2>

          <Scanner
            onScan={(result) => {
              console.log("Scanned Result:", result);
            }}
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
