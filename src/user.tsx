import { Database } from '@eweser/db';
import { useEffect, useState } from 'react';

export const useGetUserFromDb = (db: Database) => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    avatar: '',
  });
  const profiles = db.getRooms('profiles');
  const setUserProfile = async () => {
    for (const room of profiles) {
      console.log('profileRoom', room);
      if (room.ydoc) {
        await room.load();
      }
      const profile = room.getDocuments().getAllToArray()[0];
      console.log({ profile });
      let updatedUser = { ...user };
      if (profile) {
        if (profile.firstName) {
          updatedUser.firstName = profile.firstName;
        }
        if (profile.lastName) {
          updatedUser.lastName = profile.lastName;
        }
        if (profile.avatarUrl) {
          updatedUser.avatar = profile.avatarUrl;
        }
      }
      setUser(updatedUser);
    }
  };
  for (const room of profiles) {
    room.getDocuments().onChange(setUserProfile);
  }
  useEffect(() => {
    setUserProfile();
  }, []);
  return user;
};
