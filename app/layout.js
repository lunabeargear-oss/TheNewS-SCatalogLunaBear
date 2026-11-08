import './globals.css';

export const metadata = {
  title: 'Luna Bear LLC | B2B Wholesale Portal',
  description: 'S&S Activewear Mirrored Wholesale Catalog',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-white text-neutral-800 font-sans antialiased">{children}</body>
    </html>
  );
}
