
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