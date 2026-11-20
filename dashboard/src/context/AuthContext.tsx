import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Role } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasRole: (roles: Role | Role[]) => boolean;
  canAccessZone: (zoneName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("wt_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZoneState] = useState<string>("All Zones");

  // Restore session on initial load
  useEffect(() => {
    function checkAuth() {
      const storedToken = localStorage.getItem("wt_token");
      const storedUser = localStorage.getItem("wt_user");
      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        if (parsedUser.role === "SUPER_ADMIN") {
          const savedZone = localStorage.getItem("wt_selected_zone") || "All Zones";
          setSelectedZoneState(savedZone);
        } else {
          setSelectedZoneState(parsedUser.zoneName || "Peelamedu");
        }
      } catch (err) {
        console.error("Failed to restore user from storage:", err);
        localStorage.removeItem("wt_token");
        localStorage.removeItem("wt_user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const setSelectedZone = (zone: string) => {
    if (user?.role === "SUPER_ADMIN") {
      setSelectedZoneState(zone);
      localStorage.setItem("wt_selected_zone", zone);
    } else {
      console.warn("Attempt to change zone rejected: User is restricted to assigned zone.");
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uname: username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || "Authentication failed" };
      }

      // Map backend role to frontend Role type
      const roleMap: Record<string, Role> = {
        "SuperAdmin": "SUPER_ADMIN",
        "Admin": "ADMIN",
        "User": "USER"
      };
      
      const mappedRole = roleMap[data.role] || "USER";

      const userData: User = {
        id: data.accountId,
        userId: data.accountId.toString(),
        name: data.name || username,
        email: "",
        role: mappedRole,
        zoneId: data.zoneId,
        zoneName: data.zoneName,
        terminal: "",
        status: 'ACTIVE',
        jobTitle: data.role
      };

      localStorage.setItem("wt_token", data.accessToken);
      localStorage.setItem("wt_refresh_token", data.refreshToken);
      localStorage.setItem("wt_user", JSON.stringify(userData));
      
      setToken(data.accessToken);
      setUser(userData);

      if (mappedRole === "SUPER_ADMIN") {
        setSelectedZoneState("All Zones");
      } else {
        setSelectedZoneState(data.zoneName || "Peelamedu");
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error connecting to WasteTrack authentication server." };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        const refreshToken = localStorage.getItem("wt_refresh_token");
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      localStorage.removeItem("wt_token");
      localStorage.removeItem("wt_refresh_token");
      localStorage.removeItem("wt_user");
      localStorage.removeItem("wt_selected_zone");
      setToken(null);
      setUser(null);
      setSelectedZoneState("All Zones");
    }
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    if (!user) return false;
    const allowed = Array.isArray(roles) ? roles : [roles];
    return allowed.includes(user.role);
  };

  const canAccessZone = (zoneName: string): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return user.zoneName?.toLowerCase() === zoneName.toLowerCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        selectedZone,
        setSelectedZone,
        login,
        logout,
        hasRole,
        canAccessZone
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
