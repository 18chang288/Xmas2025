import { supabase } from './supabaseClient';
import React, { useEffect, useState } from "react";

export default function App() {
    const [status, setStatus] = useState('Checking Supabase...');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // This just pings Supabase; no table required
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus(`Error connecting: ${error.message}`);
        } else {
          setStatus('Supabase client is working!');
        }
      } catch (err) {
        setStatus(`Unexpected error: ${err}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontFamily: "sans-serif",
      backgroundColor: "#f0f0f0",
    }}>
      <h1>Hello! This is a test message from App.jsx</h1>
      <p>{status}</p>
    </div>
  );
}
