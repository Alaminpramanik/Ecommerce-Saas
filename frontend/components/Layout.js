import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

export default function Layout({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 bg-ink-radial" />
      <div className="noise-overlay" />
      <div
        className="glossy-blob left-[-10%] top-[-5%] z-0 h-[420px] w-[420px] bg-gold-500/10"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="glossy-blob right-[-8%] top-[30%] z-0 h-[380px] w-[380px] bg-gold-400/10"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="glossy-blob left-[20%] bottom-[-10%] z-0 h-[360px] w-[360px] bg-gold-600/10"
        style={{ animationDelay: "-11s" }}
      />
      <Navbar />
      <main className="relative z-10 flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
