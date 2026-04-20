import { useState, useEffect, useRef } from 'react'
import { getKpis, getSalesOverTime, getTopProducts, getDashboardLowStock } from '../../api/adminApi'

const PERIODS = [
  { value: 'day', label: 'Idag' },
  { value: 'week', label: 'Denna vecka' },
  { value: 'month', label: 'Denna månad' },
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

function formatDateShort(isoString) {
  return new Date(isoString).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

// ─── KPI-kort: ett kort per period med intäkt, köp och snittköp ───────────────
function PeriodKpiCard({ label, icon, revenue, salesCount, avgSale, accentColor }) {
  return (
    <div className="db-kpi-card" style={{ borderTopColor: accentColor }}>
      <div className="db-kpi-card__header">
        <span className="db-kpi-card__icon">{icon}</span>
        <span className="db-kpi-card__label">{label}</span>
      </div>
      <p className="db-kpi-card__revenue">{formatPrice(revenue)}</p>
      <div className="db-kpi-card__footer">
        <span className="db-kpi-card__meta">
          <strong>{salesCount}</strong> {salesCount === 1 ? 'köp' : 'köp'}
        </span>
        <span className="db-kpi-card__divider">·</span>
        <span className="db-kpi-card__meta">
          Snitt <strong>{formatPrice(avgSale)}</strong>
        </span>
      </div>
    </div>
  )
}

// ─── Stapeldiagram med rutnät, datumstämplar och hover-tooltip ────────────────
function BarChart({ data }) {
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  if (!data || data.length === 0) {
    return (
      <div className="db-empty-state">
        <span className="db-empty-state__icon">📊</span>
        <p>Ingen försäljningsdata för perioden.</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const gridLines = [100, 75, 50, 25, 0]

  function handleMouseEnter(e, point) {
    const rect = containerRef.current?.getBoundingClientRect()
    const barRect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: barRect.left - rect.left + barRect.width / 2,
      point,
    })
  }

  return (
    <div className="db-chart-wrapper" ref={containerRef}>
      {/* Y-axelns rutnätslinjer */}
      <div className="db-chart-grid">
        {gridLines.map((pct) => (
          <div key={pct} className="db-chart-grid__line" style={{ bottom: `${pct}%` }}>
            <span className="db-chart-grid__label">
              {pct === 0 ? '0' : formatPrice((maxRevenue * pct) / 100).replace(' kr', '')}
            </span>
          </div>
        ))}
      </div>

      {/* Staplar */}
      <div className="db-chart-bars">
        {data.map((point, i) => {
          const heightPct = Math.max((point.revenue / maxRevenue) * 100, 2)
          return (
            <div key={i} className="db-chart-bar-col">
              <div
                className="db-chart-bar"
                style={{ height: `${heightPct}%` }}
                onMouseEnter={(e) => handleMouseEnter(e, point)}
                onMouseLeave={() => setTooltip(null)}
              />
              <span className="db-chart-bar-date">{formatDateShort(point.date)}</span>
            </div>
          )
        })}
      </div>

      {/* Hover-tooltip */}
      {tooltip && (
        <div
          className="db-chart-tooltip"
          style={{ left: `${tooltip.x}px` }}
        >
          <strong>{formatDateShort(tooltip.point.date)}</strong>
          <span>{formatPrice(tooltip.point.revenue)}</span>
          <span style={{ color: 'var(--a-text-muted)', fontSize: '0.75rem' }}>
            {tooltip.point.salesCount} köp
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Topprodukter med horisontella progressbars ────────────────────────────────
function TopProductsList({ products }) {
  if (products.length === 0) {
    return (
      <div className="db-empty-state">
        <span className="db-empty-state__icon">🏆</span>
        <p>Ingen försäljning under perioden.</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1)

  return (
    <ol className="db-top-list">
      {products.map((p, i) => {
        const barWidth = (p.revenue / maxRevenue) * 100
        return (
          <li key={p.productId} className="db-top-item">
            <div className="db-top-item__header">
              <span className="db-top-item__rank">#{i + 1}</span>
              <span className="db-top-item__name">{p.productName}</span>
              <span className="db-top-item__revenue">{formatPrice(p.revenue)}</span>
            </div>
            <div className="db-top-item__bar-track">
              <div
                className="db-top-item__bar-fill"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="db-top-item__units">{p.unitsSold} sålda enheter</span>
          </li>
        )
      })}
    </ol>
  )
}

// ─── Sektionshuvud ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div className="db-section-header">
      <span className="db-section-header__title">{title}</span>
      {sub && <span className="db-section-header__sub">{sub}</span>}
    </div>
  )
}

// ─── Huvudkomponent ────────────────────────────────────────────────────────────
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

  const outOfStock = lowStock.filter((p) => p.stockStatus === 'Slut i lager')
  const periodLabel = PERIODS.find((p) => p.value === period)?.label ?? period

  return (
    <div>
      {/* Sidhuvud */}
      <div className="page-header">
        <div className="page-header__left">
          <h1>Dashboard</h1>
          <p>Översikt av försäljning och lager</p>
        </div>
      </div>

      {/* Lagervarning – visas bara om produkter är slut */}
      {outOfStock.length > 0 && (
        <div className="db-alert db-alert--danger" style={{ marginBottom: '1.5rem' }}>
          <span className="db-alert__icon">⚠</span>
          <span>
            <strong>{outOfStock.length} {outOfStock.length === 1 ? 'produkt' : 'produkter'} är slut i lager</strong>
            {' — '}{outOfStock.map((p) => p.productName).join(', ')}
          </span>
        </div>
      )}

      {/* KPI-kort: ett per period */}
      <div className="db-kpi-grid">
        <PeriodKpiCard
          label="Idag"
          icon="📅"
          revenue={kpis.revenueToday}
          salesCount={kpis.salesCountToday}
          avgSale={kpis.averageSaleAmountToday}
          accentColor="var(--a-accent)"
        />
        <PeriodKpiCard
          label="Denna vecka"
          icon="📆"
          revenue={kpis.revenueThisWeek}
          salesCount={kpis.salesCountThisWeek}
          avgSale={kpis.averageSaleAmountThisWeek}
          accentColor="var(--a-success)"
        />
        <PeriodKpiCard
          label="Denna månad"
          icon="🗓️"
          revenue={kpis.revenueThisMonth}
          salesCount={kpis.salesCountThisMonth}
          avgSale={kpis.averageSaleAmountThisMonth}
          accentColor="var(--a-warning)"
        />
      </div>

      {/* Periodväljare */}
      <div className="db-period-bar">
        <span className="db-period-bar__label">Visa diagram för:</span>
        <div className="inline-form">
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
      </div>

      {/* Diagram + Topprodukter sida vid sida */}
      <div className="db-chart-row">
        <div className="card">
          <div className="card__body">
            <SectionHeader
              title="Försäljning över tid"
              sub={periodLabel}
            />
            {isChartLoading ? (
              <div className="loading-state" style={{ padding: '3rem 0' }}>
                <div className="loading-spinner" />
              </div>
            ) : (
              <BarChart data={salesData} />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <SectionHeader
              title="Topprodukter"
              sub={periodLabel}
            />
            {isChartLoading ? (
              <div className="loading-state" style={{ padding: '3rem 0' }}>
                <div className="loading-spinner" />
              </div>
            ) : (
              <TopProductsList products={topProducts} />
            )}
          </div>
        </div>
      </div>

      {/* Lagervarningar – full tabell */}
      {lowStock.length > 0 && (
        <div className="card">
          <div className="card__body">
            <SectionHeader
              title="Lagervarningar"
              sub={`${lowStock.length} ${lowStock.length === 1 ? 'produkt' : 'produkter'} behöver åtgärd`}
            />
            <table className="data-table" style={{ marginTop: '1rem' }}>
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
