import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiLogIn, FiLock, FiUser } from "react-icons/fi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.username, form.password);
      router.push(typeof router.query.next === "string" ? router.query.next : "/");
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Log In — Fulhar</title>
      </Head>

      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <div className="reveal in-view text-center">
          <span className="section-label">Welcome Back</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream">
            Log In to <span className="gold-text">Fulhar</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="reveal in-view card-surface mt-10 space-y-4 p-7">
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              required
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
          </div>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              required
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
            <FiLogIn /> {submitting ? "Logging in..." : "Log In"}
          </button>

          <p className="text-center text-sm text-cream/50">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-gold-300 hover:text-gold-200">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </Layout>
  );
}
