import { useEffect, useState } from 'react'
import Cart from '../components/Cart'
import ProductGrid from '../components/ProductGrid'
import PurchaseConfirmation from '../components/PurchaseConfirmation'
import { createSale, fetchKioskProducts } from '../api/kioskApi'

function KioskPage() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [selectedQuantities, setSelectedQuantities] = useState({})
  const [purchase, setPurchase] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alla produkter')

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        const data = await fetchKioskProducts()
        setProducts(data)
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
  const selectedItemCount = Object.values(selectedQuantities).reduce(
    (sum, quantity) => sum + quantity,
    0,
  )
  const inStockCount = products.filter(
    (product) => product.stockQuantity > 0,
  ).length
  const categories = [
    ...new Set(products.map((product) => product.categoryName).filter(Boolean)),
  ].sort((left, right) => left.localeCompare(right, 'sv'))
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
        <div className="hero-panel__content">
          <div className="hero-panel__copy">
            <p className="eyebrow">Smart Snack Kiosk</p>
            <h1>Välj snacks, dryck och favoriter i en snabb self-service-kiosk</h1>
            <p className="hero-panel__text">
              Produkter i lager visas direkt. Välj antal, lägg till i
              varukorgen och slutför köpet utan onödiga steg.
            </p>
          </div>

          <div className="hero-panel__meta" aria-label="Kiosköversikt">
            <span className="hero-chip">
              <strong>{inStockCount}</strong>
              <small>produkter i lager</small>
            </span>
            <span className="hero-chip">
              <strong>{selectedItemCount}</strong>
              <small>valda för köp</small>
            </span>
          </div>
        </div>

        <div className="hero-panel__footer">
          <div className="hero-panel__badges" aria-label="Kategorier">
            {categories.slice(0, 4).map((category) => (
              <span key={category} className="filter-chip">
                {category}
              </span>
            ))}
          </div>

          <p className="hero-panel__hint">
            Tryck på plus och minus för att välja antal. Lägg sedan till
            produkten i varukorgen till höger.
          </p>
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
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
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
