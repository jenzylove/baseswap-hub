import { Buffer } from "buffer";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Circle App Kit (and other web3 libs) expect Node's Buffer global in the browser.
(globalThis as any).Buffer = (globalThis as any).Buffer ?? Buffer;

createRoot(document.getElementById("root")!).render(<App />);
