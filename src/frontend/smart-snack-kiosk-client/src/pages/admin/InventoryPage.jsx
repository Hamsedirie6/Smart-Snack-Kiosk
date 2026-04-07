import { useState, useEffect, useRef } from 'react'
import { getInventory, updateStock } from '../../api/adminApi'

const STATUS_BADGE = {
  'I lager': 'success',
  'Lågt lager': 'warning',
  'Slut i lager': 'danger',
}

function InventoryPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter: 'all' | 'low' | 'out'
  const [filter, setFilter] = useState('all')

  // Vilken rad är öppen för lageruppdatering: id eller null
  const [editingId, setEditingId] = useState(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback: { type, message } | null
  const [feedback, setFeedback] = useState(null)

  const editInputRef = useRef(null)
  const feedbackTimerRef = useRef(null)

  async function fetchInventory() {
    setIsLoading(true)
    try {
      const response = await getInventory()
      setProducts(response.data)
    } catch {
      showFeedback('error', 'Kunde inte hämta lagerdata. Kontrollera att backend körs.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editingId !== null) {
      editInputRef.current?.focus()
    }
  }, [editingId])

  function showFeedback(type, message) {
    clearTimeout(feedbackTimerRef.current)
    setFeedback({ type, message })
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000)
  }

  function openEdit(product) {
    setEditingId(product.id)
    setNewQuantity(String(product.stockQuantity))
  }

  function cancelEdit() {
    setEditingId(null)
    setNewQuantity('')
  }

  async function handleSave(event, product) {
    event.preventDefault()

    const quantity = parseInt(newQuantity, 10)
    if (isNaN(quantity) || quantity < 0) return

    setIsSubmitting(true)
    try {
      await updateStock(product.id, quantity)
      await fetchInventory()
      setEditingId(null)
      setNewQuantity('')
      showFeedback('success', `Lagersaldo för "${product.name}" uppdaterades till ${quantity}.`)
    } catch {
      showFeedback('error', 'Kunde inte uppdatera lagersaldot. Försök igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Filtrera ---
  const filtered = products.filter((p) => {
    if (filter === 'low') return p.stockStatus === 'Lågt lager'
    if (filter === 'out') return p.stockStatus === 'Slut i lager'
    return true
  })

  const lowCount = products.filter((p) => p.stockStatus === 'Lågt lager').length
  const outCount = products.filter((p) => p.stockStatus === 'Slut i lager').length

  // --- Renderar ---

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        Hämtar lagerdata…
      </div>
    )
  }

  return (
    <div>
      {/* Sidhuvud */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>Lager</h1>
          <p>
            {products.length === 0
              ? 'Inga produkter'
              : `${products.length} ${products.length === 1 ? 'produkt' : 'produkter'}`}
            {outCount > 0 && (
              <span className="badge badge--danger" style={{ marginLeft: '0.5rem' }}>
                {outCount} slut i lager
              </span>
            )}
            {lowCount > 0 && (
              <span className="badge badge--warning" style={{ marginLeft: '0.5rem' }}>
                {lowCount} lågt lager
              </span>
            )}
          </p>
        </div>
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

      {/* Filterknappar */}
      {products.length > 0 && (
        <div className="inline-form" style={{ marginBottom: '1rem' }}>
          <button
            className={`btn btn--sm ${filter === 'all' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFilter('all')}
          >
            Alla ({products.length})
          </button>
          <button
            className={`btn btn--sm ${filter === 'low' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFilter('low')}
          >
            Lågt lager ({lowCount})
          </button>
          <button
            className={`btn btn--sm ${filter === 'out' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setFilter('out')}
          >
            Slut i lager ({outCount})
          </button>
        </div>
      )}

      {/* Tom lista */}
      {products.length === 0 && (
        <div className="placeholder-page">
          <div className="placeholder-page__icon">🏪</div>
          <h2 className="placeholder-page__title">Inga produkter i lager</h2>
          <p className="placeholder-page__text">
            Skapa produkter under Produkter-sidan först.
          </p>
        </div>
      )}

      {/* Tom filtrerad lista */}
      {products.length > 0 && filtered.length === 0 && (
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', color: 'var(--a-text-muted)' }}>
            Inga produkter matchar filtret.
          </div>
        </div>
      )}

      {/* Tabell */}
      {filtered.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Produkt</th>
                <th>Kategori</th>
                <th>Lagersaldo</th>
                <th>Status</th>
                <th className="col-actions">Uppdatera</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const isEditing = editingId === product.id

                return (
                  <tr key={product.id} style={{ opacity: product.isActive ? 1 : 0.5 }}>
                    <td className="col-id">{product.id}</td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td style={{ color: 'var(--a-text-muted)', fontSize: '0.825rem' }}>
                      {product.categoryName}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {isEditing ? (
                        <form
                          className="inline-form"
                          onSubmit={(e) => handleSave(e, product)}
                        >
                          <input
                            ref={editInputRef}
                            className="form-input"
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            min="0"
                            step="1"
                            required
                            style={{ width: '90px' }}
                          />
                          <button
                            type="submit"
                            className="btn btn--primary btn--sm"
                            disabled={isSubmitting || newQuantity === ''}
                          >
                            {isSubmitting ? 'Sparar…' : 'Spara'}
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={cancelEdit}
                            disabled={isSubmitting}
                          >
                            Avbryt
                          </button>
                        </form>
                      ) : (
                        product.stockQuantity
                      )}
                    </td>
                    <td>
                      <span className={`badge badge--${STATUS_BADGE[product.stockStatus] ?? 'muted'}`}>
                        {product.stockStatus}
                      </span>
                    </td>
                    <td className="col-actions">
                      {!isEditing && (
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEdit(product)}
                          disabled={editingId !== null}
                        >
                          Ändra saldo
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
