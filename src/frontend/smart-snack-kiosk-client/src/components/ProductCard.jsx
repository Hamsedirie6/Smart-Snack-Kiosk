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
      <div className="product-card__top">
        <span className="product-card__category">{product.categoryName}</span>
        <span className="product-card__availability">
          {product.stockQuantity} i lager
        </span>
      </div>

      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={imageSrc}
          alt={product.name}
        />
      </div>

      <div className="product-card__content">
        <div className="product-card__header">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__price">{product.price.toFixed(2)} kr</p>
          <p className="product-card__stock">
            Välj antal och lägg till i varukorgen när du är redo.
          </p>
        </div>

        <div className="product-card__footer">
          <div
            className="quantity-picker"
            aria-label={`Välj antal för ${product.name}`}
          >
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
            className="primary-button primary-button--wide"
            onClick={() => onAddToCart(product.id)}
            disabled={isAddDisabled}
          >
            Lägg i varukorg
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
