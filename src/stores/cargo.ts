import { defineStore } from 'pinia';
import axios from 'axios';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Cargo {
  id?: number;
  weight: number;
  volume: number;
  quantity: number;
  warehouseArrivalDate?: string;
  shipmentDate?: string;
  status: string;
  description?: string;
}

interface CargoStatus {
  value: string;
  description: string;
}

class State {
  cargos: Cargo[] = [];
  statuses: CargoStatus[] = [];
}

export const useCargoStore = defineStore('cargo', {
  state: (): State => ({
    cargos: [],
    statuses: [],
  }),
  actions: {
    async fetchCargos() {
      const [response, error] = await fetchData('/cargo');
      if (error) {
        console.error('Ошибка при загрузке грузов:', error);
        return [];
      }
      this.cargos = response.sort((a: Cargo, b: Cargo) => a.id - b.id);
      return response;
    },

    async fetchStatuses() {
      const [response, error] = await fetchData('/enums/cargoStatuses');
      if (error) {
        console.error('Ошибка при загрузке статусов:', error);
        return [];
      }
      this.statuses = response.sort((a: CargoStatus, b: CargoStatus) => a.id - b.id);
      return response;
    },

    async createCargo(cargoData: Cargo): Promise<Cargo | null> {
      const [response, error] = await fetchData('/cargo', {
        method: 'POST',
        body: JSON.stringify(cargoData),
      });

      if (error) {
        console.error('Ошибка добавления груза:', error);
        return null;
      }

      this.cargos.push(response);
      return response;
    },

    async updateCargo(cargoUpdate: Cargo): Promise<Cargo | null> {
      const [response, error] = await fetchData('/cargo', {
        method: 'PUT',
        body: JSON.stringify(cargoUpdate),
      });

      if (error) {
        console.error('Ошибка при обновлении груза:', error);
        return null;
      }

      const index = this.cargos.findIndex(c => c.id === cargoUpdate.id);
      if (index !== -1) {
        this.cargos[index] = response;
      }

      return response;
    },

    async deleteCargo(id: number) {
      try {
        await axios.delete(`/cargo/${id}`);
        this.cargos = this.cargos.filter(c => c.id !== id);
      } catch (error) {
        console.error('Ошибка удаления груза:', error);
      }
    },
  },
});
