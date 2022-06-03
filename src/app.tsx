import { useState, useContext, useCallback } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { selectFiles } from './bridge';
import { uiRootStyle, dragDropStyle } from './app.css';
import './style/global-style.css';

import type { FC, DragEventHandler } from 'react';

const App: FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;

const AppContent: FC = () => {
  const { theme } = useContext(ThemeContext);
  const [error, setError] = useState<Error>();
  const [response, setResponse] =
    useState<Awaited<ReturnType<typeof selectFiles>>>();
  const [dropFiles, setDropFiles] = useState<unknown>();

  const selectAudioFiles = useCallback(() => {
    selectFiles()
      .then(setResponse)
      .catch((reason) =>
        setError(reason instanceof Error ? reason : new Error(String(reason))),
      );
  }, []);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>((event) => {
    setDropFiles(event.dataTransfer);
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      {error ? `${error.message}` : null}
      <div>{response?.files.join(', ')}</div>
      <button onClick={selectAudioFiles}>Select</button>
      <div onDrop={handleDrop} className={dragDropStyle} />
      {dropFiles ? <div>{String(dropFiles)}</div> : null}
    </div>
  );
};
