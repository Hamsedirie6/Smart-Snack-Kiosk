import { useState, useEffect } from 'react'
import { getKpis, getSalesOverTime, getTopProducts, getDashboardLowStock } from '../../api/adminApi'

const PERIODS = [
  { value: 'day', label: 'Dag' },
  { value: 'week', label: 'Vecka' },
  { value: 'month', label: 'Månad' },
]

const STATUS_BADGE = {
  'Lågt lager': 'warning',
  'Slut i lager': 'danger',
}

function formatPrice(amount) {
  return amount.toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' kr'
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

// Enkel stapeldiagram-komponent utan externa bibliotek
function BarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <p style={{ color: 'var(--a-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
        Ingen försäljningsdata för perioden.
      </p>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px', padding: '0 4px' }}>
      {data.map((point, i) => {
        const heightPct = (point.revenue / maxRevenue) * 100
        return (
          <div
            key={i}
            title={`${formatDate(point.date)}: ${formatPrice(point.revenue)} (${point.salesCount} köp)`}
            style={{
              flex: 1,
              minWidth: 0,
              height: `${Math.max(heightPct, 2)}%`,
              background: 'var(--a-accent)',
              borderRadius: '3px 3px 0 0',
              opacity: 0.85,
              cursor: 'default',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.85')}
          />
        )
      })}
    </div>
  )
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="card">
      <div className="card__body">
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--a-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}>
          {label}
        </p>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--a-text)', margin: '0 0 0.125rem' }}>
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: '0.8rem', color: 'var(--a-text-muted)', margin: 0 }}>{sub}</p>
        )}
      </div>
    </div>
  )
}

function DashboardPage() {
  const [kpis, setKpis] = useState(null)
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('week')
  const [isChartLoading, setIsChartLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchAll() {
    setIsLoading(true)
    setError(null)
    try {
      const [kpisRes, salesRes, topRes, lowRes] = await Promise.all([
        getKpis(),
        getSalesOverTime(period),
        getTopProducts(period),
        getDashboardLowStock(),
      ])
      setKpis(kpisRes.data)
      setSalesData(salesRes.data)
      setTopProducts(topRes.data)
      setLowStock(lowRes.data)
    } catch {
      setError('Kunde inte hämta dashboarddata. Kontrollera att backend körs.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchChart(newPeriod) {
    setIsChartLoading(true)
    try {
      const [salesRes, topRes] = await Promise.all([
        getSalesOverTime(newPeriod),
        getTopProducts(newPeriod),
      ])
      setSalesData(salesRes.data)
      setTopProducts(topRes.data)
    } catch {
      // tyst fel – behåll gammal data
    } finally {
      setIsChartLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handlePeriod(newPeriod) {
    if (newPeriod === period) return
    setPeriod(newPeriod)
    fetchChart(newPeriod)
  }

  // --- Renderar ---

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        Hämtar dashboard…
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card__body" style={{ color: 'var(--a-danger)', textAlign: 'center' }}>
          ⚠ {error}
        </div>
      </div>
    )
  }

  const periodLabel = PERIODS.find((p) => p.value === period)?.label.toLowerCase() ?? period

  return (
    <div>
      {/* Sidhuvud */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>Dashboard</h1>
          <p>Översikt av försäljning och lager</p>
        </div>
      </div>

      {/* KPI-kort – tre kolumner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <KpiCard
          label="Intäkt idag"
          value={formatPrice(kpis.revenueToday)}
          sub={`${kpis.salesCountToday} ${kpis.salesCountToday === 1 ? 'köp' : 'köp'}`}
        />
        <KpiCard
          label="Intäkt denna vecka"
          value={formatPrice(kpis.revenueThisWeek)}
          sub={`${kpis.salesCountThisWeek} köp`}
        />
        <KpiCard
          label="Intäkt denna månad"
          value={formatPrice(kpis.revenueThisMonth)}
          sub={`${kpis.salesCountThisMonth} köp`}
        />
        <KpiCard
          label="Snittköp idag"
          value={formatPrice(kpis.averageSaleAmountToday)}
        />
        <KpiCard
          label="Snittköp denna vecka"
          value={formatPrice(kpis.averageSaleAmountThisWeek)}
        />
        <KpiCard
          label="Snittköp denna månad"
          value={formatPrice(kpis.averageSaleAmountThisMonth)}
        />
      </div>

      {/* Periodväljare */}
      <div className="inline-form" style={{ marginBottom: '0.75rem' }}>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={`btn btn--sm ${period === p.value ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => handlePeriod(p.value)}
            disabled={isChartLoading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Försäljning + Topprodukter – sida vid sida */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>

        {/* Försäljning över tid */}
        <div className="card">
          <div className="card__body">
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--a-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Försäljning – {periodLabel}
            </p>
            {isChartLoading ? (
              <div className="loading-state" style={{ padding: '2rem 0' }}>
                <div className="loading-spinner" />
              </div>
            ) : (
              <BarChart data={salesData} />
            )}
          </div>
        </div>

        {/* Topprodukter */}
        <div className="card">
          <div className="card__body">
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--a-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Topprodukter – {periodLabel}
            </p>
            {topProducts.length === 0 ? (
              <p style={{ color: 'var(--a-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                Ingen försäljning under perioden.
              </p>
            ) : (
              <ol style={{ margin: 0, padding: '0 0 0 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topProducts.map((p) => (
                  <li key={p.productId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.productName}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--a-text-muted)', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
                        {p.unitsSold} st · {formatPrice(p.revenue)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Lagervarningar */}
      {lowStock.length > 0 && (
        <div className="card">
          <div className="card__body">
            <p style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--a-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Lagervarningar ({lowStock.length})
            </p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produkt</th>
                  <th>Kategori</th>
                  <th>Saldo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.productId}>
                    <td><strong>{p.productName}</strong></td>
                    <td style={{ color: 'var(--a-text-muted)', fontSize: '0.825rem' }}>{p.categoryName}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.stockQuantity}</td>
                    <td>
                      <span className={`badge badge--${STATUS_BADGE[p.stockStatus] ?? 'muted'}`}>
                        {p.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
