import { useState, useCallback, useRef } from "react";

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const loadingMessage = useRef("Loading...");

  const startLoading = useCallback((message = "Loading...") => {
    loadingMessage.current = message;
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async (asyncFunction, message = "Loading...") => {
      startLoading(message);
      try {
        const result = await asyncFunction();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  const getMessage = useCallback(() => {
    return loadingMessage.current;
  }, []);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading,
    withLoading,
    getMessage,
  };
};
