import React, { useState } from "react";
import LandingPage from "./components/LandingPage.jsx";
import SecretSantaPage from "./components/SecretSantaPage.jsx";

export default function App() {
  const [user, setUser] = useState(null);

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
