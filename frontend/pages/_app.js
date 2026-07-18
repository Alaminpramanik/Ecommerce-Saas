import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "../context/StoreContext";
import { AuthProvider } from "../context/AuthContext";
import { ProductsProvider } from "../context/ProductsContext";
import { ProductChatProvider } from "../context/ProductChatContext";
import "../styles/globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${display.variable} ${body.variable} font-body`}>
      <AuthProvider>
        <ProductsProvider>
          <StoreProvider>
            <ProductChatProvider>
              <Component {...pageProps} />
              <Toaster position="bottom-right" />
            </ProductChatProvider>
          </StoreProvider>
        </ProductsProvider>
      </AuthProvider>
    </div>
  );
}
