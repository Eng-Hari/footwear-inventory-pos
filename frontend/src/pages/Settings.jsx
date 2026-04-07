
import { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    shop_name: "",
    gst_number: "",
    contact_number: "",
    address: "",
    gst_percent: 0,
  });

  const [originalSettings, setOriginalSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const data = await apiRequest("/settings");

      const safeData = {
        shop_name: data.shop_name || "",
        gst_number: data.gst_number || "",
        contact_number: data.contact_number || "",
        address: data.address || "",
        gst_percent: Number(data.gst_percent) || 0,
      };

      setSettings(safeData);
      setOriginalSettings(safeData);
      localStorage.setItem("shopSettings", JSON.stringify(safeData));
    } catch (err) {
      toast.error("Failed to load settings", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!settings.shop_name?.trim()) {
      toast.warn("Shop name is required!", { position: "top-right" });
      return;
    }

    if (
      settings.gst_number &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/.test(settings.gst_number)
    ) {
      toast.warn("Invalid GST number format!", { position: "top-right" });
      return;
    }

    if (
      settings.contact_number &&
      !/^\d{10}$/.test(settings.contact_number)
    ) {
      toast.warn("Contact number must be 10 digits!", {
        position: "top-right",
      });
      return;
    }

    const gst = Number(settings.gst_percent);

    if (isNaN(gst) || gst < 0 || gst > 28) {
      toast.warn("GST % must be between 0 and 28", {
        position: "top-right",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest("/settings", "POST", settings);

      const updated = {
        ...settings,
        gst_percent: Number(settings.gst_percent) || 0
      };

      setOriginalSettings(updated);
      localStorage.setItem("shopSettings", JSON.stringify(updated));

      toast.success("Settings saved successfully!", {
        position: "top-right",
      });
    } catch {
      toast.error("Failed to save settings", { position: "top-right" });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (originalSettings) {
      setSettings(originalSettings);
      toast.info("Settings reset", { position: "top-right" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 p-4 sm:p-8">
      <ToastContainer autoClose={1500} />

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
          <SettingsIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage shop details & configuration
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10">
            Loading settings...
          </div>
        ) : (
          <>
            {/* INPUT FIELDS */}
            {[
              { key: "shop_name", label: "Shop Name", required: true },
              { key: "gst_number", label: "GST Number" },
              { key: "contact_number", label: "Contact Number" },
              { key: "address", label: "Address" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={settings[field.key] || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      [field.key]: e.target.value,
                    })
                  }
                  disabled={isSaving}
                  className="w-full border border-blue-200 bg-blue-50/60 rounded-lg px-3 py-2 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                    transition-all disabled:bg-gray-100"
                />
              </div>
            ))}

            {/* GST */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                GST Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="28"
                step="0.1"
                value={settings.gst_percent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    gst_percent: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={isSaving}
                className="w-full border border-blue-200 bg-blue-50/60 rounded-lg px-3 py-2 text-sm text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                  transition-all disabled:bg-gray-100"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                  ${isSaving
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                  }`}
              >
                {isSaving ? "Saving…" : "Save Settings"}
              </button>

              <button
                onClick={handleReset}
                disabled={isSaving || !originalSettings}
                className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl border text-sm font-medium transition-all
                  ${isSaving || !originalSettings
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-500 hover:text-white hover:border-gray-500"
                  }`}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}