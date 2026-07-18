import Head from "next/head";
import Link from "next/link";
import { FiArrowRight, FiHome, FiShoppingBag } from "react-icons/fi";
import Layout from "../components/Layout";

export default function NotFoundPage() {
  return (
    <Layout>
      <Head>
        <title>Page Not Found — Fulhar</title>
      </Head>

      <section className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
        <span className="gold-text font-display text-7xl font-black">404</span>
        <h1 className="mt-6 font-display text-2xl font-bold text-cream">Page Not Found</h1>
        <p className="mt-3 text-cream/55">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-gold">
            <FiHome /> Back Home
          </Link>
          <Link href="/products" className="btn-outline">
            <FiShoppingBag /> Shop Products <FiArrowRight />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
