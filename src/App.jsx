import { supabase } from './supabaseClient'

export default function App() {
  console.log(supabase)
  return <h1>Supabase loaded!</h1>
}
