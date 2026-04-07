function CheckoutSummary({ itemCount, totalAmount, onCheckout, disabled }) {
  return (
    <div className="checkout-summary">
      <div className="checkout-summary__row">
        <div>
          <p className="checkout-summary__label">Antal artiklar</p>
          <strong>{itemCount}</strong>
        </div>
        <div className="checkout-summary__amount">
          <p className="checkout-summary__label">Totalsumma</p>
          <strong>{totalAmount.toFixed(2)} kr</strong>
        </div>
      </div>

      <p className="checkout-summary__hint">
        Kontrollera beställningen innan du fortsätter till köp.
      </p>

      <button
        type="button"
        className="primary-button primary-button--wide"
        onClick={onCheckout}
        disabled={disabled}
      >
        Genomför köp
      </button>
    </div>
  )
}

export default CheckoutSummary
