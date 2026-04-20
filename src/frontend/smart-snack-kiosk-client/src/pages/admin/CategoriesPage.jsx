import { useState, useEffect, useRef } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/adminApi'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isPreviewableUrl(value) {
  if (!value.trim()) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [feedback, setFeedback] = useState(null)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  const createInputRef = useRef(null)
  const editInputRef = useRef(null)
  const feedbackTimerRef = useRef(null)

  async function fetchCategories() {
    setIsLoading(true)
    try {
      const response = await getCategories()
      setCategories(response.data)
    } catch {
      showFeedback(
        'error',
        'Kunde inte hämta kategorier. Kontrollera att backend körs.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus()
    }
  }, [isCreating])

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

  function openCreateForm() {
    setNewName('')
    setNewImageUrl('')
    setIsCreating(true)
  }

  function cancelCreate() {
    setIsCreating(false)
    setNewName('')
    setNewImageUrl('')
  }

  async function handleCreate(event) {
    event.preventDefault()

    const trimmedName = newName.trim()
    if (!trimmedName) return

    setIsSubmitting(true)
    try {
      await createCategory({
        name: trimmedName,
        imageUrl: newImageUrl.trim() || null,
      })
      await fetchCategories()
      setIsCreating(false)
      setNewName('')
      setNewImageUrl('')
      showFeedback('success', `Kategorin "${trimmedName}" skapades.`)
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
        showFeedback(
          'error',
          `Kategorin "${pendingDelete.name}" kan inte tas bort eftersom den har produkter kopplade till sig.`,
        )
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
    setEditImageUrl(category.imageUrl ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditImageUrl('')
  }

  async function handleEditSave(event, categoryId) {
    event.preventDefault()

    const trimmedName = editName.trim()
    if (!trimmedName) return

    setIsEditSubmitting(true)
    try {
      await updateCategory(categoryId, {
        name: trimmedName,
        imageUrl: editImageUrl.trim() || null,
      })
      await fetchCategories()
      setEditingId(null)
      setEditName('')
      setEditImageUrl('')
      showFeedback('success', `Kategorin uppdaterades till "${trimmedName}".`)
    } catch {
      showFeedback('error', 'Kunde inte uppdatera kategorin. Försök igen.')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        Hämtar kategorier...
      </div>
    )
  }

  return (
    <div>
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

      {feedback && (
        <div
          className={`feedback-toast feedback-toast--${feedback.type}`}
          role="alert"
        >
          {feedback.type === 'success' ? '✓' : '⚠'} {feedback.message}
        </div>
      )}

      {isCreating && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card__body">
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--a-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Ny kategori
            </p>

            <form onSubmit={handleCreate}>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Namn *</label>
                  <input
                    ref={createInputRef}
                    className="form-input"
                    type="text"
                    placeholder="Kategorinamn"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bild-url (valfritt)</label>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  {isPreviewableUrl(newImageUrl) && (
                    <img
                      className="admin-image-preview"
                      src={newImageUrl}
                      alt="Förhandsvisning av kategori"
                    />
                  )}
                </div>
              </div>

              <div className="inline-form">
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={isSubmitting || !newName.trim()}
                >
                  {isSubmitting ? 'Sparar...' : 'Spara'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={cancelCreate}
                  disabled={isSubmitting}
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.length === 0 && !isCreating && (
        <div className="placeholder-page">
          <div className="placeholder-page__icon">🏷️</div>
          <h2 className="placeholder-page__title">Inga kategorier ännu</h2>
          <p className="placeholder-page__text">
            Skapa din första kategori med knappen ovan.
          </p>
        </div>
      )}

      {pendingDelete && (
        <div className="dialog-overlay" onClick={cancelDelete}>
          <div
            className="dialog-box"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
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
                {isDeleting ? 'Tar bort...' : 'Ta bort'}
              </button>
            </div>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="col-id">#</th>
                <th>Namn</th>
                <th>Bild</th>
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
                          className="admin-inline-edit"
                          onSubmit={(e) => handleEditSave(e, category.id)}
                        >
                          <div className="form-group">
                            <label className="form-label">Namn *</label>
                            <input
                              ref={editInputRef}
                              className="form-input"
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              maxLength={100}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Bild-url (valfritt)</label>
                            <input
                              className="form-input"
                              type="url"
                              value={editImageUrl}
                              onChange={(e) => setEditImageUrl(e.target.value)}
                              placeholder="https://..."
                            />
                            {isPreviewableUrl(editImageUrl) && (
                              <img
                                className="admin-image-preview"
                                src={editImageUrl}
                                alt="Förhandsvisning av kategori"
                              />
                            )}
                          </div>
                          <div className="inline-form">
                            <button
                              type="submit"
                              className="btn btn--primary btn--sm"
                              disabled={isEditSubmitting || !editName.trim()}
                            >
                              {isEditSubmitting ? 'Sparar...' : 'Spara'}
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={cancelEdit}
                              disabled={isEditSubmitting}
                            >
                              Avbryt
                            </button>
                          </div>
                        </form>
                      ) : (
                        <strong>{category.name}</strong>
                      )}
                    </td>
                    <td>
                      {category.imageUrl ? (
                        <img
                          className="admin-table-thumb"
                          src={category.imageUrl}
                          alt={category.name}
                        />
                      ) : (
                        <span
                          style={{
                            color: 'var(--a-text-muted)',
                            fontSize: '0.825rem',
                          }}
                        >
                          Ingen bild
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        color: 'var(--a-text-muted)',
                        fontSize: '0.825rem',
                      }}
                    >
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="col-actions">
                      <div className="action-group">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => openEdit(category)}
                          disabled={editingId !== null}
                        >
                          Redigera
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => openDeleteConfirm(category)}
                          disabled={editingId !== null}
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
