export default {
    ignoreAuth: false, // For Demo only
    appTitle: "LIMU 喫茶注文システム", // "CafeOrder Demo",
    colorTheme: {
        primary: '#CF3A41',//'#093a8b',
        secondary: '#FFCDD2',//'#a8ccec',
        accent: '#19978C'//'#000000'
    },
    emulators: { // firebase emulators for local debug
        firestore: {
            use: true,
            host: "localhost",
            port: 8080
        },
        auth: {
            use: true,
            host: "localhost",
            port: 9099
        }
    }
}