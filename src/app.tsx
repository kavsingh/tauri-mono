import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes, ThemeProvider } from '@emotion/react';

import { invoke, subscribe } from './bridge';
import GlobalStyle from './style/global-style';
import { defaultTheme } from './style/theme';

import type { FCWithoutChildren } from './typings/component';
import type { CustomResponse, CustomEvent } from './bridge';

const App: FCWithoutChildren = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
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
      .catch(setError)
      .finally(() => setLoading(false));

    return unsubscribe;
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <UIRoot>
        <h1>Heyo</h1>
        {loading ? <>Loading...</> : null}
        {error ? `${error}` : null}
        {response ? (
          <div>
            <div>{response.message}</div>
            <div>{response.otherVal}</div>
          </div>
        ) : null}
        {eventPayload ? (
          <Payload key={Math.random()}>{eventPayload.message}</Payload>
        ) : null}
      </UIRoot>
    </ThemeProvider>
  );
};

export default App;

const fadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`;

const UIRoot = styled.div`
  min-height: 100%;
  padding: 1em;
  color: ${({ theme }) => theme.colors.bodyText};
  font-family: ${({ theme }) => theme.fonts.bodyText};
  background-color: ${({ theme }) => theme.colors.background};
`;

const Payload = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`;
