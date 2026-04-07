import React from "react";
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const CATEGORIES = ["Men", "Women", "Girl", "Boy"];
const categoryColors = {
  Men: "bg-blue-100 text-blue-700",
  Women: "bg-pink-100 text-pink-700",
  Girl: "bg-purple-100 text-purple-700",
  Boy: "bg-cyan-100 text-cyan-700",
};

const btnStyles = {
  emerald: "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-200",
  gray: "bg-gray-50 text-gray-600 hover:bg-gray-500 hover:text-white border-gray-200",
  amber: "bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border-amber-200",
  red: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-200",
};

function InlineInput({ name, value, onChange, type = "text" }) {
  return (
    <input
      name={name} type={type} value={value} onChange={onChange}
      className="w-full min-w-[70px] border border-blue-200 bg-blue-50/60 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  );
}

function ActionBtn({ onClick, color, icon, label }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${btnStyles[color]}`}>
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function AddStockTable({ products, editingId, editForm, onEditStart, onEditSave, onEditCancel, onEditChange, onRemove, onConfirmAll }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold">Review List</h2>
        <button onClick={onConfirmAll} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md">
          <CheckIcon className="w-4 h-4" /> Save All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["#", "Article", "Name", "Category", "Qty", "MRP", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p, index) => {
              const isEditing = editingId === p.tempId;
              return (
                <tr key={p.tempId} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                  <td className="px-4 py-3">
                    {isEditing ? <InlineInput name="article" value={editForm.article} onChange={onEditChange} /> : <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{p.article}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <InlineInput name="name" value={editForm.name} onChange={onEditChange} /> : <span className="font-medium text-gray-800">{p.name}</span>}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <select name="category" value={editForm.category} onChange={onEditChange} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[p.category] || "bg-gray-100 text-gray-600"}`}>{p.category}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <InlineInput name="quantity" type="number" value={editForm.quantity} onChange={onEditChange} /> : p.quantity}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? <InlineInput name="mrp" type="number" value={editForm.mrp} onChange={onEditChange} /> : `₹${p.mrp}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <ActionBtn onClick={onEditSave} color="emerald" icon={<CheckIcon className="w-3.5 h-3.5" />} label="Save" />
                          <ActionBtn onClick={onEditCancel} color="gray" icon={<XMarkIcon className="w-3.5 h-3.5" />} label="Cancel" />
                        </>
                      ) : (
                        <>
                          <ActionBtn onClick={() => onEditStart(p)} color="amber" icon={<PencilIcon className="w-3.5 h-3.5" />} label="Edit" />
                          <ActionBtn onClick={() => onRemove(p.tempId)} color="red" icon={<TrashIcon className="w-3.5 h-3.5" />} label="Remove" />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}