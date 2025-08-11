module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://gamelocalization_api:8080/api/:path*'
            }
        ];
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3000' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type' }
                ]
            }
        ];
    }
};