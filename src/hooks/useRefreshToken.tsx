
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const useRefreshToken = () => {
  const { setSession, setUser, setIsAuthenticated, setCurrentService, setIsAdmin } = useAuth();

  const refresh = async () => {
    try {
      // Check if we have an existing session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      
      if (data.session) {
        // We have a valid session, set all the auth state values
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        const service = data.session.user?.user_metadata?.service;
        setCurrentService(service || null);
        setIsAdmin(service === 'crunchyroll');
        
        console.log("Session refreshed successfully for:", data.session.user?.email);
        return data.session;
      }
      
      // IMPORTANT: When Auth state changed: SIGNED_IN, don't do anything else
      // Never clear auth state when session is undefined (only when explicitly null)
      // This prevents unexpected sign-outs
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      
      // Don't clear auth state on error, just return null
      // This prevents signing out users due to network errors or other issues
      return null;
    }
  };

  return refresh;
};

export default useRefreshToken;
