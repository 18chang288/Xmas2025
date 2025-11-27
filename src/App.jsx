import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import SecretSantaPage from "./components/SecretSantaPage.jsx";
import { supabase } from "./supabaseClient.js";

export default function App() {
  const [user, setUser] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogin = async (userObj) => {
    setUser(userObj);  
  };

  return (
    <div>
      {user ? (
        <SecretSantaPage user={user} />
      ) : (
        <LandingPage onLogin={handleLogin} />
      )}
    </div>
  );
}
