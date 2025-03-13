import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true); 

    const handleScan = (result) => {
        if (result && result !== scanResult) {
            console.log("Scanned QR Code:", result);
            setScanResult(result);
            window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");

            // Close scanner after scanning
            setTimeout(() => {
                setScanResult(null);
                handleClose(); // Close scanner
            }, 1000);
        }
    };

    const handleClose = () => {
        setIsScanning(false);
        window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*"); // Notify Flutter to close iframe
    };

    return (
        isScanning && (
            <div className="scanner-overlay">
                {/* Close Button */}
                <button className="close-button" onClick={handleClose}>❌</button>

                {/* QR Scanner Container */}
                <div className="scanner-box">
                    <h2>Scan QR Code</h2>
                    <Scanner onScan={handleScan} />
                </div>
            </div>
        )
    );
};

export default App;
