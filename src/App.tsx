import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';
import { Layout } from './components/layout';
import { ThemeProvider } from '@/components/theme-provider';
import Editor from './components/editor';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <Editor />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
