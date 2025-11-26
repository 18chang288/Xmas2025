import { supabase } from './supabaseClient';
import React from "react";

export default function App() {
  console.log("Supabase object:", supabase);

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
    </div>
  );
}
