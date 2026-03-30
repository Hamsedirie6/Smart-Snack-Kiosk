function ProductCard({
  product,
  quantity,
  onDecrease,
  onIncrease,
  onAddToCart,
}) {
  const imageSrc = product.imageUrl || '/favicon.svg'
  const isAddDisabled = quantity === 0
  const isIncreaseDisabled = quantity >= product.stockQuantity

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={imageSrc}
          alt={product.name}
        />
        <span className="product-card__category">{product.categoryName}</span>
      </div>

      <div className="product-card__content">
        <div className="product-card__header">
          <h2>{product.name}</h2>
          <p className="product-card__price">{product.price.toFixed(2)} kr</p>
        </div>

        <p className="product-card__stock">Tillgängligt: {product.stockQuantity}</p>

        <div className="quantity-picker" aria-label={`Välj antal för ${product.name}`}>
          <button
            type="button"
            className="quantity-picker__button"
            onClick={() => onDecrease(product.id)}
            disabled={quantity === 0}
            aria-label={`Minska antal för ${product.name}`}
          >
            -
          </button>
          <span className="quantity-picker__value">{quantity}</span>
          <button
            type="button"
            className="quantity-picker__button"
            onClick={() => onIncrease(product.id)}
            disabled={isIncreaseDisabled}
            aria-label={`Öka antal för ${product.name}`}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => onAddToCart(product.id)}
          disabled={isAddDisabled}
        >
          Lägg i varukorg
        </button>
      </div>
    </article>
  )
}

export default ProductCard
