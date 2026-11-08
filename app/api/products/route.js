import { NextResponse } from 'next/server';

export async function GET() {
  const username = process.env.SS_API_USERNAME;
  const apiKey = process.env.SS_API_KEY;

  if (!username || !apiKey) {
    return NextResponse.json(
      { error: 'Missing S&S API credentials in environment variables.' },
      { status: 500 }
    );
  }

  // Encode credentials in Base64 for S&S Activewear Basic Authentication.
  const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64');

  try {
    const response = await fetch('https://api.ssactivewear.com/v2/products.aspx', {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache the response for one hour.
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch live feed from S&S Activewear' },
        { status: response.status }
      );
    }

    const rawProducts = await response.json();

    // Apply the 20% markup and 5% promotional price calculation.
    const markedUpProducts = rawProducts.map((item) => {
      const base = parseFloat(item.customerPrice || item.price || 2.5);
      const markup = base * 1.2;
      return {
        ...item,
        markupPrice: markup.toFixed(2),
        promoCartPrice: (markup * 0.95).toFixed(2),
      };
    });

    return NextResponse.json(markedUpProducts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error fetching products.' },
      { status: 500 }
    );
  }
}
