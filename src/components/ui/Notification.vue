<template>
  <div class="notification-container">
    <transition-group name="fade">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        :data-id="notif.id"
        :class="['notification', notif.type]"
        @click="removeNotification(notif.id)"
      >
        <span class="message">{{ notif.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications';

const { notifications, removeNotification } = useNotificationStore();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 300px;
  z-index: 1000;
}

.notification {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.notification.success {
  border-left: 6px solid #4caf50;
  color: #4caf50;
}

.notification.error {
  border-left: 6px solid #f44336;
  color: #f44336;
}

.notification.warning {
  border-left: 6px solid #ff9800;
  color: #ff9800;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.3s ease-in-out;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
