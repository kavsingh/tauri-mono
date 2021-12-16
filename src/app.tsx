import { useEffect, useState, useContext } from 'react';

import { ThemeContext, ThemeProvider } from './style/theme-context';
import { invoke, subscribe } from './bridge';
import { uiRootStyle } from './app.css';
import './style/global-style.css';

import type { VoidFunctionComponent } from 'react';
import type { CustomResponse, CustomEvent } from './bridge';

const AppContent: VoidFunctionComponent = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [response, setResponse] = useState<CustomResponse | undefined>();
  const [eventPayload, setEventPayload] = useState<CustomEvent | undefined>();

  useEffect(() => {
    setError(undefined);
    setLoading(true);

    const unsubscribe = subscribe('custom-event', ({ payload }) => {
      setEventPayload(payload);
    });

    invoke('my_custom_command', { number: 58 })
      .then(setResponse)
      .catch((err) =>
        setError(err instanceof Error ? err : new Error(String(err))),
      )
      .finally(() => setLoading(false));

    return unsubscribe;
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      <h1>Heyo</h1>
      {loading ? <>Loading...</> : null}
      {error ? `${error.message}` : null}
      {response ? (
        <div>
          <div>{response.message}</div>
          <div>{response.otherVal}</div>
        </div>
      ) : null}
      {eventPayload ? <div>{eventPayload.message}</div> : null}
    </div>
  );
};

const App: VoidFunctionComponent = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
