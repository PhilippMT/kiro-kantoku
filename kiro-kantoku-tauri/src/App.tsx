import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold">Kiro Kantoku (Tauri)</h1>
        <p className="text-gray-400 text-sm">Cross-platform AI Agent Manager</p>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
            <div className="flex gap-2">
              <input
                id="greet-input"
                className="flex-1 bg-gray-700 rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="Enter a name..."
              />
              <button
                type="button"
                onClick={greet}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-medium transition-colors"
              >
                Greet
              </button>
            </div>
            {greetMsg && (
              <p className="mt-4 text-green-400">{greetMsg}</p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Migration Status</h2>
            <div className="space-y-2">
              <StatusItem label="Tauri Backend" status="operational" />
              <StatusItem label="React Frontend" status="operational" />
              <StatusItem label="Tailwind CSS" status="operational" />
              <StatusItem label="ACP Client" status="pending" />
              <StatusItem label="Process Management" status="pending" />
              <StatusItem label="Git Integration" status="pending" />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-gray-400 text-sm">
        <p>Kiro Kantoku - Cross-platform Desktop App built with Tauri + React</p>
      </footer>
    </div>
  );
}

interface StatusItemProps {
  label: string;
  status: "operational" | "pending" | "error";
}

function StatusItem({ label, status }: StatusItemProps) {
  const statusColor = {
    operational: "bg-green-500",
    pending: "bg-yellow-500",
    error: "bg-red-500",
  }[status];

  const statusText = {
    operational: "Operational",
    pending: "Pending",
    error: "Error",
  }[status];

  return (
    <div className="flex items-center justify-between py-2 px-4 bg-gray-700 rounded">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-sm text-gray-400">{statusText}</span>
      </div>
    </div>
  );
}

export default App;
