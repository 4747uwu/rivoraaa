import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/api/auth/google"; // Redirect to backend OAuth
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Google OAuth Login</h1>
      <button onClick={handleGoogleLogin} style={{ padding: "10px 20px", fontSize: "16px" }}>
        Login with Google
      </button>
    </div>
  );
};

export default Login;