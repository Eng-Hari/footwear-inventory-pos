
import { useEffect, useState, useMemo } from "react";
import { apiRequest } from "../utils/api";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartBarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadSales();
  }, [filter]);

  async function loadSales() {
    try {
      const data = await apiRequest(`/sales?filter=${filter}`);
      if (!Array.isArray(data)) throw new Error("Invalid data");
      setSales(data);
    } catch {
      toast.error("Failed to load sales report");
      setSales([]);
    }
  }

  const filteredSales = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return sales.filter((s) => {
      const d = new Date(s.date);
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  const totalSales = useMemo(
    () => filteredSales.reduce((a, s) => a + (s.total || 0), 0),
    [filteredSales]
  );

  const totalInvoices = filteredSales.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Sales Reports
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Analyze your sales performance
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">

        {/* DATE INPUT */}
        <Input type="date" value={startDate} onChange={setStartDate} />
        <span className="text-sm text-gray-400">to</span>
        <Input type="date" value={endDate} onChange={setEndDate} />

        {/* FILTER */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-blue-200 bg-blue-50/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
          }}
          className="text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Sales" value={`₹${totalSales.toFixed(2)}`} />
        <StatCard label="Invoices" value={totalInvoices} />
      </div>

      {/* CHART */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Sales Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold">
          Sales List
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "Date", "Time", "Amount"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-gray-400">
                    No sales data
                  </td>
                </tr>
              ) : (
                filteredSales.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-blue-50/40`}
                  >
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(s.date).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{(s.total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* INPUT */
function Input({ type, value, onChange }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-blue-200 bg-blue-50/60 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  );
}

/* STAT CARD */
function StatCard({ label, value }) {
  return (
    <div className="bg-blue-50 rounded-2xl px-4 py-4 border border-white shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-blue-600">{value}</p>
    </div>
  );
}