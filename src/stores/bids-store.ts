import { defineStore } from 'pinia';

interface ValueWithDesc {
  value: string,
  description: string
}

interface State {
  creditTypes: ValueWithDesc[],
  creditStatuses: ValueWithDesc[]
}

export interface Bids {
  date: string,
  count: number
}

interface BidsResponse {
  dailyStatistics: Bids[],
  totalCount: number
}
export interface BidsByTypes {
    count: number
    creditProductType: ValueWithDesc 
}

export const useBidsStore = defineStore('bids',{
  state: (): State => ({
    creditTypes: [],
    creditStatuses: [],
  }),
  actions: {
    async getBids(params: string | Record<string, never | string>): Promise<BidsResponse> {
      const [res] = await fetchData(STAT_DAILY, { params }) ;
      return res || { dailyStatistics: [] , totalCount: 0 };
    },
    async getBidsByType(params: string | Record<string, never | string>): Promise<BidsByTypes[]> {
      const [res] = await fetchData(CREDIT_BY_TYPE, { params });
      return res || [];
    },
    async getCreditTypes() {
      const [res] = await fetchData(CREDIT_TYPE);
      this.creditTypes = res || [];
    },
    async getCreditStatuses() {
      const [res] = await fetchData(CREDIT_STATUS);
      this.creditStatuses = res || [];
    },
  },
});
