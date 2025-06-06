import { Scanner } from "@yudiel/react-qr-scanner";
import "./App.css";

const App = () => {
  return (
    <div className="scanner-overlay">
      <div className="scanner-box">
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
              facingMode: { ideal: "environment" }, // back camera preferred
            },
          }}
        />
      </div>
    </div>
  );
};

export default App;
