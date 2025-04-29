import { defineStore } from 'pinia';
import { useFetchData } from '@/composables/fetchData1';

export const useTruckStore = defineStore('truck', {
  state: () => ({
    trucks: [],
    loading: false,
  }),
  actions: {
    async fetchTrucks() {
      this.loading = true;
      const { fetchData } = useFetchData();

      const [response, error] = await fetchData('/truck');

      if (error) {
        console.error('Ошибка загрузки траков:', error);
      } else {
        console.log('Данные траков:', response);
        this.trucks = response;
      }

      this.loading = false;
    },

    async createTruck(payload) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/truck', 'post', payload);
      if (!error) {
        await this.fetchTrucks();
      }
    },

    async updateTruck(payload) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/truck', 'put', payload);
      if (!error) {
        await this.fetchTrucks();
      }
    },

    async deleteTruck(id) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/truck/${id}', 'delete');
      if (!error) {
        await this.fetchTrucks();
      }
    },
  },
});
