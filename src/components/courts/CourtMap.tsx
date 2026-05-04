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

      const map = L.map(mapRef.current!).setView([latitude, longitude], 16)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }).addTo(map)

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>${courtName}</strong><br/>${address}`)
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
    <div
      ref={mapRef}
      className="w-full rounded-lg overflow-hidden border border-border"
      style={{ height: 280 }}
    />
  )
}
