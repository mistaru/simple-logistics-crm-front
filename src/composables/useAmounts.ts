import { startOfMonth, isToday, isYesterday, isThisWeek, endOfMonth  } from 'date-fns';

interface Filter {
  creditType?: string | null,
}
export function useAmounts(cb:()=>void) {
  const amountFilter = ref<Filter>({
    creditType: null,
  });
  const paramsFromFilter = computed(() => Object.fromEntries(Object.entries(amountFilter.value).filter(([_, v]) => v)));
  const store = useBidsStore();     
  const day = ref(new Date());
  const month = ref(MONTHS[new Date().getMonth()]); 
  const amountDay =  ref<number |null>(null);
  const amountToday =  ref<number |null>(null);
  const amountYesterday =  ref<number |null>(null);
  const amountCurrentWeek =  ref<number |null>(null);
  const amountCurrentMonth = ref<number |null>(null);
  const amountMonth = ref<number |null>(null);

  const getAmounts = async() =>{
    cb();
  
    amountToday.value = null;
    amountYesterday.value = null;
    amountCurrentWeek.value = null;
    amountCurrentMonth.value = null;
    amountMonth.value = null;
    amountDay.value = null;
  
    await getBidsForToday();
    await getBidsForCertainDay();
    await getBidsForCertainMonth();
    await getBidsForCertainMonth({ forCurrentMonth: true });
  
  };
  const getBidsForCertainMonth = async(opt: Record<string, boolean> = { forCurrentMonth: false }) => {
    const { forCurrentMonth } = opt;
    const currIdx = new Date().getMonth();
    const certainIdx = MONTHS.findIndex(i => month.value === i);
    if (forCurrentMonth && certainIdx === currIdx && amountMonth.value !== null) {
      amountCurrentMonth.value = amountMonth.value;
      return;
    }
    const mIdx = forCurrentMonth ? currIdx : certainIdx;
    const monthsParam = getPeriods([
      startOfMonth(new Date(new Date().getFullYear(), mIdx)), 
      endOfMonth(new Date(new Date().getFullYear(), mIdx)),
    ]);
    const { dailyStatistics } =  await store.getBids({ ...paramsFromFilter.value, ...monthsParam }) || {};
    const res = dailyStatistics?.reduce((acc, i) => acc = acc + i.count,0) || 0;
    if (forCurrentMonth) {
      amountCurrentMonth.value = res;
    } else {
      amountMonth.value = res;
    }
    if (forCurrentMonth || certainIdx === currIdx) {
      amountCurrentWeek.value = 0;
      dailyStatistics?.forEach(el => {
        const date = new Date(el.date);
        if (isToday(date)) {
          amountToday.value = el.count;
        }
  
        if (isYesterday(date)) {
          amountYesterday.value = el.count;
        }
  
        if (isThisWeek(date)) {
          amountCurrentWeek.value = (amountCurrentWeek.value ?? 0) + el.count;
        }
      });
    }
  }; 
  
  const getBidsForCertainDay = async() => {
    const dayParam = getPeriods([day.value, day.value]);
    const { dailyStatistics } = await store.getBids({ ...paramsFromFilter.value, ...dayParam }) || {};
    if (dailyStatistics?.length) {
      amountDay.value = dailyStatistics[0].count; 
    }
  };
  
  const getBidsForToday = async() => {
    if (amountToday.value !== null && amountYesterday.value !== null) return;
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayParam = getPeriods([ dayBefore, new Date]);
    const { dailyStatistics } = await store.getBids({ ...paramsFromFilter.value, ...dayParam }) || {};
  
    dailyStatistics?.forEach(i => {
      const date = new Date(i.date);
      if (isToday(date)) amountToday.value = i.count;
      if (isToday(day.value)) amountDay.value = i.count;
      if (isYesterday(date)) amountYesterday.value = i.count;
    });
  
  };
  return {
    day,
    month,
    amountDay,
    amountToday,
    amountMonth,
    amountYesterday,
    amountCurrentWeek,
    amountCurrentMonth,
    amountFilter,
    getAmounts,
    getBidsForCertainDay,
    getBidsForCertainMonth,
  };
}
