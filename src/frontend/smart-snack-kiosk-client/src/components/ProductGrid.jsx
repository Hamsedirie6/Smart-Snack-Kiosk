import ProductCard from './ProductCard'

function ProductGrid({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedQuantities,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onAddToCart,
}) {
  if (products.length === 0) {
    return (
      <section className="empty-state">
        <h2>Inga produkter tillgängliga</h2>
        <p>Det finns inga produkter i lager just nu.</p>
      </section>
    )
  }

  return (
    <section className="product-section" aria-labelledby="product-section-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sortiment</p>
          <h2 id="product-section-title">Välj produkter</h2>
          <p className="section-heading__text">
            Alla kort är byggda för snabb överblick i kiosk-läge med tydligt
            pris, lagerstatus och val av antal.
          </p>
        </div>

        <div className="section-heading__meta">
          <span className="section-stat">
            <strong>{products.length}</strong>
            <small>visas nu</small>
          </span>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="filter-chip-row" aria-label="Produktkategorier">
          <button
            type="button"
            className={`filter-chip ${selectedCategory === 'Alla produkter' ? 'filter-chip--active' : ''}`}
            onClick={() => onSelectCategory('Alla produkter')}
            aria-pressed={selectedCategory === 'Alla produkter'}
          >
            Alla produkter
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${selectedCategory === category ? 'filter-chip--active' : ''}`}
              onClick={() => onSelectCategory(category)}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <div className="product-grid" aria-label="Produkter">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={selectedQuantities[product.id] || 0}
            onDecrease={onDecreaseQuantity}
            onIncrease={onIncreaseQuantity}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  )
}

export default ProductGrid
