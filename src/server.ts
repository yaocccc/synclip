import * as WebSocket from 'ws';
import * as clipboardy from 'clipboardy';
import { config } from './config';

class SynclipServer {
    private wss: WebSocket.Server;
    private wsPool: Set<WebSocket> = new Set();

    private clientClipContent: string = '';

    private readonly syncInterval: number;

    constructor(port: number, syncInterval: number) {
        this.wss = new WebSocket.Server({ port });
        this.syncInterval = syncInterval;
    }

    private listenWS = (ws: WebSocket) => {
        ws.on('close', (_) => this.wsPool.delete(ws));
        ws.on('error', (_) => this.wsPool.delete(ws));
        ws.on('message', clientClipContent => {
            clientClipContent = clientClipContent.toString();
            console.log(`来自客户端的clip内容: ${clientClipContent}`);
            if (this.clientClipContent !== clientClipContent) {
                this.clientClipContent = clientClipContent;
                clipboardy.write(clientClipContent);
            }
        });
    };

    private syncClip = async () => {
        if (this.wsPool.size) {
            try {
                const serverClipContent = await clipboardy.read();
                if (serverClipContent !== this.clientClipContent) {
                    this.wsPool.forEach((ws) => {
                        ws.send(serverClipContent);
                    });
                }
            } catch (err) {}
        }
        setTimeout(this.syncClip, this.syncInterval);
    };

    public run = () => {
        this.wss.on('connection', (ws: WebSocket) => {
            this.wsPool.add(ws);
            this.listenWS(ws);
        });
        this.syncClip();
    };
}

new SynclipServer(config.serverPort, config.syncInterval).run();
