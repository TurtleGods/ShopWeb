import { FormEvent, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { ProductCreateRequest, useProducts } from '../features/auth/authService';

function SellerHomePage() {
  const { user, logout } = useAuth();
  const { items, loading, createProduct } = useProducts('Seller');
  const [name, setName] = useState('New product');
  const [description, setDescription] = useState('A short description');
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(100);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) return;
    const payload: ProductCreateRequest = {
      name,
      description,
      price,
      stock
    };
    await createProduct(payload, user.token);
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
          <button type="submit">Create product</button>
        </form>

        <h2>Products</h2>
        {loading ? <p>Loading...</p> : null}
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} - {item.price}
            </li>
          ))}
        </ul>
        <button onClick={logout}>Logout</button>
      </section>
    </main>
  );
}

export default SellerHomePage;

