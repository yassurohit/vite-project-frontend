import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
    const [scanResult, setScanResult] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [cameraAccessible, setCameraAccessible] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [videoDevices, setVideoDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);

    useEffect(() => {
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            setCameraAccessible(false);
            setCameraError("Camera only works over HTTPS or localhost.");
            return;
        }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                setCameraAccessible(true);
                stream.getTracks().forEach(track => track.stop());
            })
            .catch((error) => {
                setCameraAccessible(false);
                setCameraError(error.message);
            });
    }, []);

    useEffect(() => {
        if (!cameraAccessible) return;
        navigator.mediaDevices.enumerateDevices().then(devices => {
            const videos = devices.filter(d => d.kind === "videoinput");
            setVideoDevices(videos);
            if (videos.length > 0) setSelectedDeviceId(videos[0].deviceId);
        });
    }, [cameraAccessible]);

    const handleScan = (result) => {
        if (result && result !== scanResult) {
            setScanResult(result);
            window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");
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
                        <>
                            {videoDevices.length > 1 && (
                                <select
                                    value={selectedDeviceId}
                                    onChange={e => setSelectedDeviceId(e.target.value)}
                                >
                                    {videoDevices.map(device => (
                                        <option key={device.deviceId} value={device.deviceId}>
                                            {device.label || `Camera ${device.deviceId}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <Scanner
                                onScan={handleScan}
                                constraints={
                                    selectedDeviceId
                                        ? { deviceId: { exact: selectedDeviceId } }
                                        : { facingMode: "environment" }
                                }
                            />
                        </>
                    ) : (
                        <p>
                            Camera access required. {cameraError && <span>Error: {cameraError}</span>}
                        </p>
                    )}
                </div>
            </div>
        )
    );
};

export default App;
