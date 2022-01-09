import { useState, useContext, useCallback } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { selectFiles } from './bridge';
import { uiRootStyle, dragDropStyle } from './app.css';
import './style/global-style.css';

import type { VoidFunctionComponent, DragEventHandler } from 'react';

const App: VoidFunctionComponent = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;

const AppContent: VoidFunctionComponent = () => {
  const { theme } = useContext(ThemeContext);
  const [error, setError] = useState<Error>();
  const [response, setResponse] =
    useState<Awaited<ReturnType<typeof selectFiles>>>();
  const [dropFiles, setDropFiles] = useState<unknown>();

  const selectAudioFiles = useCallback(async () => {
    try {
      setResponse(await selectFiles());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    setDropFiles(event.dataTransfer);
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      {error ? `${error.message}` : null}
      <div>
        <div>{response?.files.join(', ')}</div>
      </div>
      <button onClick={selectAudioFiles}>Select</button>
      <div onDrop={handleDrop} className={dragDropStyle} />
      <div>{String(dropFiles)}</div>
    </div>
  );
};
