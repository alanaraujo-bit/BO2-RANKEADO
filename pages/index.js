import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    window.location.href = '/app.html';
  }, []);

  return (
    <>
      <Head>
        <title>BO2 Plutonium Ranked System</title>
        <meta httpEquiv="refresh" content="0; url=/app.html" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0e27',
        color: '#fff'
      }}>
        <p>Redirecionando...</p>
      </div>
    </>
  );
}
