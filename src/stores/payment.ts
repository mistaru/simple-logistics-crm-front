import { defineStore } from 'pinia';
import axios from 'axios';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Payment {
  id?: number;
  actual?: string;
  planned?: string;
  status: string;
  comment?: string;
}

interface PaymentStatus {
  value: string;
  description: string;
}

class State {
  payments: Payment[] = [];
  statuses: PaymentStatus[] = [];
}

export const usePaymentStore = defineStore('payment', {
  state: (): State => ({
    payments: [],
    statuses: [],
  }),
  actions: {
    async fetchPayments() {
      const [response, error] = await fetchData('/payment');
      if (error) {
        console.error('Ошибка при загрузке грузов:', error);
        return [];
      }
      this.payments = response.sort((a: Payment, b: Payment) => a.id - b.id);
      return response;
    },

    async fetchStatuses() {
      const [response, error] = await fetchData('/enums/paymentStatuses');
      if (error) {
        console.error('Ошибка при загрузке статусов:', error);
        return [];
      }
      this.statuses = response.sort((a: PaymentStatus, b: PaymentStatus) => a.id - b.id);
      return response;
    },

    async createPayment(paymentData: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      if (error) {
        console.error('Ошибка добавления платежа:', error);
        return null;
      }

      this.payments.push(response);
      return response;
    },

    async updatePayment(paymentUpdate: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment', {
        method: 'PUT',
        body: JSON.stringify(paymentUpdate),
      });

      if (error) {
        console.error('Ошибка при обновлении платежа:', error);
        return null;
      }

      const index = this.payments.findIndex(c => c.id === paymentUpdate.id);
      if (index !== -1) {
        this.payments[index] = response;
      }

      return response;
    },

    async deletePayment(id: number) {
      try {
        await axios.delete(`/payment/${id}`);
        this.payments = this.payments.filter(c => c.id !== id);
      } catch (error) {
        console.error('Ошибка удаления платежа:', error);
      }
    },
  },
});
