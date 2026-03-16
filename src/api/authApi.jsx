const API_URL = "http://localhost:3000/api/auth";

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });


  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Lỗi đăng nhập");
  }

  return data;
};

export const register = async (username, email, password) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password }) // Đổi name thành username
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Lỗi đăng ký");
  }

  return data;
};