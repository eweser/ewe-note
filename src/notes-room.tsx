import { Room, Note, Documents } from '@eweser/db';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useDb } from './db';

export type NotesRoomContextType = {
  room: Room<Note>;
  roomId: string;
  connectionStatus: string;
  notes: Documents<Note>;
  createNote: () => void;
  updateNoteText: (text: string, note?: Note) => void;
  deleteNote: (note: Note) => void;
};

const NotesRoomContextMap: {
  [key: string]: React.Context<NotesRoomContextType | undefined>;
} = {};

export const useNotesRoom = (roomId: string) => {
  const context = useContext(NotesRoomContextMap[roomId]);
  if (!context) {
    throw new Error(
      `useNotesRoom must be used within a NotesRoomProvider for roomId: ${roomId}`
    );
  }
  return context;
};

export const NotesRoomProvider = ({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId: string;
}) => {
  const { db, setSelectedNoteId } = useDb();
  const room = db.getRoom<Note>('notes', roomId);

  if (!room) {
    throw new Error(`Room with id ${roomId} not found`);
  }

  const Notes = useMemo(() => db.getDocuments(room), [room]);

  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    room.on('roomConnectionChange', setConnectionStatus);
    return () => {
      room.off('roomConnectionChange', setConnectionStatus);
    };
  }, [room, setConnectionStatus]);

  const [notes, setNotes] = useState<Documents<Note>>(
    Notes.sortByRecent(Notes.getUndeleted())
  );

  // listen for changes to the ydoc and update the state
  Notes.onChange((_event) => {
    setNotes(Notes.getUndeleted());
  });

  const createNote = () => {
    // Notes.new will fill in the metadata for you, including _id with a random string and _updated with the current timestamp
    const newNote = Notes.new({
      text: `New note: ${Object.keys(Notes.getUndeleted()).length + 1}`,
    });
    setSelectedNoteId(newNote._id);
  };

  const updateNoteText = (text: string, note?: Note) => {
    if (!note) return;
    note.text = text;
    // Notes.set will update _updated with the current timestamp
    Notes.set(note);
  };

  const deleteNote = (note: Note) => {
    Notes.delete(note._id);
  };

  if (!NotesRoomContextMap[roomId]) {
    NotesRoomContextMap[roomId] = createContext<
      NotesRoomContextType | undefined
    >(undefined);
  }

  const NotesRoomContext = NotesRoomContextMap[roomId];

  const contextValue = useMemo(
    () => ({
      room,
      roomId,
      connectionStatus,
      notes,
      createNote,
      updateNoteText,
      deleteNote,
    }),
    [
      room,
      roomId,
      connectionStatus,
      notes,
      createNote,
      updateNoteText,
      deleteNote,
    ]
  );

  return (
    <NotesRoomContext.Provider value={contextValue}>
      {children}
    </NotesRoomContext.Provider>
  );
};
