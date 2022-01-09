import { useEffect, useState, useContext, useCallback } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { invoke, subscribe } from './bridge';
import { uiRootStyle } from './app.css';
import './style/global-style.css';

import type { VoidFunctionComponent } from 'react';
import type { LoadFilesResponse, CustomEvent } from './bridge';

const App: VoidFunctionComponent = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;

const AppContent: VoidFunctionComponent = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [response, setResponse] = useState<LoadFilesResponse | undefined>();
  const [eventPayload, setEventPayload] = useState<CustomEvent | undefined>();

  const loadFiles = useCallback(async () => {
    try {
      setResponse(await invoke('load_files', { maybe_initial_path: '' }));
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  useEffect(() => {
    setError(undefined);
    setLoading(true);

    const unsubscribe = subscribe('custom-event', ({ payload }) => {
      setEventPayload(payload);
    });

    return unsubscribe;
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      <h1>Heyo</h1>
      {loading ? <>Loading...</> : null}
      {error ? `${error.message}` : null}
      {response ? (
        <div>
          <div>Command Response</div>
          <div>{response.success}</div>
          <div>{response.files?.join(', ')}</div>
          <div>{response.message ?? ''}</div>
        </div>
      ) : null}
      {eventPayload ? (
        <div>
          <div>Event Payload</div>
          <div>{eventPayload.message}</div>
        </div>
      ) : null}
      <button onClick={loadFiles}>Load</button>
    </div>
  );
};
