import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";

type UserRole = "admin" | "driver";

export function useUserRole() {
  const { user, isLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      setRole(user.role as UserRole);
    }
  }, [user, isLoading]);

  const toggleRole = () => {
    setRole(prevRole => prevRole === "admin" ? "driver" : "admin");
  };

  return {
    role,
    isAdmin: role === "admin",
    isDriver: role === "driver",
    toggleRole,
    isLoading
  };
}
