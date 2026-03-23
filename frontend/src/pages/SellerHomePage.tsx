import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { ProductCreateRequest, useProducts } from '../features/auth/authService';

function SellerHomePage() {
  const { user } = useAuth();
  const { items, loading, createProduct, uploadProductImage, deleteProduct, loadProducts } = useProducts('Seller');
  const [name, setName] = useState('New product');
  const [description, setDescription] = useState('A short description');
  const [price, setPrice] = useState(10);
  const [stock, setStock] = useState(100);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

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

  const removeProduct = async (productId: number) => {
    if (!user?.token) return;

    setDeletingProductId(productId);
    setMessage('');

    try {
      await deleteProduct(productId, user.token);
      await loadProducts();
      setMessage('Product deleted.');
    } catch (error) {
      setMessage((error as Error).message || 'Failed to delete product.');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl">
      <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">賣家儀表板</h1>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            商品名稱
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            描述
            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              價格
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={price}
                type="number"
                step="1"
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              庫存量
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                value={stock}
                type="number"
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            商品圖片
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
                  <img
                    src={previewUrls[index]}
                    alt={file.name}
                    className="h-36 w-full bg-slate-100 object-cover"
                  />
                  <div className="border-t border-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Create product'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">產品</h2>
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <span>庫存: {item.stock}</span>
                </div>
                <p className="text-sm text-slate-500">
                  {item.images.length} image{item.images.length === 1 ? '' : 's'}
                </p>
                <button
                  type="button"
                  onClick={() => void removeProduct(item.id)}
                  disabled={deletingProductId === item.id}
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingProductId === item.id ? 'Deleting...' : 'Delete product'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default SellerHomePage;
