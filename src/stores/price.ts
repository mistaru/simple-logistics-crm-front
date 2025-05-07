import {defineStore} from 'pinia';
import {useAppStore} from '@/stores/app';

const appStore = useAppStore();

interface Price {
  id: number;
  cargo: number;
  amount: number;
}

interface Cargo {
  id: number;
}

class State {
  prices: Price[] = [];
  cargoes: Cargo[] = [];
}

export const usePriceStore = defineStore('price', {
  state: (): State => ({
    prices: [],
    cargoes: [],
  }),

  actions: {
    async fetchPrices() {
      const [response, error] = await fetchData('/price/all');
      if (error) {
        console.error('Ошибка загрузки цен:', error);
        return [];
      }
      this.prices = response.sort((a: Price, b: Price) => a.id - b.id);
      return response;

    },

    async fetchCargoes() {
      const [response, error] = await fetchData('/cargo');
      if (error) {
        console.error('Ошибка при загрузке грузов:', error);
        return [];
      }
      this.cargoes = response;
      return response;
    },

    async createPrice(price: Price): Promise<Price | null> {
      const payload = {
        id: price.id,
        cargo: {id: price.cargo.id},
        amount: price.amount,
      };

      const [response, error] = await fetchData('/price', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при создании цены:', error);
        return null;
      }

      this.prices.push(response);
      return response;
    },

    async updatePrice(updatePrice: Price): Promise<Price | null> {
      const payload = {
        id: updatePrice.id,
        cargo: {id: updatePrice.cargo.id},
        amount: updatePrice.amount,
      };

      const [response, error] = await fetchData('/price', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при обновлении цены:', error);
        return null;
      }

      // Обновляем локальное состояние
      const index = this.prices.findIndex(c => c.id === updatePrice.id);
      if (index !== -1) {
        this.prices[index] = response;
      }

      return response;
    },

    async deletePrice(id: number) {
      const [_, error] = await fetchData(`/price/${id}`, {method: 'DELETE'});
      if (!error) this.prices = this.prices.filter(p => p.id !== id);
    },
  },
});
