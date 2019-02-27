# useClosure

React hook for capture up-to-date value in closure.

## What problem dose the library solve?
Becasue how closure works in javascript. The variables in the parent scope will not change throngh a closure's liefcycle. See the example:

```js
import React, { useState, useEffect, useCallback } from 'react';

function Counter() {
  const [count, setCount] = useState(1);
  
  // useCallBack will return a memoized version of the callback to prevent unnecessary renders
  const onClickChild = useCallback(() => 
    // Nooo! `count` will always be 1
    console.log('current', count);
  });

  useEffect(() => {
    window.
    const handler = setInterval(() => {
      setCount(count => count + 1);
    }, 1000 * 1);

    return () => {
      clearInterval(handler);
    };
  }, []);

  return (
    <div>
      <div>count: {count}</div>
      <Child onClick={onClickChild} />
    </div>
  );
}
```

How can we solve this? Meet [useClosure](#usage);

## Install

```
npm install use-closure --save
```

or

```
yarn add use-closure
```

## Usage
```js
import React, { useState, useEffect } from 'react';
import useClosure from 'use-closure';

function Counter() {
  const [count, setCount] = useState(1);

  // useClosure always return the same reference, so the Child component will never re-render.
  const onClickChild = useClosure(() =>
    // Yesss! `count` will always be the current value
    console.log('current', count);
  });

  useEffect(() => {
    window.
    const handler = setInterval(() => {
      setCount(count => count + 1);
    }, 1000 * 1);

    return () => {
      clearInterval(handler);
    };
  }, []);

  return (
    <div>
      <div>count: {count}</div>
      <Child onClick={onClickChild} />
    </div>
  );
}
```

