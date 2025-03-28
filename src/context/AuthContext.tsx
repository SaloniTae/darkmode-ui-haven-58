
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type ServiceType = "crunchyroll" | "netflix" | "prime";

interface AuthContextType {
  isAuthenticated: boolean;
  currentService: ServiceType | null;
  user: User | null;
  session: Session | null;
  login: (username: string, password: string, service: ServiceType) => Promise<void>;
  signup: (username: string, password: string, token: string, service: ServiceType) => Promise<void>;
  logout: () => Promise<void>;
  generateToken: (service: ServiceType) => Promise<string | null>;
  isAdmin: boolean;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentService: React.Dispatch<React.SetStateAction<ServiceType | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          const service = currentSession.user?.user_metadata?.service as ServiceType;
          setCurrentService(service || null);
          setIsAdmin(service === 'crunchyroll');
          
          if (location.pathname === '/login') {
            navigate(`/${service}`, { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setCurrentService(null);
          setIsAdmin(false);
          
          if (location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
      }
    );

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          const service = data.session.user?.user_metadata?.service as ServiceType;
          setCurrentService(service || null);
          setIsAdmin(service === 'crunchyroll');
          
          console.log("Session found for:", data.session.user?.email, "service:", service);
          
          if (location.pathname === '/login' && service) {
            navigate(`/${service}`, { replace: true });
          }
        } else {
          console.log("No existing session found");
          
          if (location.pathname !== '/login' && !location.pathname.includes('/login')) {
            navigate('/login', { replace: true });
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const login = async (username: string, password: string, service: ServiceType) => {
    try {
      const email = username.includes('@') ? username : `${username}@example.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user?.user_metadata?.service !== service) {
        await supabase.auth.signOut();
        toast.error(`You are not authorized to access the ${service} dashboard`);
        return;
      }

      toast.success(`Logged in to ${service} dashboard successfully!`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    }
  };

  const signup = async (username: string, password: string, token: string, service: ServiceType) => {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('service', service)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        toast.error("Invalid or expired token");
        return;
      }

      const email = username.includes('@') ? username : `${username}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            service
          }
        }
      });

      if (error) {
        throw error;
      }

      await supabase
        .from('tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      toast.success(`Signed up to ${service} dashboard successfully!`);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to signup");
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  const generateToken = async (service: ServiceType): Promise<string | null> => {
    try {
      if (currentService !== 'crunchyroll') {
        toast.error("Only Crunchyroll admin can generate tokens");
        return null;
      }

      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('tokens')
        .insert([{ 
          token, 
          service,
          used: false,
          created_by: user?.id || null
        }]);

      if (error) {
        console.error("Token generation error:", error);
        toast.error(`Failed to generate token: ${error.message}`);
        return null;
      }

      toast.success(`Generated token for ${service}`);
      return token;
    } catch (error: any) {
      console.error("Token generation error:", error);
      toast.error(error.message || "Failed to generate token");
      return null;
    }
  };

  const updateUsername = async (newUsername: string): Promise<void> => {
    try {
      // Only update the user_metadata with the new username
      // Do not try to update the email address which is causing validation issues
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });

      if (error) {
        throw error;
      }

      // Update the local user state to reflect the username change
      if (user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            username: newUsername
          }
        };
        setUser(updatedUser);
      }

      toast.success("Username updated successfully");
    } catch (error: any) {
      console.error("Update username error:", error);
      toast.error(error.message || "Failed to update username");
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentService, 
      user,
      session,
      login, 
      signup,
      logout,
      generateToken,
      isAdmin,
      updateUsername,
      updatePassword,
      setSession,
      setUser,
      setIsAuthenticated,
      setCurrentService,
      setIsAdmin
    }}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
