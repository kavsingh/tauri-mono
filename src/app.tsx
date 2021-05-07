import { useEffect, useState } from 'react';
import { tauri } from '@tauri-apps/api';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';

import GlobalStyle from './style/global-style';
import { defaultTheme } from './style/theme';
import type { FCWithoutChildren } from './typings/component';
import type { CustomResponse } from './typings/tauri';

const App: FCWithoutChildren = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [response, setResponse] = useState<CustomResponse | undefined>();

  useEffect(() => {
    setError(undefined);
    setLoading(true);

    tauri
      .invoke<CustomResponse>('my_custom_command', { number: 58 })
      .then(setResponse)
      .catch(setError)
      .finally(() => setLoading(false));
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
      </UIRoot>
    </ThemeProvider>
  );
};

export default App;

const UIRoot = styled.div`
  min-height: 100%;
  padding: 1em;
  color: ${({ theme }) => theme.colors.bodyText};
  font-family: ${({ theme }) => theme.fonts.bodyText};
  background-color: ${({ theme }) => theme.colors.background};
`;
