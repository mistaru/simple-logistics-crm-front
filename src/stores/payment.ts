import { defineStore } from 'pinia';
import axios from 'axios';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Payment {
  id?: number;
  actual?: string;
  payer_id: number;
  comment?: string;
  type: 'CLIENT_PAYS_FOR_CARGO' | 'COMPANY_PAYS_CARRIERS';

}

interface CargoId{
  id?: number;
}

interface TruckId{
  id?: number;
}

class State {
  payments: Payment[] = [];
  cargoIds: CargoId[] = [];
  truckIds: TruckId[] = [];
}

export const usePaymentStore = defineStore('payment', {
  state: (): State => ({
    payments: [],
    cargoIds: [],
    truckIds: [],
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

    async fetchCargoIds() {
      const [response, error] = await fetchData('/cargo/ids');
      if (error) {
        console.error('Ошибка при загрузке грузов:', error);
        return [];
      }
      this.cargoIds = response.sort((a: CargoId, b: CargoId) => a.id - b.id);
      return response;
    },

    async fetchTruckIds() {
      const [response, error] = await fetchData('/truck/ids');
      if (error) {
        console.error('Ошибка при загрузке фур:', error);
        return [];
      }
      this.truckIds = response.sort((a: TruckId, b: TruckId) => a.id - b.id);
      return response;
    },

    async createPayment(paymentData: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment/cargo', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      if (error) {
        console.error('Ошибка добавления платежа клиентом:', error);
        return null;
      }

      this.payments.push(response);
      return response;
    },

    async createPaymentTruck(paymentData: Payment): Promise<Payment | null> {
      const [response, error] = await fetchData('/payment/truck', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      if (error) {
        console.error('Ошибка добавления платежа перевозчику:', error);
        return null;
      }

      this.payments.push(response);
      return response;
    },

    async updatePayment(paymentUpdate: Payment): Promise<Payment | null> {

      const payload = {
        ...paymentUpdate,
        status: paymentUpdate.status?.value ?? null,
      };

      const [response, error] = await fetchData('/payment', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при обновлении платежа перевозчику:', error);
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
