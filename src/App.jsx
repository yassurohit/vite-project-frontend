import { Scanner } from '@yudiel/react-qr-scanner';
import './App.css'

const App = () => {
    return (
<div >
    <h1>QR Scanner</h1>
    <Scanner onScan={(result) => console.log(result)} />
</div>

    );
};

export default App;
