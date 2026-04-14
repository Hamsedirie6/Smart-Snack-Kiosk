import ProductCard from './ProductCard'

function ProductGrid({
  products,
  selectedCategory,
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
          <h2 id="product-section-title">
            {selectedCategory === 'Alla produkter'
              ? 'Alla produkter'
              : selectedCategory}
          </h2>
        </div>

        <div className="section-heading__meta">
          <span className="section-stat">
            <strong>{products.length}</strong>
            <small>visas nu</small>
          </span>
        </div>
      </div>

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
