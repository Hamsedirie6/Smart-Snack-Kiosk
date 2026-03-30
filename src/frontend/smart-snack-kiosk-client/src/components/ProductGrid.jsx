import ProductCard from './ProductCard'

function ProductGrid({
  products,
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
    <section className="product-grid" aria-label="Produkter">
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
    </section>
  )
}

export default ProductGrid
