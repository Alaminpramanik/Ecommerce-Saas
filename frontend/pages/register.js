import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiUserPlus, FiLock, FiUser, FiMail, FiPhone } from "react-icons/fi";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: "",
    is_merchant: false,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setError(err.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Create Account — Fulhar</title>
      </Head>

      <section className="mx-auto flex max-w-md flex-col px-6 py-20">
        <div className="reveal in-view text-center">
          <span className="section-label">Join Fulhar</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-cream">
            Create Your <span className="gold-text">Account</span>
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
            <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-cream/35 outline-none focus:border-gold-500/50"
            />
          </div>
          <div className="relative">
            <FiPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream/40" />
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="Phone Number (optional)"
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

          <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/70">
            <input
              type="checkbox"
              name="is_merchant"
              checked={form.is_merchant}
              onChange={handleChange}
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-gold-500"
            />
            I want to sell products as a merchant
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-60">
            <FiUserPlus /> {submitting ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-cream/50">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-gold-300 hover:text-gold-200">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </Layout>
  );
}
