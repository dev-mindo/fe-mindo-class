import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? 'https://mindo-socket-service-swjti.ondigitalocean.app' : 'http://localhost:3004';

export const socket = io(URL);