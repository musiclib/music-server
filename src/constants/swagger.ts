/**
 * The "admin" endpoints for administrative users to manage the platform users.  An administrator account is created
 * during the initial setup of the platform.
 */
export const ADMIN_APIS = 'Admin APIs';

/**
 * The "guest" endpoints for unauthenticated users to create accounts and sessions to access APIs requiring
 * authentication.  These endpoints are used by the web client and can be used by third-party clients to integrate with
 * the platform.  The "guest" endpoints do not require authentication but have strict rate limits to prevent abuse.
 */
export const GUEST_APIS = 'Guest APIs';
/**
 * The "user" endpoints managing user information for non-administrative users to manage their account credentials
 *  and sessions data, their music uploads and data.
 */
export const USER_APIS = 'User APIs';

/**
 * The JWT token key for authenticating on Swagger.  This token is a base64-encoded string that is reversible in the
 * browser.  It is signed with a secret constructed from a platform-level token, account-level token, and random
 * session token
 */
export const JWT_TOKEN = 'Session token';

export const SYNOLOGY_AUDIOSTATION_APIS = 'Synology AudioStation APIs';
export const QNAP_MUSICSTATION_APIS = 'QNAP MusicStation APIs';
