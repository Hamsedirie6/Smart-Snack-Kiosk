const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export async function fetchKioskProducts() {
  const response = await fetch(`${apiBaseUrl}/products/kiosk`)

  if (!response.ok) {
    throw new Error('Det gick inte att hämta produkter.')
  }

  return response.json()
}

export async function createSale(items) {
  const response = await fetch(`${apiBaseUrl}/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }),
  })

  if (!response.ok) {
    let errorMessage = 'Köpet kunde inte genomföras.'

    try {
      const errorData = await response.json()
      errorMessage = errorData.error || errorMessage
    } catch {
      // Fallback till standardmeddelande om svaret inte är JSON.
    }

    throw new Error(errorMessage)
  }

  return response.json()
}
