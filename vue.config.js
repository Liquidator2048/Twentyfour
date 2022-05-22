module.exports = {
    'pwa': {
        workboxPluginMode: 'InjectManifest',
        name: 'Twentyfour',
        themeColor: '#000000',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        iconPaths: {
            'faviconSVG': 'img/logo.svg',
        },
        workboxOptions: {
            swSrc: './src/service-worker.ts',
            swDest: 'service-worker.js',
            exclude: [
                /\.map$/,
                /manifest$/,
                /\.htaccess$/,
                /service-worker\.js$/,
            ],
        },

    },
    publicPath: './',
};
