/**
 * netlify/functions/api.js
 *
 * Wraps the Express app as a Netlify serverless function.
 * Netlify's redirect rule rewrites /api/* → /.netlify/functions/api/:splat,
 * so the function receives the path WITHOUT the /api prefix.
 * We add it back before passing to Express.
 */
const serverless = require('serverless-http');
const app = require('../../src/app');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Netlify strips /api from the path via the :splat redirect.
  // Re-add /api so Express routes (/api/auth/login, etc.) match correctly.
  if (!event.path.startsWith('/api')) {
    event.path = '/api' + event.path;
  }
  if (event.rawPath && !event.rawPath.startsWith('/api')) {
    event.rawPath = '/api' + event.rawPath;
  }

  return handler(event, context);
};
