/* eslint-disable max-len */
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
 * The compatibility layer for Synology AudioStation and their DS Audio smartphone apps.
 */
export const SYNOLOGY_AUDIOSTATION_APIS = 'Synology AudioStation APIs';

/**
 * The compatibility layer for QNAP Music Station and their QMusic smartphoen apps.
 */
export const QNAP_MUSICSTATION_APIS = 'QNAP Music Station APIs';

/**
 * The JWT token key for authenticating on Swagger.  This token is a base64-encoded string that is reversible in the
 * browser.  It is signed with a secret constructed from a platform-level token, account-level token, and random
 * session token
 */
export const JWT_TOKEN = 'Session token';

/**
 * Authorization header decorator for sessions
 */
export const JWT_TOKEN_HEADER = {
  name: 'Authorization',
  description: 'JWT token for authentication',
  example: 'Bearer <JWT_TOKEN>',
  required: true,
};

/**
 * Cookie header decoration for sessions
 */
export const SYNOLOGY_COOKIE_HEADER = {
  name: 'cookie',
  description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
};

/**
 * Response format for serving files
 */
export const BINARY_RESPONSE = {
  schema: {
    type: 'string',
    format: 'binary',
  },
};

export const AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/flac'];
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const XML_MIME_TYPE = 'text/xml';

export const SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION = `\nThe request must be authenticated using a valid Synology session ID and device ID cookie for the user, which can be obtained by signing in via the \`/entry.cgi\` endpoint, a two-step process requesting the encryption public key from \`/certs\` and then  submitting credentials encrypted with it.`;

export const QNAP_AUTHENTICATED_REQUEST_DESCRIPTION = `\nThe request must be authenticated using a valid JWT token passed as a URL parameter \`sid\`.`;

export const JWT_AUTHENTICATED_REQUEST_DESCRIPTION =
  '\nThe request must include a valid JWT token for the user, which can be created by authenticating via the `/guest/create-session` endpoint.';

export const FILTERED_DATA_DESCRIPTION = `\nThe data can be filtered based on various criteria and search terms allowing for more precise queries.`;

export const PAGINATED_DATA_DESCRIPTION = `\nThe data is returned in a paginated format with the ability to specify an offset and limit for the results, where the offset indicates the starting point in the raw results and the limit specifies the maximum number of items to return.`;

export const TRACK_INFORMATION_EXCLUDED = `\nThe track information is not included in the response, if necessary use the sibling \`-with-tracks\` version of this endpoint.`;

export const TRACK_INFORMATION_INCLUDED = `\nThe track information includes all the data required for your media player to display or play the music.  This can add significant data to the response but saves additional requests being made.  If the track data is unnecessary use the sibling version of this endpoint that omits it.`;

export const ADMINISTRATOR_ONLY_ROUTE = `\nOnly administrator users can access this route.  An administrator can assign this role to an account in the system settings.`;

export const QNAP_POST_TO_GET =
  'This is the same as the GET handler except the data is provided in the POST body by the iPhone app. The backend consolidates handling these requests.';
