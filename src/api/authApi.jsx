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

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi gửi yêu cầu!");
  return data;
};

export const resetPassword = async (resetToken, newPassword) => {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetToken, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Mã xác nhận không hợp lệ!");
  return data;
};

export const changePassword = async (token, oldPassword, newPassword) => {
  const res = await fetch(`${API_URL}/change-password`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi đổi mật khẩu!");
  return data;
};