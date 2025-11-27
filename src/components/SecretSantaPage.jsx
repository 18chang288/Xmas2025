import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import './SecretSantaPage.css';

export default function SecretSantaPage({ user }) {
  const [username, setUsername] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [editableWishlist, setEditableWishlist] = useState([]);
  const [assignedTo, setAssignedTo] = useState(null);
  const [error, setError] = useState("");

  // ----- SET YOUR REVEAL DATE HERE (include exact time) -----
  const [revealDate, setRevealDate] = useState(new Date("2025-11-27T18:00:00"));
  const [timeLeft, setTimeLeft] = useState("");
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
  const flakes = Array.from({ length: 50 }).map(() => ({
    left: Math.random() * window.innerWidth,
    size: 2 + Math.random() * 6,
    opacity: 0.3 + Math.random() * 0.5,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 10
  }));
  setSnowflakes(flakes);
}, []); // empty dependency array = run once on mount


  // Countdown timer
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
  }, [revealDate]);

  // Fetch username + wishlist + pairing
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        // Extract username from email (e.g., john@example.com → john)
        const usernameFromEmail = user.email?.split("@")[0] || "";
        
        const { data: userRow, error: userErr } = await supabase
          .from("users")
          .select("*")
          .eq("username", usernameFromEmail)
          .single();

        if (userErr) {
          console.error("Failed to load user profile:", userErr);
          setUsername(usernameFromEmail);
          setWishlist(["", "", ""]);
          setEditableWishlist(["", "", ""]);
          return;
        }

        setUsername(userRow.username);

        // Fetch wishlist
        const { data: wishlistData } = await supabase
          .from("wishlists")
          .select("items")
          .eq("user_id", userRow.id)
          .single();

        if (wishlistData?.items) {
          const top3 = wishlistData.items.slice(0, 3);
          while (top3.length < 3) top3.push("");
          setWishlist(top3);
          setEditableWishlist(top3);
        }
        else {
          setWishlist(["", "", ""]);
          setEditableWishlist(["", "", ""]);
        }

        // Fetch pairing (if revealed)
        const { data: pairing } = await supabase
          .from("pairings")
          .select("receiver_id, revealed")
          .eq("giver_id", userRow.id)
          .single();

        if (pairing && pairing.revealed) {
          const { data: receiver } = await supabase
            .from("users")
            .select("username")
            .eq("id", pairing.receiver_id)
            .single();

          setAssignedTo(receiver?.username || "Unknown");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        const usernameFromEmail = user.email?.split("@")[0] || "User";
        setUsername(usernameFromEmail);
        setWishlist(["", "", ""]);
        setEditableWishlist(["", "", ""]);
      }
    };

    fetchInfo();
  }, [user.id, user.email]);

  // Auto-save wishlist to Supabase
  const saveWishlist = async (items) => {
  try {
    const usernameFromEmail = user.email?.split("@")[0] || "";
    
    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", usernameFromEmail)
      .single();

    if (userErr) {
      console.error("Failed to fetch user for saving:", userErr);
      return;
    }

    const { error } = await supabase
      .from("wishlists")
      .upsert(
        { user_id: userRow.id, items },
        { onConflict: ["user_id"] }
      );

    if (error) console.error("Failed to save wishlist:", error);
  } catch (err) {
    console.error("Unexpected error saving wishlist:", err);
  }
};

  const handleWishlistChange = (value, index) => {
    const newList = [...editableWishlist];
    newList[index] = value;

    setEditableWishlist(newList);
    setWishlist(newList);
    saveWishlist(newList);
  };

  const addWishlistItem = () => {
    setEditableWishlist([...editableWishlist, ""]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // styles are in SecretSantaPage.css

  return (
    <div className="container">
      <button onClick={handleLogout} className="logoutButton">
        Logout
      </button>

      <div className="snow">
        {snowflakes.map((flake, i) => (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${flake.left}px`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`
            }}
          />
        ))}
      </div>

 
      <div className="card">
        <h1>Welcome, {username} 🎄</h1>

        {assignedTo ? (
          <>
            <p>Your Secret Santa person is:</p>
            <h2 className="assignedTo">{assignedTo}</h2>
          </>
        ) : (
          <>
            <p>Secret Santa Reveal In:</p>
            <h2>{timeLeft}</h2>
          </>
        )}

        <div className="wishlist">
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

        {/* Editable wishlist box */}
        <div className="editableWishlist">
          <h3>Edit Your Wishlist:</h3>
          {editableWishlist.map((item, index) => (
            <input
              key={index}
              type="text"
              value={item}
              onChange={(e) => handleWishlistChange(e.target.value, index)}
              className="wishlistInput"
              maxLength={100}
            />
          ))}
        </div>

          {error && <p className="error">{error}</p>}
      </div>
    </div>
  );

}