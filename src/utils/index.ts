import axiosIns  from '@/axios';
import axios, { AxiosError } from 'axios';

type ErrorWithMessage = {
  message: string
  code?: number
  data?: string
  name?: string
}

export function isErrorWithMessage(error: unknown, prop='message'): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    prop in error &&
    typeof (error as Record<string, unknown>)[prop] === 'string'
  );
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (axios.isAxiosError(maybeError)) {
    const axiosError = maybeError as AxiosError;
    if (axiosError.response?.data && isErrorWithMessage(axiosError.response.data)) {
      return axiosError.response.data;
    }
  }

  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export function getDate(days:number) {
  const today = new Date();
  const res = new Date();
  res.setDate(today.getDate() - days);
  return res;
};
const formattedDate = (date:Date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};
export function getPeriods(days:number | [Date,Date]) {
  const timeFrom = '00:00:00';
  const timeTo = '23:59:59';
  let dateFrom, dateTo;
  if (typeof days === 'number') {
    dateTo = `${formattedDate(new Date())} ${timeTo}`;
    dateFrom =  `${formattedDate(getDate(days))} ${timeFrom}`;
  } else {
    dateFrom =  `${formattedDate(days[0])} ${timeFrom}`;
    dateTo = `${formattedDate(days[1])} ${timeTo}`;
  }
  return { dateFrom, dateTo };

}

export interface fetchOptions {
  body?: Record<string, never> | undefined
  errHandler?: (_: unknown) => never
  isGlobal?: boolean
  params?: string | Record<string, never | string>
  headers?: Record<string, string>;
  method?: string
  errMessage?: string
}

export const  fetchData = async(url:string, options:fetchOptions={}) => {
  const store = useAppStore();
  const { body, errHandler, params, headers, method, errMessage } = options;

  try {
    const { data } = await axiosIns({
      url: url,
      method: method,
      data: body,
      headers,
      params,
    });

    if (data?.resultCode?.httpCode && data?.resultCode?.httpCode !== 200) {
      throw data?.result;
    }

    return [data?.result ?? data, null];
  } catch (error: unknown) {

    if (errHandler) {
      errHandler(error);
    } else {
      store.addMessage(errMessage || error, true);
    }

    return  [null, error];
  }
};
