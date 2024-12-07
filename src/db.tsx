import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import { Database } from '@eweser/db';
import type { Note, Registry, Room } from '@eweser/db';
import * as config from './config';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

/** to make sure that we only have one default room created, make a new uuid v4 for the default room, but if there is already one in localStorage use that*/
const randomRoomId = crypto.randomUUID();
export const roomId = localStorage.getItem('roomId') || randomRoomId;
localStorage.setItem('roomId', roomId);

function getDeviceType() {
  const userAgent = navigator.userAgent;
  let deviceType = 'Unknown';

  if (userAgent.includes('iPhone')) {
    deviceType = 'iPhone';
  } else if (userAgent.includes('Android')) {
    deviceType = 'Android';
  } else if (userAgent.includes('Windows')) {
    deviceType = 'Windows';
  } else if (userAgent.includes('Macintosh')) {
    deviceType = 'Macintosh';
  }
  return deviceType;
}

export const collectionKey = 'notes';

const initialRooms: Registry = [
  {
    collectionKey,
    id: roomId,
    // add something to the room name that will be unique to this device
    name: `Notes from my ${getDeviceType()} Device, ${new Date().toLocaleString(
      'en-US',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publicAccess: 'private',
    readAccess: [],
    writeAccess: [],
    adminAccess: [],
    token: null,
    tokenExpiry: null,
    ySweetUrl: null,
    _deleted: false,
    _ttl: null,
  },
];

export const db = new Database({
  authServer: config.AUTH_SERVER,
  // set `logLevel` to 0 to see debug messages in the console
  logLevel: 0,
  // use this to sync webRTC locally with the test-rpc-server started with `npm run start-test-rpc-server`
  webRTCPeers: config.WEB_RTC_PEERS,
  initialRooms,
});

export const loginUrl = db.generateLoginUrl({ name: 'EweNote' });

export type DbContextType = {
  db: Database;
  loginUrl: string;
  loaded: boolean;
  loggedIn: boolean;
  hasToken: boolean;
  selectedRoom: Room<Note> | null;
  selectedNoteId: string | null;
  allRooms: Room<Note>[];
};

export const DbContext = createContext<DbContextType | null>(null);

export function useDb() {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbContextProvider');
  }

  return context;
}

export const DbProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const defaultNotesRoom = db.getRoom<Note>(collectionKey, roomId);

  useEffect(() => {
    if (hasToken) {
      return;
    }
    const foundToken = db.getToken(); // will pull token from the query string or from localStorage
    if (foundToken) {
      setHasToken(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, window.location.search]); // token will be in the query string after login redirect

  useEffect(() => {
    if (loggedIn || !hasToken) {
      return;
    }
    async function login() {
      const loginRes = await db.login({ loadAllRooms: true }); // beware this could be way too many if you have a lot of rooms. Better to call db.loadRooms() on the ones you actually need.
      if (loginRes) {
        setLoggedIn(true);
      }
    }
    login();
  }, [loggedIn, hasToken]);

  useEffect(() => {
    db.on('roomsLoaded', () => {
      setLoaded(true);
    });

    return () => {
      db.off('roomsLoaded', () => {
        setLoaded(true);
      });
    };
  }, []);

  const dbContextValue = useMemo(
    () => ({
      db,
      loginUrl,
      loaded,
      loggedIn,
      hasToken,
      selectedRoom: defaultNotesRoom,
      selectedNoteId: null,
      allRooms: db.getRooms(collectionKey),
    }),
    [loaded, loggedIn, hasToken, defaultNotesRoom]
  );

  return (
    <DbContext.Provider value={dbContextValue}>{children}</DbContext.Provider>
  );
};
