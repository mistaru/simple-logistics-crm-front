import axios from 'axios';
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
  if (axios.isAxiosError(maybeError) && isErrorWithMessage(maybeError.response?.data)) return maybeError.response?.data;
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
