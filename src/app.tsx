import { useState, useContext, useCallback } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { selectFiles } from './bridge';
import { uiRootStyle } from './app.css';
import './style/global-style.css';

import type { VoidFunctionComponent } from 'react';

const App: VoidFunctionComponent = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;

const AppContent: VoidFunctionComponent = () => {
  const { theme } = useContext(ThemeContext);
  const [error, setError] = useState<Error | undefined>();
  const [response, setResponse] = useState<
    Awaited<ReturnType<typeof selectFiles>> | undefined
  >();

  const selectAudioFiles = useCallback(async () => {
    try {
      setResponse(await selectFiles());
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      <h1>Hello</h1>
      {error ? `${error.message}` : null}
      <div>
        <div>{response?.files.join(', ')}</div>
      </div>
      <button onClick={selectAudioFiles}>Select</button>
    </div>
  );
};
