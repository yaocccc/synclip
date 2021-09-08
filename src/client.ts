import * as WebSocket from 'ws';
import * as clipboardy from 'clipboardy';
import { config } from './config';

class SynclipClient {
    private ws: WebSocket;
    private serverClipContent: string = '';
    private readonly syncInterval: number;

    constructor(host: string, port: number, syncInterval: number) {
        this.ws = new WebSocket(`ws://${host}:${port}`);
        this.syncInterval = syncInterval;
    }

    private syncClip = async () => {
        if (this.ws.readyState == WebSocket.OPEN) {
            try {
                const clientClipContent = await clipboardy.read();
                if (clientClipContent !== this.serverClipContent) {
                    this.ws.send(clientClipContent);
                }
            } catch (err) {}
        }
        setTimeout(this.syncClip, this.syncInterval);
    };

    public run = () => {
        this.ws.once('open', (_) => {
            this.ws.on('message', serverClipContent => {
                serverClipContent = serverClipContent.toString();
                console.log(`来自服务端的clip内容: ${serverClipContent}`);
                if (this.serverClipContent !== serverClipContent) {
                    this.serverClipContent = serverClipContent;
                    clipboardy.write(serverClipContent);
                }
            });
        });
        this.syncClip();
    };
}

new SynclipClient(config.serverHost, config.serverPort, config.syncInterval).run();
