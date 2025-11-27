import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function SecretSantaPage({ user }) {
  const [username, setUsername] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [assignedTo, setAssignedTo] = useState(null);
  const [error, setError] = useState("");

  // ----- SET YOUR REVEAL DATE HERE -----
  const revealDate = new Date("2025-12-20T00:00:00");
  const [timeLeft, setTimeLeft] = useState("");

  // Timer logic
  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const diff = revealDate - now;

      if (diff <= 0) {
        setTimeLeft("Revealed!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch username + wishlist + pairing
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // 1) Fetch user row using auth_uid
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("*")
          .eq("auth_uid", user.id)
          .single();

        if (userErr) {
          setError("Could not load user profile.");
          return;
        }

        setUsername(userRow.username);

        // 2) Fetch wishlist
        const { data: wishlistData } = await supabase
          .from("wishlists")
          .select("items")
          .eq("user_id", userRow.id)
          .single();

        if (wishlistData?.items) {
          setWishlist(wishlistData.items.slice(0, 3)); // top 3
        }

        // 3) Fetch pairing (only if revealed)
        const { data: pairing } = await supabase
          .from("pairings")
          .select("receiver_id, revealed")
          .eq("giver_id", userRow.id)
          .single();

        if (pairing && pairing.revealed) {
          // Fetch receiver username
          const { data: receiver } = await supabase
            .from("users")
            .select("username")
            .eq("id", pairing.receiver_id)
            .single();

          setAssignedTo(receiver?.username || "Unknown");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    };

    fetchInfo();
  }, [user.id]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>

      <div style={styles.card}>
        <h1>Welcome, {username} 🎄</h1>

        {assignedTo ? (
          <>
            <p>Your Secret Santa person is:</p>
            <h2 style={{ color: "#ff4081" }}>{assignedTo}</h2>
          </>
        ) : (
          <>
            <p>Secret Santa Reveal In:</p>
            <h2>{timeLeft}</h2>
          </>
        )}

        <div style={styles.wishlist}>
          <h3>Your Wishlist (Top 3):</h3>
          {wishlist.length === 0 ? (
            <p>No wishlist items added.</p>
          ) : (
            <ul>
              {wishlist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// styling
const styles = {
  container: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "url('/background.jpg') center/cover no-repeat",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: "10px 18px",
    background: "#ff4081",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  card: {
    background: "rgba(255,255,255,0.9)",
    padding: "40px",
    borderRadius: "20px",
    width: "400px",
    textAlign: "center",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
  },

  wishlist: {
    marginTop: "20px",
    textAlign: "left",
  },
};
