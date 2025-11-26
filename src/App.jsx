import { supabase } from './supabaseClient'
import LandingPage from "./components/LandingPage";

export default function App() {
  console.log(supabase)
  return <LandingPage />
}
