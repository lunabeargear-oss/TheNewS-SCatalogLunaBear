import { NextResponse } from 'next/server';

const mockProducts = [
  { sku: 'G5000', brand: 'Gildan', category: 'T-Shirts', title: 'Adult Heavy Cotton 5.3 oz. T-Shirt', basePrice: 2.5, desc: '100% preshrunk cotton. Classic fit.', image: 'https://www.ssactivewear.com/Images/Style/211_fl.jpg' },
  { sku: '1717', brand: 'Comfort Colors', category: 'T-Shirts', title: 'Garment-Dyed Heavyweight T-Shirt', basePrice: 4.5, desc: '6.1 oz., 100% ring spun cotton. Soft-washed garment-dyed.', image: 'https://www.ssactivewear.com/Images/Style/3020_fl.jpg' },
  { sku: '3001', brand: 'Bella + Canvas', category: 'T-Shirts', title: 'Unisex Jersey Short Sleeve Tee', basePrice: 3.8, desc: '4.2 oz., 100% combed and ringspun cotton. Retail fit.', image: 'https://www.ssactivewear.com/Images/Style/2809_fl.jpg' },
  { sku: '18500', brand: 'Gildan', category: 'Fleece', title: 'Heavy Blend Hooded Sweatshirt', basePrice: 9.8, desc: '8.0 oz., 50/50 cotton/polyester fleece with double-lined hood.', image: 'https://www.ssactivewear.com/Images/Style/213_fl.jpg' },
  { sku: '3719', brand: 'Bella + Canvas', category: 'Fleece', title: 'Unisex Sponge Fleece Pullover Hoodie', basePrice: 13.5, desc: '7.0 oz., 52/48 airlume combed and ringspun cotton/polyester.', image: 'https://www.ssactivewear.com/Images/Style/4192_fl.jpg' },
  { sku: '112', brand: 'Richardson', category: 'Headwear', title: 'Structured Trucker Snapback Cap', basePrice: 5.5, desc: 'Classic trucker shape with cotton twill front and mesh back.', image: 'https://www.ssactivewear.com/Images/Style/3588_fl.jpg' },
];

function addPrices(item, basePrice) {
  const markup = basePrice * 1.2;
  return {
    ...item,
    basePrice,
    markupPrice: markup.toFixed(2),
    promoCartPrice: (markup * 0.95).toFixed(2),
  };
}

export async function GET() {
  const username = process.env.SS_API_USERNAME;
  const apiKey = process.env.SS_API_KEY;

  if (!username || !apiKey) {
    return NextResponse.json(mockProducts.map((item) => addPrices(item, item.basePrice)));
  }

  const credentials = Buffer.from(`${username}:${apiKey}`).toString('base64');

  try {
    const response = await fetch('https://api.ssactivewear.com/v2/products.aspx', {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch the S&S Activewear product feed.' },
        { status: response.status }
      );
    }

    const rawProducts = await response.json();
    const catalog = rawProducts.map((item) => {
      const base = Number.parseFloat(item.customerPrice || item.price || 3);
      return addPrices({
        sku: item.sku || item.styleID || 'unknown',
        brand: item.brandName || item.brand || 'S&S Activewear',
        category: item.categoryName || item.category || 'Apparel',
        title: item.title || item.name || 'Wholesale apparel item',
        desc: item.description || item.desc || '',
        image: item.image || item.imageUrl || 'https://www.ssactivewear.com/Images/Style/211_fl.jpg',
      }, Number.isFinite(base) ? base : 3);
    });

    return NextResponse.json(catalog);
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach the S&S Activewear product feed.' },
      { status: 502 }
    );
  }
}
