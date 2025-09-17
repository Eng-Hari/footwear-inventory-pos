import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setErr(null);
    const res = login(form);
    if (res.ok) {
      navigate("/");
    } else {
      setErr(res.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-96 bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Sign in to Footwear POS</h2>
        {err && <div className="text-sm text-red-600 mb-2">{err}</div>}

        <label className="block mb-2">Username</label>
        <input className="w-full border p-2 rounded mb-4" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} />

        <label className="block mb-2">Password</label>
        <input type="password" className="w-full border p-2 rounded mb-4" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />

        <div className="flex justify-between items-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
          <div className="text-sm text-gray-500">Use <strong>admin/admin</strong> or <strong>staff/staff</strong></div>
        </div>
      </form>
    </div>
  );
}
