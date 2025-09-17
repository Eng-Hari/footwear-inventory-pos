

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

export default function Reports() {
  const [sales, setSales] = useState([]);
  const [filter, setFilter] = useState("daily"); // daily, monthly, yearly
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadSales();
  }, [filter]);

  async function loadSales() {
    try {
      const data = await apiRequest(`/sales?filter=${filter}`);
      if (!Array.isArray(data)) throw new Error("Invalid sales data");
      setSales(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sales report");
      setSales([]);
    }
  }

  // Filter sales by date range
  const filteredSales = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return sales.filter((s) => {
      const saleDate = new Date(s.date);
      if (start && saleDate < start) return false;
      if (end && saleDate > end) return false;
      return true;
    });
  }, [sales, startDate, endDate]);

  // Total sales
  const totalSales = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
  }, [filteredSales]);

  // Total invoices
  const totalInvoices = useMemo(() => {
    return filteredSales.length;
  }, [filteredSales]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sales Reports</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="date"
          className="border px-4 py-2 rounded"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span className="font-medium">to</span>
        <input
          type="date"
          className="border px-4 py-2 rounded"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-4 py-2 rounded"
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
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center shadow">
          <p className="text-gray-600 text-sm">Total Sales</p>
          <p className="text-xl font-bold">₹{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center shadow">
          <p className="text-gray-600 text-sm">Total Invoices</p>
          <p className="text-xl font-bold">{totalInvoices}</p>
        </div>
      </div>

      {/* Sales Trend Graph */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-bold mb-2">Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredSales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales Table */}
      <div className="bg-white shadow rounded p-4 overflow-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">S.no</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No sales data.
                </td>
              </tr>
            ) : (
              filteredSales.map((s, index) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(s.date).toLocaleTimeString()}</td>
                  <td className="px-4 py-2 font-medium">₹{(s.total || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

