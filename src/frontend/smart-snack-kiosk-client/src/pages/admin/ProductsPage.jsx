import { useState, useEffect, useRef } from 'react'
import {
  getProducts,
  createProduct,
  updateProduct,
  deactivateProduct,
  reactivateProduct,
} from '../../api/adminApi'
import { getCategories } from '../../api/adminApi'

const EMPTY_FORM = { name: '', price: '', categoryId: '', stockQuantity: '0', imageUrl: '' }

function formatPrice(price) {
  return price.toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' kr'
}

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Feedback: { type: 'success' | 'error', message: string } | null
  const [feedback, setFeedback] = useState(null)

  // Formulär: null = stängt, 'create' = skapa ny, 'edit' = redigera befintlig
  const [formMode, setFormMode] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inaktivera-dialog: { id, name } eller null
  const [pendingDeactivate, setPendingDeactivate] = useState(null)
  const [isDeactivating, setIsDeactivating] = useState(false)

  // Aktivera-dialog: { id, name } eller null
  const [pendingReactivate, setPendingReactivate] = useState(null)
  const [isReactivating, setIsReactivating] = useState(false)

  const nameInputRef = useRef(null)
  const feedbackTimerRef = useRef(null)

  async function fetchData() {
    setIsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch {
      showFeedback('error', 'Kunde inte hämta data. Kontrollera att backend körs.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sätt fokus på namnfältet när formuläret öppnas
  useEffect(() => {
    if (formMode !== null) {
      nameInputRef.current?.focus()
    }
  }, [formMode])

  function showFeedback(type, message) {
    clearTimeout(feedbackTimerRef.current)
    setFeedback({ type, message })
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000)
  }

  function handleField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function openCreateForm() {
    setFormData({ ...EMPTY_FORM, categoryId: String(categories[0]?.id ?? '') })
    setEditingProduct(null)
    setFormMode('create')
  }

  function openEditForm(product) {
    setFormData({
      name: product.name,
      price: String(product.price),
      categoryId: String(product.categoryId),
      stockQuantity: String(product.stockQuantity),
      imageUrl: product.imageUrl ?? '',
    })
    setEditingProduct(product)
    setFormMode('edit')
  }

  function cancelForm() {
    setFormMode(null)
    setFormData(EMPTY_FORM)
    setEditingProduct(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId, 10),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      imageUrl: formData.imageUrl.trim() || null,
    }

    setIsSubmitting(true)
    try {
      if (formMode === 'create') {
        await createProduct(payload)
        showFeedback('success', `Produkten "${payload.name}" skapades.`)
      } else {
        await updateProduct(editingProduct.id, payload)
        showFeedback('success', `Produkten "${payload.name}" uppdaterades.`)
      }
      await fetchData()
      cancelForm()
    } catch {
      showFeedback('error', formMode === 'create'
        ? 'Kunde inte skapa produkten. Kontrollera att kategorin finns.'
        : 'Kunde inte uppdatera produkten. Försök igen.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function openDeactivateConfirm(product) {
    setPendingDeactivate({ id: product.id, name: product.name })
  }

  function cancelDeactivate() {
    setPendingDeactivate(null)
  }

  async function handleDeactivate() {
    if (!pendingDeactivate) return

    setIsDeactivating(true)
    try {
      await deactivateProduct(pendingDeactivate.id)
      await fetchData()
      const name = pendingDeactivate.name
      setPendingDeactivate(null)
      showFeedback('success', `"${name}" inaktiverades.`)
    } catch {
      showFeedback('error', 'Kunde inte inaktivera produkten. Försök igen.')
    } finally {
      setIsDeactivating(false)
    }
  }

  function openReactivateConfirm(product) {
    setPendingReactivate({ id: product.id, name: product.name })
  }

  function cancelReactivate() {
    setPendingReactivate(null)
  }

  async function handleReactivate() {
    if (!pendingReactivate) return

    setIsReactivating(true)
    try {
      await reactivateProduct(pendingReactivate.id)
      await fetchData()
      const name = pendingReactivate.name
      setPendingReactivate(null)
      showFeedback('success', `"${name}" aktiverades igen.`)
    } catch {
      showFeedback('error', 'Kunde inte aktivera produkten. Försök igen.')
    } finally {
      setIsReactivating(false)
    }
  }

  // --- Renderar ---

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        Hämtar produkter…
      </div>
    )
  }

  const isFormOpen = formMode !== null

  return (
    <div>
      {/* Sidhuvud */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>Produkter</h1>
          <p>
            {products.length === 0
              ? 'Inga produkter ännu'
              : `${products.length} ${products.length === 1 ? 'produkt' : 'produkter'} totalt`}
          </p>
        </div>
        {!isFormOpen && (
          <button className="btn btn--primary" onClick={openCreateForm}>
            + Ny produkt
          </button>
        )}
      </div>

      {/* Feedback-toast */}
      {feedback && (
        <div
          className={`feedback-toast feedback-toast--${feedback.type}`}
          role="alert"
        >
          {feedback.type === 'success' ? '✓' : '⚠'} {feedback.message}
        </div>
      )}

      {/* Skapa / Redigera-formulär */}
      {isFormOpen && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card__body">
            <p style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--a-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              {formMode === 'create' ? 'Ny produkt' : `Redigera – ${editingProduct?.name}`}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {/* Namn */}
                <div className="form-group">
                  <label className="form-label">Namn *</label>
                  <input
                    ref={nameInputRef}
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleField('name', e.target.value)}
                    placeholder="Produktnamn"
                    maxLength={200}
                    required
                  />
                </div>

                {/* Kategori */}
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-input"
                    value={formData.categoryId}
                    onChange={(e) => handleField('categoryId', e.target.value)}
                    required
                  >
                    {categories.length === 0 && (
                      <option value="">Inga kategorier – skapa en först</option>
                    )}
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pris */}
                <div className="form-group">
                  <label className="form-label">Pris (kr) *</label>
                  <input
                    className="form-input"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleField('price', e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                {/* Lagersaldo */}
                <div className="form-group">
                  <label className="form-label">Lagersaldo *</label>
                  <input
                    className="form-input"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => handleField('stockQuantity', e.target.value)}
                    min="0"
                    step="1"
                    required
                  />
                </div>

                {/* Bild-URL – spänner över båda kolumner */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Bild-URL (valfritt)</label>
                  <input
                    className="form-input"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleField('imageUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="inline-form">
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={isSubmitting || !formData.name.trim() || !formData.categoryId || !formData.price}
                >
                  {isSubmitting ? 'Sparar…' : 'Spara'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={cancelForm}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tom lista */}
      {products.length === 0 && !isFormOpen && (
        <div className="placeholder-page">
          <div className="placeholder-page__icon">📦</div>
          <h2 className="placeholder-page__title">Inga produkter ännu</h2>
          <p className="placeholder-page__text">
            Skapa din första produkt med knappen ovan.
          </p>
        </div>
      )}

      {/* Inaktivera-dialog */}
      {pendingDeactivate && (
        <div className="dialog-overlay" onClick={cancelDeactivate}>
          <div className="dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Inaktivera produkt?</h2>
            <p>
              Är du säker på att du vill inaktivera{' '}
              <strong>"{pendingDeactivate.name}"</strong>?
              <br />
              Produkten visas inte längre i kiosken.
            </p>
            <div className="dialog-box__actions">
              <button
                className="btn btn--ghost btn--sm"
                onClick={cancelDeactivate}
                disabled={isDeactivating}
              >
                Avbryt
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Inaktiverar…' : 'Inaktivera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aktivera-dialog */}
      {pendingReactivate && (
        <div className="dialog-overlay" onClick={cancelReactivate}>
          <div className="dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Aktivera produkt?</h2>
            <p>
              Vill du aktivera <strong>"{pendingReactivate.name}"</strong> igen?
              <br />
              Produkten visas då i kiosken.
            </p>
            <div className="dialog-box__actions">
              <button
                className="btn btn--ghost btn--sm"
                onClick={cancelReactivate}
                disabled={isReactivating}
              >
                Avbryt
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={handleReactivate}
                disabled={isReactivating}
              >
                {isReactivating ? 'Aktiverar…' : 'Aktivera'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabell */}
      {products.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Namn</th>
                <th>Pris</th>
                <th>Kategori</th>
                <th>Lager</th>
                <th>Status</th>
                <th className="col-actions">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ opacity: product.isActive ? 1 : 0.5 }}>
                  <td className="col-id">{product.id}</td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatPrice(product.price)}
                  </td>
                  <td style={{ color: 'var(--a-text-muted)', fontSize: '0.825rem' }}>
                    {product.categoryName}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {product.stockQuantity}
                  </td>
                  <td>
                    <span className={`badge badge--${product.isActive ? 'success' : 'muted'}`}>
                      {product.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <div className="action-group">
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => openEditForm(product)}
                        disabled={isFormOpen}
                      >
                        Redigera
                      </button>
                      {product.isActive ? (
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => openDeactivateConfirm(product)}
                          disabled={isFormOpen}
                        >
                          Inaktivera
                        </button>
                      ) : (
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openReactivateConfirm(product)}
                          disabled={isFormOpen}
                          style={{ color: 'var(--a-success)', borderColor: 'var(--a-success)' }}
                        >
                          Aktivera
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ProductsPage
