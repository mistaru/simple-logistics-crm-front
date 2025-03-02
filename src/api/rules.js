
const Rules = {
  reportTaxNumber: v => !v || /^[0-9]+$/.test(v) && v.length > 4 || 'Только цифры и требуется более 4 символов',  
  onlySpace: v => /\S/.test(v) || 'Обязательное поле',
  nospace: v => (v || '').indexOf(' ') < 0 || 'Пробелы не допустимы',
  required: v => (!!v || v === 0) || 'Обязательное поле',
  idRequired: v => !!v?.id || 'Объект не выбран',
  min: v => !!v && (v || '').length >= 8 || 'Минимум 8 символов',
  max: v => !!v && (v || '').length <= 20 || 'Максимум 20 символов',
  maxForNotification: v => !!v && (v || '').length <= 1000 || 'Максимум 20 символов',
  maxForIdentificationQuestion: v => !!v && (v || '').length <= 256 || 'Максимум 256 символов',
  email: v => !!v && v.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null || 'Некорректный email',
  latAndNum: v => v && !!v.match(/^[a-zA-Z0-9-_@]*$/) || 'Только латинские буквы и цифры',
  phone: v => v && /^(996)(\d{9})$/.test(v) || 'Неверный формат телефона (996XXXXXXXXX) ' + (v ? (v.length !== 12 ? `Требуется 12 символов, ${v.length < 12 ? 'осталось: ' + (12 - v.length) : 'лишние: ' + (v.length - 12)}` : '') : ''),
  numberWithPoint: v => /^[0-9]+(\.[0-9]+)?$/.test(v) || 'Только цифры',
  number: v => /^[0-9]+$/.test(v) || 'Только цифры',
  requiredArray: value => !!value && value.length > 0 || 'Обязательное поле',
  positiveValue: v => !!v && v > 0 || 'Неверный формат. Число должно быть положительным',
  nonNegative: v => v !== null && v !== undefined && v >= 0 || 'Число должно быть больше или равно нулю',
  dateBeforeAnother: (dateBefore, dateAfter, message) => !!dateBefore && !!dateAfter && (dateBefore < dateAfter) || message,
  dateAfterToday: (date, message) => !!date && (date > new Date() || date.toDateString() === new Date().toDateString())
        || (message || 'Дата должна превышать сегодняшний день'),
  dateAfterYesterday: (date, message) => !!date && (date >=  new Date().toJSON().slice(0, 10))
        || (message || 'Дата должна ссылаться на сегодня или позднее'),
  dateBeforeToday: (date, message) => !!date && (date < new Date() || date.toDateString() === new Date().toDateString())
        || (message || 'Дата должна ссылаться на сегодня или ранее'),
  taxNumber: s => (s.length === 14 || s.length === 12) || 'Требуется 14 или 12 символов',
  login: value => !!value || 'Введите логин',
  password: v => v && !!v.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/) || 'Слабый пароль',
  maxNumber: (value, max, message) => !max || Number(value) <= Number(max)
        || message  || `Указанное число превышает максимальное допустимое ${'(' + max + ')'}`,
  maxSum: (value, max, message) => Number(value) <= Number(max) || message,
  minNumber: (value, min, message) => !min || Number(value) >= Number(min)
        || message  || `Указанное число меньше минимального допустимого ${'(' + min + ')'}`,
  minMaxLimit: (value, min, max) => (value <= max && value >= min) || 'Значение должно быть в диапазоне от ' + min + ' до ' + max,
  dateBetweenMontesFromAndTo: (dateFrom, date, monthFrom, monthTo) =>
    new Date(date).getTime() >= new Date(dateFrom).setMonth(new Date(dateFrom).getMonth() + monthFrom)
            && new Date(date).getTime() <= new Date(dateFrom).setMonth(new Date(dateFrom).getMonth() + monthTo)
            || 'Значение должно быть в диапазоне от ' + monthFrom + ' до ' + monthTo + ' месяцев от текущей даты ',
  onlyLatinLetters: v => /^[a-zA-Z\s]+$/.test(v) || 'Только латинские буквы',
  isMultipleToSum: (value, step, message) => step ? (!!value && (value % step === 0)
        || (message + step || 'Сумма должна быть кратной ' + step)) : true,
  numberFormat: v => !v || /^(\s*|\d+)$/.test(v) || 'Только цифры',
  decimal: v => /^[0-9]+(\.[0-9]+)?$/.test(v) || 'Только числа',
};

export default Rules;