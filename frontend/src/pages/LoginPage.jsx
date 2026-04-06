
import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-6">

      {/* CARD */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10">

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 mb-3">
            <LockClosedIcon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Login
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Enter your credentials to continue
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* USERNAME */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border border-blue-200 bg-blue-50/60 rounded-xl px-4 py-2.5 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                transition-all duration-200"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-blue-200 bg-blue-50/60 rounded-xl px-4 py-2.5 text-sm text-gray-800
                focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                transition-all duration-200"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium
              bg-blue-50 text-blue-700 border-blue-200
              hover:bg-blue-600 hover:text-white hover:border-blue-600
              transition-all duration-150"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}