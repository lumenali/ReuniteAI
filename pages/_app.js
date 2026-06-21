import "../styles/globals.css";
import SplashLoader from "../components/SplashLoader";
import SoundController from "../components/SoundController";

export default function App({ Component, pageProps }) {
  return (
    <>
      <SplashLoader />
      <SoundController />
      <Component {...pageProps} />
    </>
  );
}
