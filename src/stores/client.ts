import {defineStore} from 'pinia';
import axios from 'axios';
import {useAppStore} from '@/stores/app';

const appStore = useAppStore();

interface Client {
  id: number;
  fullName: string;
  clientCode: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  additionalInfo: string;
}

class State {
  clients: Client[] = [];
}
export const useClientStore = defineStore('client', {
  state: (): State => ({
    clients: [],
  }),
  actions: {
    async fetchClients() {
      const [response, error] = await fetchData('/client/all');
      if (error) {
        console.error('Ошибка при загрузке клиентов:', error);
        return [];
      }
      this.clients = response.sort((a: Client, b: Client) => a.id - b.id);
      return response;
    },

    async createClient(clientData: Client): Promise<Client | null> {
      const [response, error] = await fetchData('/client', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      if (error) {
        console.error('Ошибка добавления клиента:', error);
        return null;
      }

      this.clients.push(response);
      return response;
    },

    async updateClient(updatedClient: Client): Promise<Client | null> {
      const [response, error] = await fetchData('/client', {
        method: 'PUT',
        body: JSON.stringify(updatedClient),
      });

      if (error) {
        console.error('Ошибка при обновлении клиента:', error);
        return null;
      }

      const index = this.clients.findIndex(c => c.id === updatedClient.id);
      if (index !== -1) {
        this.clients[index] = response;
      }

      return response;
    },

    async deleteClient(id) {
      try {
        await axios.delete(`/client/${id}`);
        await this.fetchClients();
      } catch (error) {
        console.error('Ошибка удаления клиента:', error);
      }
    },
  },
});
