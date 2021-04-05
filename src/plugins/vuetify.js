import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
    themes: {
        // light: {
        //     primary: colors.red.darken1, // #E53935
        //     secondary: colors.red.lighten4, // #FFCDD2
        //     accent: colors.indigo.base, // #3F51B5
        // },
        light: {
            primary: '#093a8b', //'#CF3A41',
            secondary: '#a8ccec', //'#FFCDD2',
            accent: '#000000'//#093a8b//'#19978C'
        },
        dark: {
            primary: colors.shades.white, // #FFF
            secondary: colors.grey.lighten2, //
            accent: colors.red.lighten4, // ##FFCDD2
        },
    },
    },
});
