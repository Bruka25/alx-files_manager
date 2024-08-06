import { Router } from 'express';
import AppController from '../controllers/AppController';

const route = Router();
// Define the endpoints
route.get('/status', AppController.getStatus);
route.get('/stats', AppController.getStats);

module.exports = route;
