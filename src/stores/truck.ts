import { defineStore } from 'pinia';
import axios from 'axios';

interface Truck {
  id: number;
  registrationCountry: string;
  volumeM3: number;
  departureWarehouse: string;
  deliveryWarehouse: string;
  driverPhone: string;
  additionalInformation: string;
}

class State {
  trucks: Truck[] = [];
}

export const useTruckStore = defineStore('truck', {
  state: (): State => ({
    trucks: [],
  }),
  actions: {
    async fetchTrucks() {
      try {
        const response = await axios.get('/truck');
        this.trucks = response.data.sort((a: Truck, b: Truck) => a.id - b.id);
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке грузовиков:', error);
        return [];
      }
    },

    async createTruck(truckData: Truck): Promise<Truck | null> {
      try {
        const response = await axios.post('/truck', truckData);
        this.trucks.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка добавления грузовика:', error);
        return null;
      }
    },

    async updateTruck(updatedTruck: Truck): Promise<Truck | null> {
      try {
        const response = await axios.put('/truck', updatedTruck);
        const index = this.trucks.findIndex(t => t.id === updatedTruck.id);
        if (index !== -1) {
          this.trucks[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении грузовика:', error);
        return null;
      }
    },

    async deleteTruck(id: number) {
      try {
        await axios.delete(`/truck/${id}`);
        await this.fetchTrucks();
      } catch (error) {
        console.error('Ошибка удаления грузовика:', error);
      }
    },
  },
});
