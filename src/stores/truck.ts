import { defineStore } from 'pinia';
import axios from 'axios';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Truck {
  id?: number;
  registrationCountry: string;
  volumeTotalM3: number;
  volumeOccupiedM3: number;
  volumeAvailableM3: number;
  departureWarehouse: string;
  arrivalWarehouse: string;
  driverFullname: string;
  driverPhone: string;
  departureDatePlanned: Date;
  departureDateActual: Date;
  arrivalDatePlanned: Date;
  arrivalDateActual: Date;
  carrier: string;
  serviceFee: number; // TODO это поле нужно??
  customsFee: number;
  expenses: number;
  additionalExpenses: number;
  totalAmount: number;
  additionalInformation?: string;
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
      const [response, error] = await fetchData('/truck');
      if (error) {
        console.error('Ошибка при загрузке фур:', error);
        return [];
      }
      this.trucks = response.sort((a: Truck, b: Truck) => a.id - b.id);
      return response;
    },

    async createTruck(truckData: Truck): Promise<Truck | null> {
      const [response, error] = await fetchData('/truck', {
        method: 'POST',
        body: JSON.stringify(truckData),
      });

      if (error) {
        console.error('Ошибка добавления фуры:', error);
        return null;
      }

      this.trucks.push(response);
      return response;
    },

    async updateTruck(updatedTruck: Truck): Promise<Truck | null> {
      const [response, error] = await fetchData('/truck', {
        method: 'PUT',
        body: JSON.stringify(updatedTruck),
      });

      if (error) {
        console.error('Ошибка при обновлении клиента:', error);
        return null;
      }

      const index = this.trucks.findIndex(c => c.id === updatedTruck.id);
      if (index !== -1) {
        this.trucks[index] = response;
      }

      return response;
    },

    async deleteTruck(id: number) {
      const [_, error] = await fetchData(`/truck/${id}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Ошибка удаления грузовика:', error);
        return;
      }

      this.trucks = this.trucks.filter(c => c.id !== id);
    },
  },
});
