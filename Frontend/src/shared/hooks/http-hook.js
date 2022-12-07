import { useCallback, useEffect, useRef, useState } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const actibeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrll = new AbortController();
      actibeHttpRequest.current.push(httpAbortCtrll);
      try {
        const response = await fetch(url, {
          method: method,
          body: body,
          headers: headers,
          signal: httpAbortCtrll.signal,
        });

        const responseData = await response.json();

        actibeHttpRequest.current = actibeHttpRequest.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrll
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);

        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      actibeHttpRequest.current.forEach((abortctrl) => abortctrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
