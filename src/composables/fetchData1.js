export function useFetchData() {
  async function fetchData(url, method = 'get', payload = null) {
    try {
      const options = { method };
      if (payload) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
      }

      console.log(`Запрос: ${method.toUpperCase()} ${url}`, payload || '');

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Ответ от ${url}:`, data);

      return [data, null];
    } catch (error) {
      console.error('Ошибка в fetchData:', error);
      return [null, error];
    }
  }

  return { fetchData };
}
