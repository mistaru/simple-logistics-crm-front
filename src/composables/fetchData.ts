// src/composables/fetchData.js
import { useStore } from '@/store/store.js';

export function useFetchData() {
  const store = useStore();

  async function fetchData(url, method = 'get', payload = null) {
    try {
      const options = { method };
      if (payload) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      const data = await response.json();
      return [data, null];
    } catch (error) {
      store.addErrorMessages(error.message);
      return [null, error];
    }
  }

  return { fetchData };
}
