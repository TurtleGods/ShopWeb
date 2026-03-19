import { useEffect, useState } from "react";

type ProductImage = {
  url: string;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: ProductImage[];
};

const API_BASE = import.meta.env.VITE_API_URL ?? "";

function MainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) {
          throw new Error("產品清單載入失敗");
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError((e as Error).message || "載入失敗");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Shop Web
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            歡迎來到商城，先逛商品，不需先登入。
          </p>
        </div>

        {loading ? <p className="text-sm text-slate-500">載入中...</p> : null}
        {error ? (
          <p className="text-sm font-medium text-red-600">{error}</p>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <p className="text-sm text-slate-500">
            目前沒有商品，稍後再回來看看。
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {product.images[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-56 items-center justify-center bg-slate-100 text-sm font-medium text-slate-400">
                  No image
                </div>
              )}
              <div className="space-y-2 p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {product.name}
                </h3>
                <p className="text-sm leading-6 text-slate-600">
                  {product.description}
                </p>
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>${product.price}</span>
                  <span>Stock: {product.stock}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MainPage;
