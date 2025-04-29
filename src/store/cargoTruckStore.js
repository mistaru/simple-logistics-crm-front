// src/store/cargoStore.js
import { defineStore } from 'pinia';
import { useFetchData } from '../composables/fetchData1';

export const useCargoTruckStore = defineStore('cargo', {
  state: () => ({
    cargos: [],
    cargosByTruckId: [],
    statuses: [],
    clients: [],
    loading: false,
  }),
  actions: {
    async fetchCargoTrucks() {
      this.loading = true;
      const { fetchData } = useFetchData();
      const [response, error] = await fetchData('/cargo-truck');
      if (error) {
        console.error('Ошибка загрузки грузов:', error);
      } else {
        this.cargos = response;
      }
      this.loading = false;
    },
    async fetchCargoTrucksByTruckId(truckId) {
      const { fetchData } = useFetchData();
      const [response, error] = await fetchData(`/cargo-truck/${truckId}`);
      if (error) {
        console.error('Ошибка загрузки грузов по траку:', error);
      } else {
        this.cargosByTruckId = response.cargos;
      }
    },
    async fetchClients() {
      const { fetchData } = useFetchData();
      const [response, error] = await fetchData('/public/clients');
      if (error) {
        console.error('Ошибка загрузки клиентов:', error);
      } else {
        this.clients = response;
      }
    },
    async assignCargoToTruck(cargoId, truckId) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/cargo-truck/assign', 'post', { cargoId, truckId });
      if (error) {
        console.error('Ошибка привязки груза к траку:', error);
      }
    },

    async unassignCargoFromTruck(cargoId, truckId) {
      const { fetchData } = useFetchData();
      const [, error] = await fetchData('/cargo-truck/unassign', 'post', { cargoId, truckId });
      if (error) {
        console.error('Ошибка отвязки груза от трака:', error);
      }
    },
  },
});
