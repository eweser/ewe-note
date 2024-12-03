import '@blocknote/core/fonts/inter.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';
import { Layout } from './components/layout';

function App() {
  const editor = useCreateBlockNote();

  return (
    <Layout>
      <BlockNoteView editor={editor} />
    </Layout>
  );
}

export default App;
