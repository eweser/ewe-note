const dummyUserName = 'dummy-user123';
const dummyUserPass = 'dumdum';

/**
 * Run the auth server from eweser-db project, cd ./packages/auth-server; npm run dev
 * If you are running on WSl, localhost:4444 might not work. Use ip addr show eth0 to find the local ip
 */
export const AUTH_SERVER =
  import.meta.env.VITE_AUTH_SERVER ?? 'http://172.31.42.92:3000';

export const env =
  import.meta.env.VITE_CI === 'true'
    ? 'ci'
    : import.meta.env.DEV
    ? 'dev'
    : 'prod';

export const dev = env === 'dev';
export const ci = env === 'ci';

export const showSignup = env !== 'prod';

export const DEV_USERNAME =
  import.meta.env.VITE_DEV_USERNAME ?? dev ? dummyUserName : '';
export const DEV_PASSWORD =
  import.meta.env.VITE_DEV_PASSWORD ?? dev ? dummyUserPass : '';

/**
 * Run the rtc server from eweser-db project, cd ./test-rpc-server; npm run serve
 * If you are running on WSl, localhost:4444 might not work. Use ip addr show eth0 to find the local ip
 *
 * Note: Could not get webrtc working across browsers so instead we are going to use the ySweet websockets to sync
 */
const localWebRtcServer = 'ws://172.31.42.92:4444/';
export const WEB_RTC_PEERS = dev || ci ? [localWebRtcServer] : undefined;
