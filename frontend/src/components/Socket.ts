import { io } from 'socket.io-client';
import { SOCKET_ENDPOINT } from '../components/EnvironmentVariables';

export const socket = io(`${SOCKET_ENDPOINT}`);