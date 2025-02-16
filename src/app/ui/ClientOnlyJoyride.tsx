"use client";
import { useCallback, useEffect, useState } from "react";
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from "react-joyride";

interface ClientOnlyJoyrideProps {
  steps: Step[];
  run: boolean;
  callback: (data: CallBackProps) => void;
}

export default function ClientOnlyJoyride({
  steps,
  run,
  callback,
}: ClientOnlyJoyrideProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { action, type, index, status } = data;

      if (type === EVENTS.TOUR_END && status === STATUS.FINISHED) {
        // Tour ended (completed or skipped)
        // Add your logic here to end the tour completely
      } else if (
        type === EVENTS.STEP_AFTER ||
        type === EVENTS.TARGET_NOT_FOUND
      ) {
        const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        if (action === ACTIONS.NEXT || action === ACTIONS.PREV) {
          setTimeout(() => {
            const tooltip = document.querySelector(".react-joyride__tooltip");
            if (tooltip) {
              const rect = tooltip.getBoundingClientRect();
              if (rect.top < 0) {
                window.scrollBy(0, rect.top - 20);
              } else if (rect.bottom > window.innerHeight) {
                window.scrollBy(0, rect.bottom - window.innerHeight + 20);
              }
            }
          }, 100);
        }
      }

      callback(data);
    },
    [callback]
  );

  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      scrollToFirstStep={true}
      scrollOffset={100}
      disableOverlayClose={true}
      disableCloseOnEsc={true}
      hideCloseButton={true}
      styles={{
        options: {
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: "var(--radius)",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
}
