import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    try {
      await register(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);

      const data = err.response?.data;

      setError(
        data?.email?.[0] ||
          data?.password?.[0] ||
          data?.first_name?.[0] ||
          data?.last_name?.[0] ||
          data?.detail ||
          "Registration could not be completed. Please check that the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <ChefHat size={42} />

        <div className="eyebrow">Join FoodKindl</div>

        <h1>Create your profile</h1>

        <p>
          Start discovering meals, hosts, food invitations, and surplus-food
          listings.
        </p>

        <form onSubmit={submit}>
          <div className="form-row">
            <label>
              First name
              <input
                name="first_name"
                type="text"
                required
                autoComplete="given-name"
                value={form.first_name}
                onChange={handleChange}
              />
            </label>

            <label>
              Last name
              <input
                name="last_name"
                type="text"
                required
                autoComplete="family-name"
                value={form.last_name}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={6}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
            />
          </label>

          {error && <p className="error-message">{error}</p>}

          <button
            type="submit"
            className="primary-button full"
            disabled={submitting}
          >
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}