import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const accessToken = localStorage.getItem("foodkindl_access");

    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me/");
      setUser(response.data);
    } catch (error) {
      console.error("Unable to load user:", error.response?.data || error);

      localStorage.removeItem("foodkindl_access");
      localStorage.removeItem("foodkindl_refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  async function login(email, password) {
    const response = await api.post("/auth/login/", {
      email: email.trim().toLowerCase(),
      password,
    });

    const { access, refresh, user: loggedInUser } = response.data;

    localStorage.setItem("foodkindl_access", access);
    localStorage.setItem("foodkindl_refresh", refresh);

    setUser(loggedInUser);

    return loggedInUser;
  }

  async function register(payload) {
    const registrationResponse = await api.post("/auth/register/", {
      first_name: payload.first_name.trim(),
      last_name: payload.last_name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });

    await login(payload.email, payload.password);

    return registrationResponse.data;
  }

  function logout() {
    localStorage.removeItem("foodkindl_access");
    localStorage.removeItem("foodkindl_refresh");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      reloadUser: loadUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}