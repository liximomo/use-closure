import { useRef, useLayoutEffect } from 'react';

type Ref<T> = React.MutableRefObject<T | undefined>;
type Effect = React.EffectCallback;

interface ProxyFunction<T> {
  proxy: T;
  target: T;
}

interface CaptureState<T> {
  captureEffect: Effect;
  wokrInProgressFn: T;
  closure: ProxyFunction<T>;
}

export default function useClosure<T extends Function>(fn: T): T {
  const capture = useRef<CaptureState<T>>();
  let captureState = capture.current;
  if (!captureState) {
    captureState = {
      captureEffect() {
        funcProxy.target = captureState!.wokrInProgressFn;
      },
      wokrInProgressFn: fn,
      closure: {
        proxy: (((...args: any[]) => funcProxy.target(...args)) as any) as T,
        target: fn,
      },
    };
    // store ref for quickly access
    const funcProxy = captureState.closure;
    capture.current = captureState;
  } else {
    captureState.wokrInProgressFn = fn;
  }

  useLayoutEffect(captureState.captureEffect);

  return captureState.closure.proxy;
}
