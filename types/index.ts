export interface Event {
  id: string
  summary: string
  description: string | null
  start_time: string
  end_time: string
  location: string
  created_at: string
}

export interface UserSelection {
  id: string
  user_id: string
  event_id: string
  created_at: string
}

export interface EventWithSelection extends Event {
  isSelected?: boolean
} 