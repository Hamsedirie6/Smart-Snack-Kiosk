function CheckoutSummary({ itemCount, totalAmount, onCheckout, disabled }) {
  return (
    <div className="checkout-summary">
      <div>
        <p className="checkout-summary__label">Totalt antal artiklar</p>
        <strong>{itemCount}</strong>
      </div>
      <div>
        <p className="checkout-summary__label">Totalsumma</p>
        <strong>{totalAmount.toFixed(2)} kr</strong>
      </div>
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
