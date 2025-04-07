import { useState, useEffect } from "react";

const COOLDOWN_TIME = 60000; // 1 minute cooldown

export function useCooldown() {
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(COOLDOWN_TIME);

  useEffect(() => {
    const lastResendTime = localStorage.getItem("lastResendTime");

    if (lastResendTime) {
      const elapsedTime = Date.now() - Number(lastResendTime);
      if (elapsedTime < COOLDOWN_TIME) {
        const remainingTime = COOLDOWN_TIME - elapsedTime;
        setIsResendDisabled(true);
        setTimeRemaining(remainingTime);
      }
    }
  }, []);

  useEffect(() => {
    if (isResendDisabled && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1000) {
            setIsResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isResendDisabled, timeRemaining]);

  const resetCooldown = () => {
    setIsResendDisabled(true);
    setTimeRemaining(COOLDOWN_TIME);
    localStorage.setItem("lastResendTime", Date.now().toString());
  };

  return { isResendDisabled, timeRemaining, resetCooldown };
}
