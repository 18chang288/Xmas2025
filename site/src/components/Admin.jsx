import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Admin() {
  const [message, setMessage] = useState('')

  async function triggerPairing() {
    setMessage('Triggering pairing...')
    // Call your deployed Edge Function URL (set via VITE_PAIRING_FUNCTION_URL)
    const fnUrl = import.meta.env.VITE_PAIRING_FUNCTION_URL
    if (!fnUrl) {
      setMessage('No pairing function URL set (VITE_PAIRING_FUNCTION_URL)')
      return
    }

    try {
      const res = await fetch(fnUrl, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'pairing failed')
      setMessage('Pairing done — see results in Supabase')
      console.log('pairing result', json)
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  async function reveal() {
    setMessage('Setting revealed=true for pairings (requires service role)')
    // In production, call an admin-only RPC or update via server. This is a placeholder.
    setMessage('Reveal should be triggered server-side to toggle revealed flag')
  }

  return (
    <div className="card">
      <h2>Admin</h2>
      <p>Trigger pairing after everyone has signed up.</p>
      <div className="actions">
        <button onClick={triggerPairing}>Run Pairing</button>
        <button onClick={reveal}>Reveal Pairings</button>
      </div>
      <p>{message}</p>
    </div>
  )
}
