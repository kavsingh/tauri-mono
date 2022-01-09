import { useState, useContext, useCallback } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { invoker } from './bridge';
import { uiRootStyle } from './app.css';
import './style/global-style.css';

import type { VoidFunctionComponent } from 'react';
import type { SelectFilesResponse } from './bridge';

const App: VoidFunctionComponent = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;

const AppContent: VoidFunctionComponent = () => {
  const { theme } = useContext(ThemeContext);
  const [error, setError] = useState<Error | undefined>();
  const [response, setResponse] = useState<SelectFilesResponse | undefined>();

  const selectFiles = useCallback(async () => {
    try {
      setResponse(await invokeSelectFiles());
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
      <button onClick={selectFiles}>Select</button>
    </div>
  );
};

const invokeSelectFiles = invoker('select_files');
