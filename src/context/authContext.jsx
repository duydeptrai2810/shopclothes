import { createContext, useState } from 'react';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    // Đọc token và user từ LocalStorage khi trang web vừa tải lại
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    // Hàm login giờ sẽ nhận 2 tham số: token và dữ liệu user
    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Lưu user thành chuỗi JSON
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}