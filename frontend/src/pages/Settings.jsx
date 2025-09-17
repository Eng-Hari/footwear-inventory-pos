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
      console.log("📥 Settings data received:", data);

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
      console.error("❌ Failed to fetch settings:", err);
      toast.error("Failed to load settings", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!settings.shop_name?.trim()) {
      toast.warn("⚠️ Shop name is required!", { position: "top-center" });
      return;
    }

    if (
      settings.gst_number &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/.test(settings.gst_number)
    ) {
      toast.warn(
        "⚠️ Invalid GST number format (e.g., 22AAAAA0000A1Z5)!",
        { position: "top-center" }
      );
      return;
    }

    if (
      settings.contact_number &&
      !/^\d{10}$/.test(settings.contact_number)
    ) {
      toast.warn("⚠️ Contact number must be 10 digits!", {
        position: "top-center",
      });
      return;
    }

    if (settings.gst_percent < 0 || settings.gst_percent > 28) {
      toast.warn("⚠️ GST % must be between 0 and 28", {
        position: "top-center",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiRequest("/settings", "POST", settings);
      console.log("📤 Settings saved to backend:", settings);

      const updated = {
        ...settings,
        gst_percent: Number(settings.gst_percent) || 0,
      };

      setOriginalSettings(updated);
      localStorage.setItem("shopSettings", JSON.stringify(updated));
      toast.success("✅ Settings saved successfully!", {
        position: "top-center",
      });
    } catch (err) {
      console.error("❌ Failed to save settings:", err);
      toast.error("Failed to save settings", { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (originalSettings) {
      setSettings(originalSettings);
      toast.info("🔄 Settings reset to last saved values", {
        position: "top-center",
      });
    }
  }

  return (
    <div className="p-6 flex justify-center bg-gray-50 min-h-screen">
      <ToastContainer autoClose={2000} />
      <div className="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SettingsIcon size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold">Footwear Inventory</h1>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading settings...</div>
        ) : (
          <>
            {[
              {
                key: "shop_name",
                label: "Shop Name",
                placeholder: "Enter shop name",
                required: true,
              },
              {
                key: "gst_number",
                label: "GST Number",
                placeholder: "Enter GST number (e.g., 22AAAAA0000A1Z5)",
              },
              {
                key: "contact_number",
                label: "Contact Number",
                placeholder: "Enter 10-digit contact number",
              },
              {
                key: "address",
                label: "Address",
                placeholder: "Enter shop address",
              },
            ].map((field) => (
              <div key={field.key} className="mb-4">
                <label className="block mb-1 font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name={field.key}
                  placeholder={field.placeholder}
                  value={settings[field.key] || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, [field.key]: e.target.value })
                  }
                  className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                  disabled={isSaving}
                />
              </div>
            ))}

            {/* GST Percentage */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">
                GST Percentage (%)
              </label>
              <input
                type="number"
                name="gst_percent"
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
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                disabled={isSaving}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded w-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-6 py-2 rounded w-full hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isSaving || !originalSettings}
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

