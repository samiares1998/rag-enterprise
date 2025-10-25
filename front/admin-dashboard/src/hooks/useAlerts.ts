import Swal from "sweetalert2";

export const useAlerts = () => {
  const showConfirmation = async (
    title: string,
    text: string,
    icon: 'warning' | 'error' | 'info' | 'question' = 'question',
    confirmText: string = 'Confirm'
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
    });
    return result.isConfirmed;
  };

  const showSuccess = (title: string, text: string): void => {
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonColor: "#2563eb",
    });
  };

  const showError = (title: string, text: string): void => {
    Swal.fire({
      icon: "error",
      title,
      text,
    });
  };

  return {
    showConfirmation,
    showSuccess,
    showError
  };
};