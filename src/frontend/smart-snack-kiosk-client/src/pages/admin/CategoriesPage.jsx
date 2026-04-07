import { useState, useEffect, useRef } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminApi'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Create-state
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Feedback: { type: 'success' | 'error', message: string } | null
  const [feedback, setFeedback] = useState(null)

  // Delete-state – { id, name } för kategorin som väntar på bekräftelse, eller null
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit-state
  const [editingId, setEditingId] = useState(null)   // id för raden som redigeras
  const [editName, setEditName] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // Referens till input-fältet – används för att sätta fokus automatiskt
  const createInputRef = useRef(null)
  const editInputRef = useRef(null)

  // Timer-ref för att rensa auto-dismiss utan minnesläckor
  const feedbackTimerRef = useRef(null)

  async function fetchCategories() {
    setIsLoading(true)
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch {
      showFeedback('error', 'Kunde inte hämta kategorier. Kontrollera att backend körs.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sätt fokus i input-fältet när formuläret öppnas
  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus()
    }
  }, [isCreating])

  // Sätt fokus i redigera-input när en rad öppnas för redigering
  useEffect(() => {
    if (editingId !== null) {
      editInputRef.current?.focus()
    }
  }, [editingId])

  // Feedback-toast som försvinner automatiskt efter 3 sekunder
  function showFeedback(type, message) {
    clearTimeout(feedbackTimerRef.current)
    setFeedback({ type, message })
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000)
  }

  function openCreateForm() {
    setNewName('')
    setIsCreating(true)
  }

  function cancelCreate() {
    setIsCreating(false)
    setNewName('')
  }

  async function handleCreate(event) {
    event.preventDefault()

    const trimmed = newName.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await createCategory({ name: trimmed })
      await fetchCategories()         // Uppdatera listan direkt
      setIsCreating(false)
      setNewName('')
      showFeedback('success', `Kategorin "${trimmed}" skapades.`)
    } catch {
      showFeedback('error', 'Kunde inte skapa kategorin. Försök igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openDeleteConfirm(category) {
    setPendingDelete({ id: category.id, name: category.name })
  }

  function cancelDelete() {
    setPendingDelete(null)
  }

  async function handleDelete() {
    if (!pendingDelete) return

    setIsDeleting(true)
    try {
      await deleteCategory(pendingDelete.id)
      await fetchCategories()
      const deletedName = pendingDelete.name
      setPendingDelete(null)
      showFeedback('success', `Kategorin "${deletedName}" togs bort.`)
    } catch (error) {
      if (error.response?.status === 409) {
        setPendingDelete(null)
        showFeedback('error', `Kategorin "${pendingDelete.name}" kan inte tas bort – den har produkter kopplade till sig.`)
      } else {
        showFeedback('error', 'Kunde inte ta bort kategorin. Försök igen.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  function openEdit(category) {
    setEditingId(category.id)
    setEditName(category.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function handleEditSave(event, categoryId) {
    event.preventDefault()

    const trimmed = editName.trim()
    if (!trimmed) return

    setIsEditSubmitting(true)
    try {
      await updateCategory(categoryId, { name: trimmed })
      await fetchCategories()
      setEditingId(null)
      setEditName('')
      showFeedback('success', `Kategorin uppdaterades till "${trimmed}".`)
    } catch {
      showFeedback('error', 'Kunde inte uppdatera kategorin. Försök igen.')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // --- Renderar ---

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        Hämtar kategorier…
      </div>
    )
  }

  return (
    <div>
      {/* Sidhuvud */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>Kategorier</h1>
          <p>
            {categories.length === 0
              ? 'Inga kategorier ännu'
              : `${categories.length} ${categories.length === 1 ? 'kategori' : 'kategorier'} totalt`}
          </p>
        </div>
        {!isCreating && (
          <button className="btn btn--primary" onClick={openCreateForm}>
            + Ny kategori
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

      {/* Skapa-formulär – visas ovanför tabellen */}
      {isCreating && (
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
              Ny kategori
            </p>
            <form className="inline-form" onSubmit={handleCreate}>
              <input
                ref={createInputRef}
                className="form-input"
                type="text"
                placeholder="Kategorinamn"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={100}
                required
                style={{ minWidth: '220px' }}
              />
              <button
                type="submit"
                className="btn btn--primary btn--sm"
                disabled={isSubmitting || !newName.trim()}
              >
                {isSubmitting ? 'Sparar…' : 'Spara'}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={cancelCreate}
                disabled={isSubmitting}
              >
                Avbryt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tom lista */}
      {categories.length === 0 && !isCreating && (
        <div className="placeholder-page">
          <div className="placeholder-page__icon">🏷️</div>
          <h2 className="placeholder-page__title">Inga kategorier ännu</h2>
          <p className="placeholder-page__text">
            Skapa din första kategori med knappen ovan.
          </p>
        </div>
      )}

      {/* Bekräftelsedialog – Ta bort */}
      {pendingDelete && (
        <div className="dialog-overlay" onClick={cancelDelete}>
          <div className="dialog-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Ta bort kategori?</h2>
            <p>
              Är du säker på att du vill ta bort{' '}
              <strong>"{pendingDelete.name}"</strong>?
              <br />
              Åtgärden kan inte ångras.
            </p>
            <div className="dialog-box__actions">
              <button
                className="btn btn--ghost btn--sm"
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Avbryt
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Tar bort…' : 'Ta bort'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabell */}
      {categories.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Namn</th>
                <th>Skapad</th>
                <th className="col-actions">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => {
                const isEditing = editingId === category.id

                return (
                  <tr key={category.id}>
                    <td className="col-id">{category.id}</td>
                    <td>
                      {isEditing ? (
                        <form
                          className="inline-form"
                          onSubmit={(e) => handleEditSave(e, category.id)}
                        >
                          <input
                            ref={editInputRef}
                            className="form-input"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            maxLength={100}
                            required
                            style={{ minWidth: '180px' }}
                          />
                          <button
                            type="submit"
                            className="btn btn--primary btn--sm"
                            disabled={isEditSubmitting || !editName.trim()}
                          >
                            {isEditSubmitting ? 'Sparar…' : 'Spara'}
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={cancelEdit}
                            disabled={isEditSubmitting}
                          >
                            Avbryt
                          </button>
                        </form>
                      ) : (
                        <strong>{category.name}</strong>
                      )}
                    </td>
                    <td style={{ color: 'var(--a-text-muted)', fontSize: '0.825rem' }}>
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="col-actions">
                      <div className="action-group">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEdit(category)}
                          disabled={isEditing || editingId !== null}
                        >
                          Redigera
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => openDeleteConfirm(category)}
                          disabled={isEditing || editingId !== null}
                        >
                          Ta bort
                        </button>
                      </div>
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

export default CategoriesPage
