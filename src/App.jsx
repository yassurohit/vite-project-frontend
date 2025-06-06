import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScannerActive, setIsScannerActive] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleScan = (result) => {
        if (result && result !== scanResult  && !isProcessing) {
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
    const handleClose = () => {
        setIsProcessing(false); 
        window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*");
        setIsScannerActive(false);
        setScanResult(null);
    };
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === "START_SCANNER") {
                if (!isScannerActive) {
                    setIsScannerActive(true);
                }
            } else if (event.data.type === "STOP_SCANNER") {
                setIsScannerActive(false);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [isScannerActive]);
    return (
        isScannerActive ? (
            <div className="scanner-overlay">
                <div className="scanner-box">
                    <button className="close-button" onClick={handleClose}><span>❌</span></button>
                    <h2>QR Scanner</h2>
                    { <Scanner onScan={handleScan} />}
                </div>
            </div>
        ) : null 
    );
};  


export default App;
