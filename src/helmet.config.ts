/* eslint-disable @typescript-eslint/quotes */
import { HelmetOptions } from 'helmet';

const origins = (process.env.ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const config: HelmetOptions = {
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', ...origins],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: null,
    },
  },
  frameguard: {
    action: 'sameorigin',
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },
  hidePoweredBy: true,
  dnsPrefetchControl: {
    allow: false,
  },
};

export default config;
