'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Event, EventWithSelection } from '@/types'
import { Card } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const EDGE_BASE = 'https://djgxlpdtbbykkmqtxeyf.supabase.co/functions/v1/list_events'
const EDGE_DATES = 'https://djgxlpdtbbykkmqtxeyf.supabase.co/functions/v1/list_event_dates'
const EDGE_LOCATIONS = 'https://djgxlpdtbbykkmqtxeyf.supabase.co/functions/v1/list_locations'

export default function Home() {
  const [events, setEvents] = useState<EventWithSelection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    date: 'all',
    location: 'all',
    artist: '',
    selection: 'all'
  })
  const [dateOptions, setDateOptions] = useState<string[]>([])
  const [locationOptions, setLocationOptions] = useState<{ id: string, name: string }[]>([])

  useEffect(() => {
    fetchEvents()
    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, filters.location, filters.artist])

  async function fetchEvents() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.date && filters.date !== 'all') params.append('date', filters.date)
      if (filters.location && filters.location !== 'all') params.append('location', filters.location)
      if (filters.artist) params.append('artist', filters.artist)
      const url = `${EDGE_BASE}?${params.toString()}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      console.log('Raw event data for AM/BEACH:', data.find(e => e.locations?.name === 'AM/BEACH'))
      // Map locations.name to event.location
      const mapped = (data || []).map((e: any) => ({
        ...e,
        location: e.locations?.name || '',
        locations: e.locations  // explicitly preserve the locations object
      }))
      setEvents(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function fetchFilterOptions() {
    // Fetch all possible dates
    try {
      const resDates = await fetch(EDGE_DATES)
      if (resDates.ok) {
        const dates = await resDates.json()
        setDateOptions(dates.map((d: { date: string }) => d.date))
      }
    } catch {}
    // Fetch all possible locations
    try {
      const resLocs = await fetch(EDGE_LOCATIONS)
      if (resLocs.ok) {
        const locs = await resLocs.json()
        setLocationOptions(locs)
      }
    } catch {}
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Event Schedule</h2>
        <p className="text-gray-600">Browse and filter all events.</p>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-md p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Select value={filters.date} onValueChange={value => setFilters(prev => ({ ...prev, date: value }))}>
              <SelectTrigger id="date" className="w-full border border-gray-300 bg-white text-black focus:ring-0 focus:border-black rounded-none">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray-200 rounded-none">
                <SelectItem value="all">All Dates</SelectItem>
                {dateOptions.map(date => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={filters.location} onValueChange={value => setFilters(prev => ({ ...prev, location: value }))}>
              <SelectTrigger id="location" className="w-full border border-gray-300 bg-white text-black focus:ring-0 focus:border-black rounded-none">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray-200 rounded-none">
                <SelectItem value="all">All Locations</SelectItem>
                {locationOptions.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="artist">Artist</Label>
            <Input
              id="artist"
              type="text"
              value={filters.artist}
              onChange={e => setFilters(prev => ({ ...prev, artist: e.target.value }))}
              placeholder="Search artist..."
              className="w-full border border-gray-300 bg-white text-black focus:ring-0 focus:border-black rounded-none"
            />
          </div>
          <div>
            <Label htmlFor="selection">Selection</Label>
            <Select value={filters.selection} onValueChange={value => setFilters(prev => ({ ...prev, selection: value }))}>
              <SelectTrigger id="selection" className="w-full border border-gray-300 bg-white text-black focus:ring-0 focus:border-black rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-black border-gray-200 rounded-none">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="selected">Selected Events</SelectItem>
                <SelectItem value="unselected">Unselected Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Events List */}
      <Card className="bg-white shadow-md p-4 border border-gray-200">
        {events.map(event => (
          <div
            key={event.id}
            className="border-b border-gray-200 py-4 last:border-b-0"
          >
            <h3 className="text-lg font-semibold text-black">{event.summary}</h3>
            <p className="text-gray-700">{event.location}</p>
            <p className="text-gray-500">
              {(() => {
                const start = new Date(event.start_time)
                const end = new Date(event.end_time)
                const day = start.toLocaleDateString(undefined, { weekday: 'long' })
                const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
                const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
                return `${day}, ${startTime} - ${endTime}`
              })()}
            </p>
          </div>
        ))}
      </Card>
    </div>
  )
} 