import { defineStore } from 'pinia';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface City {
  id: number;
  name: string;
  description: string;
  country: number;
}
interface Country {
  id: number;
  name: string;
  description: string;
}

class State {
  cities: City[] = [];
  countries: Country[] = [];
}

export const useCityStore = defineStore('city', {
  state: (): State => ({
    cities: [],
    countries: [],
  }),

  actions: {
    async fetchCities() {
      const [response, error] = await fetchData('/city/all');
      if (error) {
        console.error('Ошибка при загрузке городов:', error);
        return [];
      }
      this.cities = response.sort((a: City, b: City) => a.id - b.id);
      return response;
    },

    async fetchCountries() {
      const [response, error] = await fetchData('/country/all');
      if (error) {
        console.error('Ошибка при загрузке стран:', error);
        return [];
      }
      this.countries = response;
      return response;
    },

    async createCity(cityData: City): Promise<City | null> {
      const payload = {
        name: cityData.name,
        description: cityData.description,
        country: { id: cityData.country.id }
      };

      const [response, error] = await fetchData('/city', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при создании города:', error);
        return null;
      }

      this.cities.push(response);
      return response;
    },

    async updateCity(updatedCity: City): Promise<City | null> {
      const payload = {
        id: updatedCity.id,
        name: updatedCity.name,
        description: updatedCity.description,
        country: { id: updatedCity.country.id }
      };

      const [response, error] = await fetchData('/city', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (error) {
        console.error('Ошибка при обновлении города:', error);
        return null;
      }

      // Обновляем локальное состояние
      const index = this.cities.findIndex(c => c.id === updatedCity.id);
      if (index !== -1) {
        this.cities[index] = response;
      }

      return response;
    }
    ,

    async deleteCity(cityId: number) {
      const [_, error] = await fetchData(`/city/${cityId}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Ошибка при удалении города:', error);
        return;
      }

      this.cities = this.cities.filter(c => c.id !== cityId);
    },
  },
});
