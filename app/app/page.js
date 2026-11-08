'use client';

import { useEffect, useState } from 'react';

export default function WholesalePortal() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadLiveFeed() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Could not load products. Check the S&S API credentials and try again.');
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error(data.error || 'The product feed returned an unexpected response.');
        setAllProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Error loading live catalog:', err);
        setLoadError(err.message || 'Unable to load the product catalog.');
      } finally {
        setLoading(false);
      }
    }
    loadLiveFeed();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredProducts(
      allProducts.filter((item) =>
        (item.title || item.name || '').toLowerCase().includes(query) ||
        (item.sku || '').toLowerCase().includes(query) ||
        (item.brand || '').toLowerCase().includes(query)
      )
    );
  };

  const addToCart = (product) => {
    const markupPrice = Number.parseFloat(product.markupPrice || product.basePrice * 1.2);
    setCart((prev) => {
      const existing = prev.find((item) => item.sku === product.sku);
      if (existing) {
        return prev.map((item) => item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, price: markupPrice, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * 0.05;
  const finalTotal = subtotal - discount;

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col font-sans">
      <div className="bg-neutral-100 border-b border-neutral-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-medium gap-3">
          <span className="text-blue-700 font-bold">Luna Bear Wholesale (Acushnet, MA) | Live S&amp;S API Connected</span>
          <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded border border-green-300">
            Account #1025504 | 20% Markup &amp; 5% Promo Active
          </span>
        </div>
      </div>

      <header className="border-b border-neutral-200 py-4 px-6 sticky top-0 bg-white z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-6">
          <div className="shrink-0">
            <h1 className="text-2xl font-black tracking-tighter text-blue-700 m-0">LUNA BEAR</h1>
            <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Wholesale Portal</span>
          </div>
          <div className="flex-grow max-w-2xl">
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search live S&S inventory by style #, brand, or keyword..."
              aria-label="Search catalog"
              className="w-full border-2 border-blue-600 px-4 py-2 text-sm rounded outline-none"
            />
          </div>
          <button onClick={() => setIsCartOpen(true)} className="bg-neutral-100 border border-neutral-300 px-4 py-2 rounded font-bold text-sm relative flex items-center gap-2 hover:bg-neutral-200 cursor-pointer">
            <i className="fa-solid fa-shopping-cart text-blue-700" aria-hidden="true"></i>
            <span>Cart (${finalTotal.toFixed(2)})</span>
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-black">
              {cart.reduce((sum, item) => sum + item.qty, 0)}
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold">Live Catalog Feed</h2>
          <span className="text-xs font-bold text-neutral-500">Showing {filteredProducts.length} live items</span>
        </div>

        {loading ? (
          <div className="text-center py-24 text-neutral-500">
            <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-600 mb-3" aria-hidden="true"></i>
            <p className="font-bold text-sm">Querying S&amp;S Activewear Live Inventory via server proxy...</p>
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
            <p className="font-bold">Catalog unavailable</p>
            <p className="mt-1 text-sm">{loadError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((item, index) => {
              const markup = Number.parseFloat(item.markupPrice || item.basePrice * 1.2).toFixed(2);
              const promo = Number.parseFloat(item.promoCartPrice || Number.parseFloat(markup) * 0.95).toFixed(2);
              const name = item.title || item.name || 'S&S Activewear product';
              return (
                <div key={item.sku || item.id || index} className="border border-neutral-200 rounded-lg p-4 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition">
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">{item.brand || 'S&S Activewear'}</span>
                    <div className="h-40 my-3 flex items-center justify-center bg-neutral-50 rounded border">
                      <img src={item.image || item.imageUrl || 'https://www.ssactivewear.com/Images/Style/211_fl.jpg'} alt={name} className="max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900"><span className="text-neutral-400">{item.sku}</span>{item.sku ? ' - ' : ''}{name}</h3>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.desc || item.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-neutral-400">Price (20% Markup)</div>
                      <div className="text-lg font-black">${markup}</div>
                      <div className="text-[10px] text-green-700 font-bold">Promo: ${promo}</div>
                    </div>
                    <button onClick={() => addToCart(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-bold uppercase rounded cursor-pointer">Add</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" role="presentation" onClick={() => setIsCartOpen(false)}>
          <section className="w-full max-w-md bg-white h-full p-6 flex flex-col shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 id="cart-title" className="font-bold text-lg text-blue-700">Wholesale Cart</h3>
              <button onClick={() => setIsCartOpen(false)} aria-label="Close cart" className="text-xl font-bold cursor-pointer">&times;</button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <p className="text-center text-neutral-400 py-12 text-sm">Your cart is empty.</p>
              ) : (
                cart.map((item, index) => (
                  <div key={item.sku || index} className="flex justify-between items-center border-b pb-2 text-xs">
                    <div>
                      <div className="font-bold">{item.title || item.name || 'Product'}</div>
                      <div className="text-neutral-500">Qty: {item.qty} × ${item.price.toFixed(2)}</div>
                    </div>
                    <div className="font-black">${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-xs text-neutral-600"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-green-700 font-bold"><span>Promo Discount (-5%):</span><span>-${discount.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-black pt-2 border-t"><span>Total:</span><span>${finalTotal.toFixed(2)}</span></div>
              <button onClick={() => window.alert('Please contact lunabeargear@gmail.com to complete your wholesale order.')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 uppercase text-xs rounded mt-4 cursor-pointer">
                Proceed to Checkout
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
