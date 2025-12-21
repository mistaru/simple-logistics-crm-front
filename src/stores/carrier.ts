import { defineStore } from 'pinia';

interface Carrier {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  balance: number;
}

class State {
  carriers: Carrier[] = [];
}

export const useCarrierStore = defineStore('carrier', {
  state: (): State => ({
    carriers: [],
  }),
  actions: {
    async fetchCarriers() {
      const [response, error] = await fetchData('/carrier');
      if (error) {
        console.error('Ошибка при загрузке перевозчиков:', error);
        return [];
      }
      this.carriers = response.sort((a: Carrier, b: Carrier) => a.id - b.id);
      return response;
    },

    async createCarrier(carrierData: Carrier): Promise<Carrier | null> {      const [response, error] = await fetchData('/carrier', {
        method: 'POST',
        body: JSON.stringify(carrierData),
      });

      if (error) {
        console.error('Ошибка при добавлении перевозчика:', error);
        return null;
      }

      this.carriers.push(response);
      return response;
    },

    async updateCarrier(updatedCarrier: Carrier): Promise<Carrier | null> {
      const [response, error] = await fetchData('/carrier', 'PUT', updatedCarrier);

      if (error) {
        console.error('Ошибка при обновлении перевозчика:', error);
        return null;
      }

      const index = this.carriers.findIndex(c => c.id === updatedCarrier.id);
      if (index !== -1) {
        this.carriers[index] = response;
      }

      return response;
    },

    async deleteCarrier(id: number) {
      const [_, error] = await fetchData(`/carrier/${id}`, 'DELETE');

      if (error) {
        console.error('Ошибка удаления перевозчика:', error);
        return;
      }

      this.carriers = this.carriers.filter(c => c.id !== id);
    },

  },
});
