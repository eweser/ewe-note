import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { useTheme } from '@/components/theme-provider';

export default function Editor() {
  const editor = useCreateBlockNote();
  const { theme } = useTheme();
  const usedTheme = theme === 'system' ? 'dark' : theme;
  return <BlockNoteView editor={editor} theme={usedTheme} />;
}
