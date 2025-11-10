import {create}  from 'zustand'

interface Notification {
  _id: string
  message: string
  isRead: boolean
  createdAt: string
  type?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  setUnreadCount: (count: number) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Notification) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length
    set({ notifications, unreadCount })
  },
  
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  
  markAsRead: (id) => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => 
      n._id === id ? { ...n, isRead: true } : n
    )
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length
    set({ notifications: updatedNotifications, unreadCount })
  },
  
  markAllAsRead: () => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }))
    set({ notifications: updatedNotifications, unreadCount: 0 })
  },
  
  addNotification: (notification) => {
    const { notifications } = get()
    const updatedNotifications = [notification, ...notifications]
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length
    set({ notifications: updatedNotifications, unreadCount })
  }
}))