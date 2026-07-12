"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setAccessToken(token);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password });

    setAccessToken(data.access);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    // cookie for middleware (15 min, matches access token lifetime)
    document.cookie = `access_token=${data.access}; path=/; max-age=900`;

    const { data: userData } = await api.get("/accounts/me/", {
      headers: { Authorization: `Bearer ${data.access}` },
    });
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const register = async (username, email, password, password2) => {
    const { data } = await api.post("/accounts/register/", {
      username,
      email,
      password,
      password2,
    });

    setAccessToken(data.access);
    setUser(data.user);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    document.cookie = `access_token=${data.access}; path=/; max-age=900`;
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      await api.post("/auth/logout/", { refresh });
    } catch (_) {
      // still clear client state even if server call fails
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    document.cookie = "access_token=; path=/; max-age=0";
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}