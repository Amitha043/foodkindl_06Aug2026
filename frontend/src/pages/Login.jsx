import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <ChefHat size={42} />
        <div className="eyebrow">FoodKindl connect</div>
        <h1>Welcome back</h1>
        <p>Log in to manage food invitations, community posts, and shared meals.</p>

        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button full">Login</button>
        </form>

        <p>New to FoodKindl? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
