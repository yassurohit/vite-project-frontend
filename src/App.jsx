import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScannerActive, setIsScannerActive] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [useDeviceId, setUseDeviceId] = useState(false);
    const [cameraAccessible, setCameraAccessible] = useState(true);
    const [cameraError, setCameraError] = useState("");
    const [scannerKey, setScannerKey] = useState(0); // To force remount on fallback

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

    const handleClose = () => {
        setIsProcessing(false);
        window.parent.postMessage({ type: "CLOSE_SCANNER" }, "*");
        setIsScannerActive(false);
        setScanResult(null);
    };

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

    const handleDeviceChange = (e) => {
        const deviceId = e.target.value;
        setSelectedDeviceId(deviceId);
        setUseDeviceId(!!deviceId);
        setScannerKey((prev) => prev + 1); // force remount of Scanner
    };

    const handleScannerError = (err) => {
        console.error("Scanner error:", err);
        if (err.name === "OverconstrainedError" || err.name === "NotReadableError") {
            // fallback to default camera
            setUseDeviceId(false);
            setSelectedDeviceId("");
            setScannerKey((prev) => prev + 1); // force remount with fallback
        }
    };

    if (!cameraAccessible) {
        return (
            <div className="scanner-overlay">
                <div className="scanner-box">
                    <button className="close-button" onClick={handleClose}><span>❌</span></button>
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
                <button className="close-button" onClick={handleClose}><span>❌</span></button>
                <h2>QR Scanner</h2>

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

                <Scanner
                    key={scannerKey}
                    onScan={handleScan}
                    onError={handleScannerError}
                    constraints={
                        useDeviceId && selectedDeviceId
                            ? { deviceId: { exact: selectedDeviceId } }
                            : { facingMode: "environment" }
                    }
                />
            </div>
        </div>
    ) : null;
};

export default App;
