import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useServiceLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const executeServiceCall = useCallback(async (serviceCall, options = {}) => {
    const {
      successMessage = null,
      errorMessage = "Operation failed",
      loadingMessage: customLoadingMessage = "Processing...",
      showSuccessToast = true,
      showErrorToast = true,
    } = options;

    setIsLoading(true);
    setLoadingMessage(customLoadingMessage);

    try {
      const result = await serviceCall();

      if (successMessage && showSuccessToast) {
        toast.success(successMessage);
      }

      return { success: true, data: result, error: null };
    } catch (error) {
      if (showErrorToast) {
        // Extract meaningful error message
        const message =
          error?.response?.data?.message || error?.message || errorMessage;
        toast.error(message);
      }

      return { success: false, data: null, error };
    } finally {
      setIsLoading(false);
      setLoadingMessage("Loading...");
    }
  }, []);

  return {
    isLoading,
    loadingMessage,
    executeServiceCall,
    setIsLoading,
  };
};
