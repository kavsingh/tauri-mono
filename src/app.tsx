import classNames from "classnames";
import { useState, useContext, useCallback } from "react";

import "./style/global-style.css";
import { uiRootStyle, dragDropStyle, dragDropActiveStyle } from "./app.css";
import { selectFiles } from "./bridge";
import { useFileDrop } from "./hooks/file";
import { ThemeContext, ThemeProvider } from "./style/theme-context";

import type { FC } from "react";

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
  const { files, isActive, elementHandles } = useFileDrop();

  const selectAudioFiles = useCallback(() => {
    selectFiles()
      .then(setResponse)
      .catch((reason) =>
        setError(reason instanceof Error ? reason : new Error(String(reason)))
      );
  }, []);

  return (
    <div className={`${theme} ${uiRootStyle}`}>
      {error ? `${error.message}` : null}
      <div>{response?.files.join(", ")}</div>
      <button onClick={selectAudioFiles}>Select</button>
      <div
        {...elementHandles}
        className={classNames(dragDropStyle, {
          [dragDropActiveStyle]: isActive,
        })}
      />
      {files ? <div>{JSON.stringify(files.at(0))}</div> : null}
    </div>
  );
};
