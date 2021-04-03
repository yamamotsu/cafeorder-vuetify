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
            primary: '#CF3A41', //'#19978C',
            secondary: '#FFCDD2', //'#E1F2F2',
            accent: '#19978C'
        },
        dark: {
            primary: colors.shades.white, // #FFF
            secondary: colors.grey.lighten2, //
            accent: colors.red.lighten4, // ##FFCDD2
        },
    },
    },
});
