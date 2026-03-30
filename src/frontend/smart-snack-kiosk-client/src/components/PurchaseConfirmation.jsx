function PurchaseConfirmation({ purchase, onDismiss }) {
  if (!purchase) {
    return null
  }

  return (
    <section className="confirmation-card" aria-live="polite">
      <div>
        <p className="eyebrow">Köp genomfört</p>
        <h2>Tack för ditt köp</h2>
        <p>
          Order <strong>#{purchase.saleId}</strong> registrerades och totalsumman
          blev <strong>{purchase.totalAmount.toFixed(2)} kr</strong>.
        </p>
      </div>

      <button type="button" className="secondary-button" onClick={onDismiss}>
        Fortsätt handla
      </button>
    </section>
  )
}

export default PurchaseConfirmation
