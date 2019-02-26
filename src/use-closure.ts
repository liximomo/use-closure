import { useRef, useEffect, useCallback, useState } from 'react';

type Ref<T> = React.MutableRefObject<T | undefined>;
type Effect = React.EffectCallback;

interface ClosureWrapper<T> {
  proxy: T;
  ref: Ref<T>;
}

interface CaptureState<T> {
  renderEffect: Effect;
  wokrInProgressFns: T[];
  closures: ClosureWrapper<T>[];
  cursor: number;
}

interface SimpleCaptureState<T> {
  renderEffect: Effect;
  wokrInProgressFn?: T;
  closure?: ClosureWrapper<T>;
}

type Capture<T> = React.MutableRefObject<CaptureState<T>>;
type SimpleCapture<T> = React.MutableRefObject<SimpleCaptureState<T>>;

function useSimpleCapture<T>(): SimpleCapture<T> {
  const capture = useRef<SimpleCaptureState<T>>();

  if (!capture.current) {
    const captureState: SimpleCaptureState<T> = {
      renderEffect() {
        captureState.closure!.ref.current = captureState.wokrInProgressFn;
      },
    };
    capture.current = captureState;
  }

  return capture as SimpleCapture<T>;
}

export function useCapture(): Capture<any> {
  const capture = useRef<CaptureState<any>>();

  if (!capture.current) {
    const captureState: CaptureState<any> = {
      renderEffect() {
        captureState.wokrInProgressFns.forEach((fn, index) => {
          captureState.closures[index].ref.current = fn;
        });
        captureState.cursor = -1;
      },
      wokrInProgressFns: [],
      closures: [],
      cursor: -1,
    };
    capture.current = captureState;
  }

  return capture as Capture<any>;
}

export default function useClosure<T extends Function>(fn: T, capture?: Capture<T>): T {
  if (capture) {
    const captureState = capture.current;
    captureState.cursor = captureState.cursor + 1;

    // first enter
    if (captureState.cursor === 0) {
      useEffect(captureState.renderEffect);
    }

    const cursor = captureState.cursor;
    let closure = captureState.closures[cursor];
    if (!closure) {
      closure = {
        proxy: (((...args: any[]) => closure.ref.current!(...args)) as any) as T,
        ref: {
          current: undefined,
        },
      };
      captureState.closures[cursor] = closure;
    }
    captureState.wokrInProgressFns[cursor] = fn;

    return closure.proxy;
  }

  const simpleCapture = useSimpleCapture<T>();
  const captureState = simpleCapture.current;
  let closure = captureState.closure;
  if (!closure) {
    closure = {
      proxy: (((...args: any[]) => closure!.ref.current!(...args)) as any) as T,
      ref: {
        current: undefined,
      },
    };
    captureState.closure = closure;
  }
  captureState.wokrInProgressFn = fn;

  useEffect(captureState.renderEffect);

  return closure.proxy;
}
