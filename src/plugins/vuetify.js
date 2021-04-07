import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

// import colors from 'vuetify/lib/util/colors'
import config from '../config'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: config.colorTheme,
        },
    },
});
