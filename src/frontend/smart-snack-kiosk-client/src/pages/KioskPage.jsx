import { useEffect, useState } from 'react'
import Cart from '../components/Cart'
import ProductGrid from '../components/ProductGrid'
import PurchaseConfirmation from '../components/PurchaseConfirmation'
import {
  createSale,
  fetchKioskCategories,
  fetchKioskProducts,
} from '../api/kioskApi'

function KioskPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [selectedQuantities, setSelectedQuantities] = useState({})
  const [purchase, setPurchase] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alla produkter')
  const [failedCategoryImages, setFailedCategoryImages] = useState({})

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const [productData, categoryData] = await Promise.all([
          fetchKioskProducts(),
          fetchKioskCategories().catch(() => []),
        ])
        setProducts(productData)
        setCategories(Array.isArray(categoryData) ? categoryData : [])
      } catch {
        setErrorMessage('Det gick inte att hämta produkter just nu.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  function updateSelectedQuantity(productId, change) {
    const product = products.find((item) => item.id === productId)
    if (!product) {
      return
    }

    setSelectedQuantities((current) => {
      const nextQuantity = Math.max(
        0,
        Math.min((current[productId] || 0) + change, product.stockQuantity),
      )

      return {
        ...current,
        [productId]: nextQuantity,
      }
    })
  }

  function handleAddToCart(productId) {
    const product = products.find((item) => item.id === productId)
    const quantityToAdd = selectedQuantities[productId] || 0

    if (!product || quantityToAdd === 0) {
      return
    }

    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === productId)

      if (!existingItem) {
        return [
          ...current,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantityToAdd,
            stockQuantity: product.stockQuantity,
          },
        ]
      }

      return current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.min(
                item.quantity + quantityToAdd,
                item.stockQuantity,
              ),
            }
          : item,
      )
    })

    setSelectedQuantities((current) => ({
      ...current,
      [productId]: 0,
    }))
    setPurchase(null)
    setErrorMessage('')
  }

  function updateCartQuantity(productId, change) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  Math.min(item.quantity + change, item.stockQuantity),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function handleRemoveItem(productId) {
    setCartItems((current) =>
      current.filter((item) => item.productId !== productId),
    )
  }

  async function reloadProducts() {
    const data = await fetchKioskProducts()
    setProducts(data)
    setCartItems((current) =>
      current
        .map((item) => {
          const latestProduct = data.find(
            (product) => product.id === item.productId,
          )

          if (!latestProduct) {
            return null
          }

          return {
            ...item,
            price: latestProduct.price,
            stockQuantity: latestProduct.stockQuantity,
            quantity: Math.min(item.quantity, latestProduct.stockQuantity),
          }
        })
        .filter((item) => item && item.quantity > 0),
    )
  }

  async function handleCheckout() {
    if (cartItems.length === 0) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const response = await createSale(cartItems)
      setPurchase(response)
      setCartItems([])
      setSelectedQuantities({})
      await reloadProducts()
    } catch (error) {
      setErrorMessage(
        error.message || 'Köpet kunde inte genomföras. Försök igen.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const categoryNames = [
    ...new Set(products.map((product) => product.categoryName).filter(Boolean)),
  ].sort((left, right) => left.localeCompare(right, 'sv'))
  const categoryCards = categoryNames.map((category) => {
    const categoryDetails = categories.find(
      (categoryItem) => categoryItem.name === category,
    )

    return {
      name: category,
      imageUrl: categoryDetails?.imageUrl || '',
      theme:
        category.toLowerCase().includes('dryck')
          ? 'drink'
          : category.toLowerCase().includes('mellan')
            ? 'meal'
            : 'snack',
    }
  })
  const sortedProducts = [...products].sort((left, right) => {
    const categoryComparison = (left.categoryName || '').localeCompare(
      right.categoryName || '',
      'sv',
    )

    if (categoryComparison !== 0) {
      return categoryComparison
    }

    return left.name.localeCompare(right.name, 'sv')
  })
  const visibleProducts =
    selectedCategory === 'Alla produkter'
      ? sortedProducts
      : sortedProducts.filter(
          (product) => product.categoryName === selectedCategory,
        )

  return (
    <main className="kiosk-page">
      <section className="hero-panel">
        <div className="hero-panel__header">
          <h1>SMART SNACK KIOSK</h1>
        </div>

        <div className="hero-category-grid" aria-label="Välj kategori">
          {categoryCards.map((category) => (
            <button
              key={category.name}
              type="button"
              className={`hero-category-card hero-category-card--${category.theme} ${selectedCategory === category.name ? 'hero-category-card--active' : ''}`}
              onClick={() => setSelectedCategory(category.name)}
              aria-pressed={selectedCategory === category.name}
            >
              {category.imageUrl && !failedCategoryImages[category.name] ? (
                <img
                  className="hero-category-card__image"
                  src={category.imageUrl}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                  onError={() =>
                    setFailedCategoryImages((current) => ({
                      ...current,
                      [category.name]: true,
                    }))
                  }
                />
              ) : null}
              <span className="hero-category-card__overlay">
                <span className="hero-category-card__label">{category.name}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="hero-panel__actions">
          <button
            type="button"
            className={`hero-panel__all-button ${selectedCategory === 'Alla produkter' ? 'hero-panel__all-button--active' : ''}`}
            onClick={() => setSelectedCategory('Alla produkter')}
            aria-pressed={selectedCategory === 'Alla produkter'}
          >
            Alla produkter
          </button>
        </div>
      </section>

      {errorMessage ? (
        <div className="feedback-banner feedback-banner--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <PurchaseConfirmation
        purchase={purchase}
        onDismiss={() => setPurchase(null)}
      />

      <section className="kiosk-layout">
        <div className="kiosk-main">
          {isLoading ? (
            <section className="empty-state">
              <h2>Hämtar produkter</h2>
              <p>Vänta medan kiosken laddar sortimentet.</p>
            </section>
          ) : (
            <ProductGrid
              products={visibleProducts}
              selectedCategory={selectedCategory}
              selectedQuantities={selectedQuantities}
              onDecreaseQuantity={(productId) =>
                updateSelectedQuantity(productId, -1)
              }
              onIncreaseQuantity={(productId) =>
                updateSelectedQuantity(productId, 1)
              }
              onAddToCart={handleAddToCart}
            />
          )}
        </div>

        <Cart
          items={cartItems}
          onDecreaseQuantity={(productId) => updateCartQuantity(productId, -1)}
          onIncreaseQuantity={(productId) => updateCartQuantity(productId, 1)}
          onRemoveItem={handleRemoveItem}
          totalAmount={totalAmount}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  )
}

export default KioskPage
