import { defineStore } from 'pinia';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

interface Country {
  id: number;
  name: string;
  description: string;
}

class State {
  countries: Country[] = [];
}

export const useCountryStore = defineStore('country', {
  state: (): State => ({
    countries: [],
  }),

  actions: {
    async fetchCountries() {
      const [response, error] = await fetchData('/country/all');
      if (error) {
        console.error('Ошибка при загрузке стран:', error);
        return [];
      }
      this.countries = response.sort((a: Country, b: Country) => a.id - b.id);
      return response;
    },

    async createCountry(countryData: Country): Promise<Country | null> {
      const [response, error] = await fetchData('/country', {
        method: 'POST',
        body: JSON.stringify(countryData),
      });

      if (error) {
        console.error('Ошибка при создании страны:', error);
        return null;
      }

      this.countries.push(response);
      return response;
    },

    async updateCountry(updatedCountry: Country): Promise<Country | null> {
      const [response, error] = await fetchData('/country', {
        method: 'PUT',
        body: JSON.stringify(updatedCountry),
      });

      if (error) {
        console.error('Ошибка при обновлении страны:', error);
        return null;
      }

      // Обновляем локальное состояние
      const index = this.countries.findIndex(c => c.id === updatedCountry.id);
      if (index !== -1) {
        this.countries[index] = response;
      }

      return response;
    },

    async deleteCountry(countryId: number) {
      const [_, error] = await fetchData(`/country/${countryId}`, {
        method: 'DELETE',
      });

      if (error) {
        console.error('Ошибка при удалении страны:', error);
        return;
      }

      this.countries = this.countries.filter(c => c.id !== countryId);
    },
  },
});
