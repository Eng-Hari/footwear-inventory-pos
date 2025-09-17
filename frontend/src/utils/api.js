// // src/api.js
// import { toast } from "react-toastify";

// export async function apiRequest(url, method = "GET", body) {
//   try {
//     const res = await fetch(`http://localhost:3000${url}`, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: body ? JSON.stringify(body) : undefined,
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => ({}));
//       const message = errData.error || `API error: ${res.status}`;
//       toast.error(message);
//       throw new Error(message);
//     }

//     return await res.json();
//   } catch (error) {
//     toast.error(error.message || "Unknown API error");
//     throw error;
//   }
// }
export async function apiRequest(endpoint, method = "GET", data = null) {
  const url = `http://localhost:3000${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ API request failed: ${endpoint}`, error);
    throw error;
  }
}