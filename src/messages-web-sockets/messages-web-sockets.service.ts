import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';
import { ConnectedClients } from './interface/connectedClients.interface';

@Injectable()
export class MessagesWebSocketsService {
    private connectedClients: ConnectedClients = {};
    
    registerClient( client: Socket ) {
        this.connectedClients[client.id] = client;
    }

    removeClient(clientId: string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): number {
        return Object.keys( this.connectedClients).length;
    }
}
