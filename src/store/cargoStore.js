// src/store/cargoStore.js
import { defineStore } from 'pinia';
import { useFetchData } from '../composables/fetchData1';

export const useCargoStore = defineStore('cargo', {
  state: () => ({
    cargos: [],
    loading: false,
  }),

  actions: {
    async fetchCargos() {
      this.loading = true;
      const { fetchData } = useFetchData(); // Используем fetchData

      const [response, error] = await fetchData('/cargo');

      if (error) {
        console.error('Ошибка загрузки грузов:', error);
      } else {
        console.log('Данные грузов:', response);
        this.cargos = response;
      }

      this.loading = false;
    },

    async createCargo(payload) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/cargo', 'post', payload);
      if (!error) {
        await this.fetchCargos();
      }
    },

    async updateCargo(payload) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData(`/cargo/${payload.id}`, 'put', payload);
      if (!error) {
        await this.fetchCargos();
      }
    },

    async deleteCargo(id) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData(`/cargo/${id}`, 'delete');
      if (!error) {
        await this.fetchCargos();
      }
    },
  },
});
