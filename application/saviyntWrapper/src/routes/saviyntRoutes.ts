// Import Koa Router for routing
import Router from '@koa/router';
// Import SaviyntController for request handling
import { SaviyntController } from '../controllers/saviyntController';

/**
 * Router for Saviynt API endpoints
 * @function
 */
export const saviyntRoutes = (): Router => {
  // Create Koa Router instance
  const router = new Router();
  // Create SaviyntController instance
  const controller = new SaviyntController();

  // Define POST /createGroup endpoint
  router.post('/saviynt/createGroup', controller.createGroup.bind(controller));
  // Define GET /checkGroupStatus endpoint
  router.get('/saviynt/checkGroupStatus', controller.checkGroupStatus.bind(controller));

  // Return configured router
  return router;
};