import { defineStore } from 'pinia';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Warehouse {
  id: number;
  name: string;
  isLocal: boolean;
  city: number;
  address: string;
  phoneNumber: string;
  volumeM3: number;
}

interface City {
  id: number;
  name: string;
  description: string;
  country: number;
}

class State {
  warehouses: Warehouse[] = [];
  cities: City[] = [];
}

export const useWarehouseStore = defineStore('warehouse', {
  state: (): State => ({
    warehouses: [],
    cities: [],
  }),

  actions: {
    async fetchWarehouses() {
      const [response, error] = await fetchData('/warehouse/all');
      if (error) {
        console.error('Ошибка загрузки складов:', error);
        return [];
      }
      this.warehouses = response.sort((a: Warehouse, b: Warehouse) => a.id - b.id);
      return response;
    },

    async fetchCities() {
      const [response, error] = await fetchData('/city/all');
      if (error) {
        console.error('Ошибка при загрузке городов:', error);
        return [];
      }
      this.cities = response;
      return response;
    },

    async createWarehouse(warehouseData: Warehouse): Promise<Warehouse | null> {
      const payload = {
        name: warehouseData.name,
        isLocal: warehouseData.isLocal,
        city: { id: warehouseData.city.id },
        address: warehouseData.address,
        phoneNumber: warehouseData.phoneNumber,
        volumeM3: warehouseData.volumeM3
      };

      const [response, error] = await fetchData('/warehouse', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при создании склада:', error);
        return null;
      }

      this.warehouses.push(response);
      return response;
    },

    async updateWarehouse(updatedWarehouse: Warehouse): Promise<Warehouse | null> {
      const payload = {
        id: updatedWarehouse.id,
        name: updatedWarehouse.name,
        isLocal: updatedWarehouse.isLocal,
        city: { id: updatedWarehouse.city.id },
        address: updatedWarehouse.address,
        phoneNumber: updatedWarehouse.phoneNumber,
        volumeM3: updatedWarehouse.volumeM3
      };

      const [response, error] = await fetchData('/warehouse', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при обновлении склада:', error);
        return null;
      }

      // Обновляем локальное состояние
      const index = this.warehouses.findIndex(c => c.id === updatedWarehouse.id);
      if (index !== -1) {
        this.warehouses[index] = response;
      }

      return response;
    },

    async deleteWarehouse(id: number) {
      const [_, error] = await fetchData(`/warehouse/${id}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Ошибка при удалении склада:', error);
        return;
      }

      this.warehouses = this.warehouses.filter(w => w.id !== id);
    },
  },
});
