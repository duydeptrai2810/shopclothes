// File: src/api/userApi.jsx
const API_URL = "http://localhost:3000/api/users";

export const getMyProfile = async (token) => {
  const res = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tải thông tin!");
  return data;
};

export const updateProfile = async (token, profileData) => {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi cập nhật!");
  return data;
};

export const uploadAvatar = async (token, file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${API_URL}/profile/avatar`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }, // Không set Content-Type, trình duyệt tự xử lý boundary cho FormData
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi tải ảnh lên!");
  return data;
};