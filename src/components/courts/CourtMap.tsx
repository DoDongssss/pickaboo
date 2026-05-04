import { useEffect, useRef } from 'react'

interface CourtMapProps {
  latitude: number
  longitude: number
  courtName: string
  address: string
}

export function CourtMap({ latitude, longitude, courtName, address }: CourtMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // Fix default marker icon (Vite asset path issue)
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        // Better UX on mobile: disable scroll zoom so page can still scroll
        scrollWheelZoom: false,
      }).setView([latitude, longitude], 16)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }).addTo(map)

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
          `<strong style="font-size:13px">${courtName}</strong><br/>
           <span style="font-size:12px;color:#666">${address}</span>`,
          { maxWidth: 220 }
        )
        .openPopup()

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, courtName, address])

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      {/* Map itself — shorter on mobile, taller on desktop */}
      <div
        ref={mapRef}
        className="w-full"
        style={{ height: 'clamp(200px, 40vw, 280px)' }}
        aria-label={`Map showing location of ${courtName}`}
        role="region"
      />
      {/* Tap-to-open overlay hint on mobile */}
      <a
        href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2.5 sm:hidden bg-bg-surface border-t border-border text-xs text-text-2 hover:text-text-1 active:bg-bg transition-colors"
      >
        Open in Maps ↗
      </a>
    </div>
  )
}