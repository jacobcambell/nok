import React, { createContext, useEffect, useState } from 'react';
import { socket } from '../components/Socket';
import Loading from '../components/Loading';

export const SocketContext = createContext<any>(null);

export default function SocketProvider({ children }) {

    const [connected, setConnected] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setConnected(true);
        })
        socket.on('disconnect', () => {
            setConnected(false);
        })

        // Cleanup
        return (() => {
            socket.off('connect')
            socket.off('disconnect')
        })
    }, []);

    return (
        <SocketContext.Provider value=''>
            {connected ? children : <Loading></Loading>}
        </SocketContext.Provider>
    );
}