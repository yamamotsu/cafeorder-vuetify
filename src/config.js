export default {
    ignoreAuth: false, // For Demo only
    appTitle: "CafeOrder Demo", // "LIMU 喫茶注文システム",
    colorTheme: {
        primary: '#093a8b', //'#CF3A41',
        secondary: '#a8ccec', //'#FFCDD2',
        accent: '#000000' //'#19978C'
    },
    emulators: { // firebase emulators for local debug
        firestore: {
            use: false,
            host: "localhost",
            port: 8080
        },
        auth: {
            use: false,
            host: "localhost",
            port: 9099
        }
    }
}