import { useEffect, useState } from "react";

const useCountdown = ({
  condition,
  seconds,
  callback,
}: {
  condition: boolean;
  seconds: number;
  callback?: () => void;
}) => {
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    if (!condition) return;

    if (countdown <= 0) {
      callback?.();
      return;
    }

    const intervalId = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [countdown, callback]);

  return countdown;
};

export default useCountdown;
