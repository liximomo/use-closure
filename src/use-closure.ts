import { useRef, useEffect } from 'react';

type Ref<T> = React.MutableRefObject<T | undefined>;
type Effect = React.EffectCallback;

interface ClosureWrapper<T> {
  proxy: T;
  ref: Ref<T>;
}

interface CaptureState<T> {
  captureEffect: Effect;
  wokrInProgressFn?: T;
  closure: ClosureWrapper<T>;
}

export default function useClosure<T extends Function>(fn: T): T {
  const capture = useRef<CaptureState<T>>();
  let captureState = capture.current;
  if (!captureState) {
    captureState = {
      captureEffect() {
        ref.current = captureState!.wokrInProgressFn;
      },
      closure: {
        proxy: (((...args: any[]) => ref.current!(...args)) as any) as T,
        ref: {
          current: undefined,
        },
      },
    };
    // store ref for quickly access
    const ref = captureState.closure.ref;
    capture.current = captureState;
  }
  captureState.wokrInProgressFn = fn;

  useEffect(captureState.captureEffect);

  return captureState.closure.proxy;
}
