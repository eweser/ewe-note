import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/components/theme-provider';
import { getDeviceType } from '@/db';
import type { Note, Room } from '@eweser/db';
import { useNotesRoom } from '@/notes-room';
import { useEffect } from 'react';
import { Icons } from '@/lib/icons';
import { logger } from '@/utils';

export default function Editor({
  selectedRoom,
  selectedNoteId,
}: {
  selectedRoom: Room<Note>;
  selectedNoteId: string;
}) {
  const doc = selectedRoom.ydoc;
  const provider =
    selectedRoom.ySweetProvider ?? selectedRoom.indexedDbProvider;

  const { notes, updateNoteText } = useNotesRoom(selectedRoom.id);

  const note = notes ? notes[selectedNoteId] : null;
  if (!note || !doc || !provider) {
    return <Icons.Spinner className="w-24 h-24 animate-spin" />;
  }
  // needs to be in a different component because hooks can't be called conditionally
  return (
    <EditorInternal
      selectedNoteId={selectedNoteId}
      provider={provider}
      doc={doc}
      updateNoteText={updateNoteText}
      note={note}
    />
  );
}

function EditorInternal({
  selectedNoteId,
  provider,
  doc,
  updateNoteText,
  note,
}: {
  selectedNoteId: string;
  provider: any;
  doc: any;
  updateNoteText: (text: string, note?: Note) => void;
  note: Note;
}) {
  const editor = useCreateBlockNote({
    collaboration: {
      // The Yjs Provider responsible for transporting updates:
      provider,
      // Where to store BlockNote data in the Y.Doc:
      fragment: doc.getXmlFragment(selectedNoteId),
      // Information (name and color) for this user:
      user: {
        name: getDeviceType() + Math.random().toString(36).substring(7),
        //random color per device
        color: Math.floor(Math.random() * 16777215).toString(16),
      },
    },
  });

  // Listen for changes and changes to the editor and update eweser-db note text
  // make the updateNoteText debounced so it doesn't update the note text on every keystroke
  const updateNoteTextDebounced = debounce(updateNoteText, 1000);
  editor.onChange(async (editor) => {
    updateNoteTextDebounced(await editor.blocksToMarkdownLossy(), note);
  });

  // Pull the initial note text from eweser-db and set it in the editor
  useEffect(() => {
    (async () => {
      if (!editor || !note.text) return;
      const existing = await editor.blocksToMarkdownLossy();
      if (existing && note.text && existing === note.text) {
        logger('existing === note.text');
      } else {
        const markdown = await editor.tryParseMarkdownToBlocks(note.text);
        editor.replaceBlocks(editor.document, markdown);
      }

      // set focus
      setTimeout(() => {
        editor.setTextCursorPosition(
          editor.document[editor.document.length - 1],
          'end'
        );
        editor.focus();
      }, 0);
    })();
    // don't want to rerun on note text change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);
  // TODO: listen for remote updates, but filter out updates that are from this browser

  const { theme } = useTheme();
  const usedTheme = theme === 'system' ? 'dark' : theme;

  return <BlockNoteView editor={editor} theme={usedTheme} />;
}

function debounce(func: (text: string, note?: Note) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: [string, Note?]) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
