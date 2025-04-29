import { defineStore } from 'pinia';
import axios from 'axios';
import { useAppStore } from '@/stores/app';
import { useFetchData } from '@/composables/fetchData1';
import { useCargoStore } from '@/stores/cargo';
import Truck from '@/stores/truck';
import Cargo from '@/stores/cargo';

const appStore = useAppStore();

export interface CargoTruck {
  truck: Truck;
  cargos: Cargo[];

}

export const useCargoTruckStore = defineStore('cargoTruck', {
  state: () => ({
    cargoTrucks: [] as CargoTruck[],
    cargos: [],
    unassignedCargos: [] as Cargo[],
    cargosByTruckId: [],
    statuses: [],
    clients: [],
    loading: false,
  }),
  actions: {
    async fetchCargoTrucks() {
      this.loading = true;
      //const { fetchData } = useFetchData();
      const [response, error] = await fetchData('/cargo-truck');
      if (error) {
        console.error('Ошибка загрузки грузов и траков:', error);
        this.cargoTrucks = [];
      } else {
        this.cargoTrucks = response;
        console.log(this.cargoTrucks);
      }
      this.loading = false;
    },
    async fetchCargoTrucksByTruckId(truckId) {
      //const { fetchData } = useFetchData();
      const [response, error] = await fetchData(`/cargo-truck/${truckId}`);
      if (error) {
        console.error('Ошибка загрузки грузов по траку:', error);
      } else {
        this.cargosByTruckId = response.cargos;
      }
    },
    async fetchUnassignedCargos() {
      const [response, error] = await fetchData('/cargo-truck/unassigned-cargos');
      if (error) {
        console.error('Ошибка загрузки не назначенных грузов:', error);
      } else {
        this.unassignedCargos = response;
      }
    },
    async fetchClients() {
      //const { fetchData } = useFetchData();
      const [response, error] = await fetchData('/public/clients');
      if (error) {
        console.error('Ошибка загрузки клиентов:', error);
      } else {
        this.clients = response;
      }
    },
    async assignCargoToTruck(cargoId, truckId) {
      //const { fetchData } = useFetchData();
      const [, error] = await fetchData(`/cargo-truck/assign?cargoId=${cargoId}&truckId=${truckId}`, { method: 'POST' });
      if (error) {
        console.error('Ошибка привязки груза с id: ' + cargoId + ' к траку с id: ' + truckId, error);
      }
    },

    async unassignCargoFromTruck(cargoId, truckId) {
      //const { fetchData } = useFetchData();
      const [, error] = await fetchData(`/cargo-truck/unassign?cargoId=${cargoId}&truckId=${truckId}`, { method: 'POST' });
      if (error) {
        console.error('Ошибка отвязки груза с id: ' + cargoId + ' от трака с id: ' + truckId, error);
      }
    },
  },

});
