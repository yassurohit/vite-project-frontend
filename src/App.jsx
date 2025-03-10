import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);

    const handleScan = (result) => {
        if (result && result !== scanResult) {
            console.log("Scanned QR Code:", result);
            setScanResult(result); // Save the scanned result
            window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");

            // Reset scanner after 1 second (adjust time if needed)
            setTimeout(() => setScanResult(null), 1000);
        }
    };

    return (
        <div className="scanner-container">
            <h1>QR Scanner</h1>
            <Scanner onScan={handleScan} />
        </div>
    );
};

export default App;
