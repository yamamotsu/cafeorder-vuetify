
export default {
    colortable: {
        white: "#fcfcfc",
        red: "rgb(229, 144, 134)",
        orange: "rgb(243, 189, 66)",
        yellow: "rgb(254, 243, 136)",
        green: "rgb(215, 252, 157)",
        lightblue: "rgb(186, 252, 236)",
        blue: "rgb(210, 239, 247)",
        darkblue: "rgb(178, 203, 246)",
        purple: "rgb(208, 178, 246)",
        pink: "rgb(246, 209, 231)",
        brown: "rgb(226, 201, 172)",
        gray: "rgb(232, 234, 237)"
    },
    str2rgb (colorCode){
        let rgb = {
            red   : 0,
            green : 0,
            blue  : 0
        }
        rgb.red   = parseInt(colorCode.substring(1, 3), 16)
        rgb.green = parseInt(colorCode.substring(3, 5), 16)
        rgb.blue  = parseInt(colorCode.substring(5, 7), 16)
        return rgb
    },
    getColorDiff (color1, color2){
        const rgb1 = this.str2rgb(color1)
        const rgb2 = this.str2rgb(color2)
        const sum = Math.abs(rgb1.red - rgb2.red) + Math.abs(rgb1.green - rgb2.green) + Math.abs(rgb1.blue - rgb2.blue)
        const mean = sum / (3 * 255)
        return mean
    },
    getBrightnessFromColorCode (colorCode) {
        const rgbMod = {
            r: 0.9, g:0.8, b:0.4
        }
        const rgb = this.str2rgb(colorCode)
        const brightness = Math.max(rgb.red * rgbMod.r, rgb.green * rgbMod.g, rgb.blue * rgbMod.b) / 255
        return brightness
    }
}