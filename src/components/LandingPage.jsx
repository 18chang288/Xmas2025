import React, { useState } from 'react'
import './LandingPage.css'
import { supabase } from '../supabaseClient'

export default function LandingPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const email = `${username}@example.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }
      onLogin(data.user);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-container">
    <div className="left-side">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="https://iwjndimieirsyghavryr.supabase.co/storage/v1/object/public/xmas_pic/gif1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

      <div className="right-side">
      <div className="login-box">
        <h2>Secret Santa</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            Sign In
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>     
      </div>
    </div>
  )
}
