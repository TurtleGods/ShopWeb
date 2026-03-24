import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  deleteProduct,
  getProductsByUserId,
  ProductCreateRequest,
  ProductSummary,
  uploadProductImage
} from '../features/auth/authService';
import { useAuth } from '../features/auth/AuthContext';

function UserStorePage() {
  const { publicUserId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = !!user && user.role !== 'Admin' && user.publicUserId === publicUserId;
  const [pageUserId, setPageUserId] = useState(publicUserId);
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('New product');
  const [description, setDescription] = useState('A short description');
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(100);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const publicUrl = useMemo(() => `${window.location.origin}/${pageUserId || publicUserId}`, [pageUserId, publicUserId]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProductsByUserId(publicUserId);
      setPageUserId(data.publicUserId);
      setItems(data.products);
    } catch (loadError) {
      setError((loadError as Error).message || 'Failed to load user page.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, [publicUserId]);

  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token || !isOwner) {
      return;
    }

    setSubmitting(true);
    setMessage('');
    setError('');

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

      setFiles([]);
      setMessage(files.length > 0 ? 'Product and images uploaded.' : 'Product created.');
      await loadProducts();
      navigate(`/${user.publicUserId}`, { replace: true });
    } catch (submitError) {
      setError((submitError as Error).message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (productId: number) => {
    if (!user?.token || !isOwner) {
      return;
    }

    setDeletingProductId(productId);
    setMessage('');
    setError('');

    try {
      await deleteProduct(productId, user.token);
      setMessage('Product deleted.');
      await loadProducts();
    } catch (deleteError) {
      setError((deleteError as Error).message || 'Failed to delete product.');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">User Page</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">@{pageUserId || publicUserId}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              {isOwner
                ? 'This is your public page. Add products here and share the URL.'
                : 'You are viewing this user page as a buyer.'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <div>Public URL</div>
            <div className="mt-1 font-medium text-slate-900">{publicUrl}</div>
          </div>
        </div>

        {isOwner ? (
          <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <h2 className="text-xl font-semibold text-slate-900">Add product</h2>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Product name
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Description
              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Price
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  value={price}
                  type="number"
                  step="1"
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Stock
                <input
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  value={stock}
                  type="number"
                  onChange={(e) => setStock(Number(e.target.value))}
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Product images
              <input
                className="block w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              />
            </label>
            {files.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <img src={previewUrls[index]} alt={file.name} className="h-36 w-full bg-slate-100 object-cover" />
                    <div className="border-t border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">{file.name}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Create product'}
            </button>
          </form>
        ) : null}

        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm font-medium text-red-600">{error}</p> : null}
        {loading ? <p className="mt-4 text-sm text-slate-500">Loading...</p> : null}
        {!loading && !error && items.length === 0 ? <p className="mt-4 text-sm text-slate-500">No products yet.</p> : null}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {item.images[0]?.url ? (
                <img src={item.images[0].url} alt={item.name} className="h-52 w-full object-cover" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-slate-100 text-sm font-medium text-slate-400">
                  No image
                </div>
              )}
              <div className="space-y-2 p-5">
                <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>${item.price}</span>
                  <span>Stock: {item.stock}</span>
                </div>
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => void removeProduct(item.id)}
                    disabled={deletingProductId === item.id}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingProductId === item.id ? 'Deleting...' : 'Delete product'}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default UserStorePage;
