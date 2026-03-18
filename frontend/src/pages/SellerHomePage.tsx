import { FormEvent, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { ProductCreateRequest, useProducts } from '../features/auth/authService';

function SellerHomePage() {
  const { user, logout } = useAuth();
  const { items, loading, createProduct, uploadProductImage, loadProducts } = useProducts('Seller');
  const [name, setName] = useState('New product');
  const [description, setDescription] = useState('A short description');
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(100);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) return;

    setSubmitting(true);
    setMessage('');

    const payload: ProductCreateRequest = {
      name,
      description,
      price,
      stock
    };

    try {
      const product = await createProduct(payload, user.token);

      if (files.length > 0) {
        await Promise.all(files.map((file) => uploadProductImage(product.id, file, user.token)));
      }

      await loadProducts();
      setFiles([]);
      setMessage(files.length > 0 ? 'Product and images uploaded.' : 'Product created.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <h1>Seller Dashboard</h1>
        <p>Manage products for {user?.email}</p>
        <form onSubmit={submit} className="form">
          <label>
            Product name
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Price
            <input
              value={price}
              type="number"
              step="1"
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>
          <label>
            Stock
            <input value={stock} type="number" onChange={(e) => setStock(Number(e.target.value))} />
          </label>
          <label>
            Product images
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </label>
          {files.length > 0 ? (
            <div className="image-preview-grid">
              {files.map((file) => (
                <div key={`${file.name}-${file.lastModified}`} className="image-preview-chip">
                  {file.name}
                </div>
              ))}
            </div>
          ) : null}
          {message ? <p className="message">{message}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create product'}
          </button>
        </form>

        <h2>Products</h2>
        {loading ? <p>Loading...</p> : null}
        <div className="product-grid">
          {items.map((item) => (
            <article key={item.id} className="product-card">
              {item.images[0]?.url ? <img src={item.images[0].url} alt={item.name} /> : null}
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p>${item.price}</p>
              <p>Stock: {item.stock}</p>
              {item.images.length > 1 ? <p>{item.images.length} images</p> : null}
            </article>
          ))}
        </div>
        <button onClick={logout}>Logout</button>
      </section>
    </main>
  );
}

export default SellerHomePage;
