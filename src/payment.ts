import { defineStore } from 'pinia';
import { useAppStore } from '@/stores/app';
import payment from "@/pages/Payment.vue";

const appStore = useAppStore();

interface Payment {
  id: number;
  status: string;
  cargo: number;
  planned: string;
  actual: string;
  comment: string;
}

class State {
  payments: Payment[] = [];
}

export const usePaymentStore = defineStore('payment', {
  state: (): State => ({
    payments: [],
  }),

  actions: {
    async fetchCountries() {
      const [response, error] = await fetchData('/get-all-cargo-payment-models');
      if (error) {
        console.error('Ошибка при загрузке платеже:', error);
        return [];
      }
      this.payments = response.sort((a: Payment, b: Payment) => a.id - b.id);
      return response;
    },

    async createPayment(countryData: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment', {
        method: 'POST',
        body: JSON.stringify(countryData),
      });

      if (error) {
        console.error('Ошибка при создании платежа:', error);
        return null;
      }

      this.payments.push(response);
      return response;
    },

    async updatePayment(updatedPayment: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment', {
        method: 'PUT',
        body: JSON.stringify(updatedPayment),
      });

      if (error) {
        console.error('Ошибка при обновлении платежа:', error);
        return null;
      }

      // Обновляем локальное состояние
      const index = this.payments.findIndex(c => c.id === updatedPayment.id);
      if (index !== -1) {
        this.payments[index] = response;
      }

      return response;
    },

    async deletePayment(oaymentId: number) {
      const [_, error] = await fetchData(`/payment/${paymentId}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Ошибка при удалении платежа:', error);
        return;
      }

      this.payments = this.payments.filter(c => c.id !== paymentId);
    },
  },
});
