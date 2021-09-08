const env = process.env;

export const config = {
    syncInterval: Number(env["SYNCLIP_INTERVAL"] || 1000),
    serverPort: Number(env["SYNCLIP_PORT"]),
    serverHost: env["SYNCLIP_HOST"] || 'localhost'
}
