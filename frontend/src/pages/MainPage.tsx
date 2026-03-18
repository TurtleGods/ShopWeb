import { useEffect, useState } from 'react';

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

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function MainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (!response.ok) {
          throw new Error('產品清單載入失敗');
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError((e as Error).message || '載入失敗');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <h1>Main Page</h1>
        <p className="sub-title">歡迎來到商城，先逛商品，不需先登入。</p>

        {loading ? <p>載入中...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {!loading && !error && products.length === 0 ? (
          <p>目前沒有商品，稍後再回來看看。</p>
        ) : null}

        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              {product.images[0]?.url ? <img src={product.images[0].url} alt={product.name} /> : null}
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>價格：${product.price.toFixed(2)}</p>
              <p>庫存：{product.stock}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MainPage;
