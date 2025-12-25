// app/admin/locations/page.tsx

import LocationListClient from './LocationList.client'

export const metadata = {
    title: 'Locations'
}

export default function LocationsPage() {
    return <LocationListClient />
}
