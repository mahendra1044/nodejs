// Import Koa Router for routing
import Router from '@koa/router';
// Import CyberArkController for request handling
import { CyberArkController } from '../controllers/cyberArkController';

/**
 * Router for CyberArk API endpoints
 * @function
 */
export const cyberArkRoutes = (): Router => {
  // Create Koa Router instance
  const router = new Router();
  // Create CyberArkController instance
  const controller = new CyberArkController();

  // Define POST /initiateSafeCreation endpoint
  router.post('/cyberark/initiateSafeCreation', controller.initiateSafeCreation.bind(controller));
  // Define POST /createSafe endpoint
  router.post('/cyberark/createSafe', controller.createSafe.bind(controller));

  // Return configured router
  return router;
};