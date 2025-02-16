import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<{ id: number; type: string; message: string }[]>([]);

  const addNotification = (type: 'success' | 'error' | 'warning', message: string, timeout = 4000) => {
    const existingNotif = notifications.value.find(notif => notif.message === message);

    if (existingNotif) {
      removeNotification(existingNotif.id);
    }

    const id = Date.now();
    notifications.value.push({ id, type, message });

    setTimeout(() => removeNotification(id), timeout);
  };

  const removeNotification = (id: number) => {
    const notificationElement = document.querySelector(`[data-id="${id}"]`);
    if (notificationElement) {
      notificationElement.style.opacity = '0';
    }

    setTimeout(() => {
      notifications.value = notifications.value.filter(notif => notif.id !== id);
    }, 500);
  };

  return { notifications, addNotification, removeNotification };
});
