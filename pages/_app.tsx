import type { AppProps } from "next/app";
import GoogleAnalytics from "../app/components/GoogleAnalytics";
import "../app/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  );
}
