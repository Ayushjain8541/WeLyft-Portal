import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, navigate] = useLocation();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      window.location.href = "/api/logout";
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  function logout() {
    logoutMutation.mutate();
  }

  // If there's an authentication error and we're not on the login page or home page, redirect to login
  useEffect(() => {
    const pathname = window.location.pathname;
    if (error && !pathname.match(/^\/(login|)$/)) {
      navigate("/login");
    }
  }, [error, navigate]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
