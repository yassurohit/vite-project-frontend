import { Scanner } from '@yudiel/react-qr-scanner';
import './App.css';

const App = () => {
    const handleScan = (result) => {
        if (result) {
            console.log("Scanned QR Code:", result);
            // Send result to Flutter web app
            window.parent.postMessage({ type: "QR_SCAN_RESULT", data: result }, "*");
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
