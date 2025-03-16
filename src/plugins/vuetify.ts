import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { VDateInput } from 'vuetify/labs/VDateInput';
import { ru } from 'vuetify/locale';

// Composables
import { createVuetify } from 'vuetify';

export default createVuetify({
  components: {

    VDateInput,
  },
  locale: {
    locale: 'ru',
    messages: { ru },
  },
  theme: {
    defaultTheme: 'light',
  },
});
