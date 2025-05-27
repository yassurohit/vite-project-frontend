import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [cameraAccessible, setCameraAccessible] = useState(false);

    useEffect(() => {
        // Check for camera access before initializing scanner
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                console.log("Camera access granted!");
                setCameraAccessible(true);
                stream.getTracks().forEach(track => track.stop());
            })
            .catch((error) => {
                console.error("Camera access denied:", error);
                setCameraAccessible(false);
            });
    }, []);

    const handleScan = (result) => {
        if (result && result !== scanResult) {
            console.log("Scanned QR Code:", result);
            setScanResult(result);
            window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");

            // Close scanner after scanning
            setTimeout(() => {
                setScanResult(null);
                handleClose();
            }, 1000);
        }
    };

    const handleClose = () => {
        setIsScanning(false);
        window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*");
    };

    return (
        isScanning && (
            <div className="scanner-overlay">
                <button className="close-button" onClick={handleClose}>❌</button>

                <div className="scanner-box">
                    <h2>Scan QR Code</h2>
                    {cameraAccessible ? (
                        <Scanner onScan={handleScan} constraints={{ facingMode: "environment" }} />
                    ) : (
                        <p>Camera access required. Please allow permissions.</p>
                    )}
                </div>
            </div>
        )
    );
};

export default App;
