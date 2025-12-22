import { useState, useEffect } from 'react';
import keycloak from '../auth';

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (keycloak.authenticated) {
        fetch('http://localhost/api/user/me', {
            headers: {
                'Authorization': `Bearer ${keycloak.token}`
            }
        })
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error("Failed to fetch profile", err));
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>TripTribe</h1>
      <p>Welcome, {keycloak.tokenParsed?.preferred_username}</p>
      <button onClick={() => keycloak.logout()}>Logout</button>
      
      <hr />
      
      <h2>User Profile (from Backend)</h2>
      {profile ? (
          <pre>{JSON.stringify(profile, null, 2)}</pre>
      ) : (
          <p>Loading profile...</p>
      )}
    </div>
  );
}
