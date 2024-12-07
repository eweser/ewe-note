import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import { Layout } from './components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import Editor from './components/editor';
import { DbProvider, useDb } from './db';
import { Icons } from './lib/icons';

function App() {
  const { loaded, selectedRoom } = useDb();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {/* You can check that the ydoc exists to make sure the room is connected */}
      {loaded && selectedRoom?.ydoc ? (
        <Layout>
          <Editor />
        </Layout>
      ) : (
        // usually loads almost instantaneously, but we need to make sure a yDoc is ready before we can use it
        <div className="flex items-center justify-center h-screen">
          <Icons.Spinner className="w-24 h-24 animate-spin" />
        </div>
      )}
    </ThemeProvider>
  );
}

const AppWithDbProvider = () => (
  <DbProvider>
    <App />
  </DbProvider>
);

export default AppWithDbProvider;
