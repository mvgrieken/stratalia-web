import type { AppProps } from 'next/app'
import '@/lib/browser-fixes'
import '../app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
