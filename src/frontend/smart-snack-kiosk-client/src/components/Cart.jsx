import CheckoutSummary from './CheckoutSummary'

function Cart({
  items,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveItem,
  totalAmount,
  onCheckout,
  isSubmitting,
}) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <aside className="cart-panel">
      <div className="cart-panel__header">
        <div>
          <p className="eyebrow">Varukorg</p>
          <h2>Din beställning</h2>
          <p className="cart-panel__subtext">
            Granska valda produkter och justera antal innan du slutför köpet.
          </p>
        </div>
        <span className="cart-panel__badge">{itemCount}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state empty-state--compact empty-state--cart">
          <div className="empty-state__icon" aria-hidden="true">
            Bag
          </div>
          <h2>Varukorgen är tom</h2>
          <p>Välj produkter i listan och lägg till dem här för att fortsätta.</p>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.productId} className="cart-item">
                <div className="cart-item__row">
                  <div className="cart-item__info">
                    <strong>{item.name}</strong>
                    <span>{item.price.toFixed(2)} kr styck</span>
                  </div>
                  <strong className="cart-item__total">
                    {(item.price * item.quantity).toFixed(2)} kr
                  </strong>
                </div>

                <div className="cart-item__actions">
                  <div className="quantity-picker quantity-picker--small">
                    <button
                      type="button"
                      className="quantity-picker__button"
                      onClick={() => onDecreaseQuantity(item.productId)}
                      aria-label={`Minska antal för ${item.name}`}
                    >
                      -
                    </button>
                    <span className="quantity-picker__value">{item.quantity}</span>
                    <button
                      type="button"
                      className="quantity-picker__button"
                      onClick={() => onIncreaseQuantity(item.productId)}
                      disabled={item.quantity >= item.stockQuantity}
                      aria-label={`Öka antal för ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => onRemoveItem(item.productId)}
                  >
                    Ta bort
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <CheckoutSummary
            itemCount={itemCount}
            totalAmount={totalAmount}
            onCheckout={onCheckout}
            disabled={isSubmitting || items.length === 0}
          />
        </>
      )}
    </aside>
  )
}

export default Cart
