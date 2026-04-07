import React from "react";
import { PlusIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const CATEGORIES = ["Men", "Women", "Girl", "Boy"];

export function InputField({ name, placeholder, type = "text", value, onChange, className = "" }) {
  return (
    <div className={`relative group ${className}`}>
      <input
        name={name}
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        className="peer w-full bg-white border border-gray-200 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800 placeholder-transparent
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200
          hover:border-gray-300 shadow-sm"
      />
      <label className="absolute left-4 top-1.5 text-[11px] font-semibold text-blue-500 uppercase tracking-wider
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal
        peer-placeholder-shown:text-gray-400 peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
        peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-blue-500
        peer-focus:uppercase peer-focus:tracking-wider transition-all duration-200 pointer-events-none">
        {placeholder}
      </label>
    </div>
  );
}

export function CategorySelect({ value, onChange, className = "" }) {
  return (
    <div className={`relative group ${className}`}>
      <select
        name="category"
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 pt-5 pb-2 text-sm text-gray-800
          focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200
          hover:border-gray-300 shadow-sm appearance-none cursor-pointer"
      >
        <option value="" disabled></option>
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <label className={`absolute left-4 top-1.5 text-[11px] font-semibold uppercase tracking-wider pointer-events-none transition-all duration-200
        ${value ? "text-blue-500" : "top-3.5 text-sm font-normal text-gray-400 normal-case tracking-normal"}`}>
        {value ? "Category" : "Select Category"}
      </label>
    </div>
  );
}

export function DuplicateAlert({ onForce, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-100 max-w-md w-full p-6 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1">Duplicate Product Detected</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A product with the <strong>same article, name, category, color, size, MRP, and purchase price</strong> already exists.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onForce} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-200 transition-all">
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddStockForm({ form, onChange, onSubmit }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Product Details
        </h2>
      </div>
      <form onSubmit={onSubmit} className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <InputField name="article" placeholder="Article No." value={form.article} onChange={onChange} />
          <InputField name="name" placeholder="Product Name" value={form.name} onChange={onChange} className="sm:col-span-2" />
          <CategorySelect value={form.category} onChange={onChange} />
          <InputField name="color" placeholder="Color" value={form.color} onChange={onChange} />
          <InputField name="size" placeholder="Size" value={form.size} onChange={onChange} />
          <InputField name="quantity" placeholder="Quantity" type="number" value={form.quantity} onChange={onChange} />
          <InputField name="mrp" placeholder="MRP (₹)" type="number" value={form.mrp} onChange={onChange} />
          <InputField name="purchase_price" placeholder="Purchase Price (₹)" type="number" value={form.purchase_price} onChange={onChange} />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
          <PlusIcon className="w-5 h-5" /> Add to Review List
        </button>
      </form>
    </div>
  );
}