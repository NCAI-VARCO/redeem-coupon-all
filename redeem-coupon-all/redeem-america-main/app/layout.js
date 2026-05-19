import './globals.css';

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'Redeem Distributor',
  description: 'QR redeem URL distributor',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
