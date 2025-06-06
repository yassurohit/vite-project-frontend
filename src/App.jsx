import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScannerActive, setIsScannerActive] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);

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

    // Fetch available video input devices
    useEffect(() => {
        const getDevices = async () => {
            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
                setDevices(videoDevices);

                if (videoDevices.length > 0) {
                    // Try to auto-select back camera
                    const backCamera = videoDevices.find(device => 
                        device.label.toLowerCase().includes('back') || 
                        device.label.toLowerCase().includes('rear')
                    );

                    if (backCamera) {
                        setSelectedDeviceId(backCamera.deviceId);
                    } else {
                        // fallback: first device
                        setSelectedDeviceId(videoDevices[0].deviceId);
                    }
                }
            } catch (err) {
                console.error("Error fetching video devices", err);
            }
        };

        getDevices();
    }, []);

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

    const handleDeviceChange = (e) => {
        setSelectedDeviceId(e.target.value);
    };

    return (
        isScannerActive ? (
            <div className="scanner-overlay">
                <div className="scanner-box">
                    <button className="close-button" onClick={handleClose}><span>❌</span></button>
                    <h2>QR Scanner</h2>

                    {devices.length > 1 && (
                        <select value={selectedDeviceId} onChange={handleDeviceChange}>
                            {devices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId}`}
                                </option>
                            ))}
                        </select>
                    )}

                    {selectedDeviceId && (
                        <Scanner 
                            onScan={handleScan}
                            deviceId={selectedDeviceId}
                        />
                    )}
                </div>
            </div>
        ) : null
    );
};

export default App;
