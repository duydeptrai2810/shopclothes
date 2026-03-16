import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
export default function ProtectedRoute({ children }) {

    const { token } = useContext(AuthContext);

    if(!token){
        return <Navigate to="/auth" />;
    }

    return children;
}