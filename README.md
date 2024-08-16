# iPerf.js

iPerf is a simple performance testing framework for front-end renderers. It is developed based on Vite and supports testing rendering time, frame rate, and can collect hardware information.

## Install

```bash
npm install iperf --save-dev
```

## Usage

1. Create a test file, e.g. `test.perf.ts`:

```typescript
export const TestName = async ({ perf, container }) => {
  // Test the rendering duration by marking the start and end of the rendering process
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  perf.mark('start');
  for (let i = 0; i < 1000; i++) {
    ctx.fillRect(0, 0, 100, 100);
  }
  perf.mark('end');
  perf.evaluate('rendering', 'start', 'end');

  // Test the rendering duration by giving a callback function
  perf.evaluate('rendering', () => {
    for (let i = 0; i < 1000; i++) {
      ctx.fillRect(0, 0, 100, 100);
    }
  });

  // Record the frame rate
  requestAnimationFrame(function loop() {
    perf.frame();
    ctx.clearRect(0, 0, 100, 100);
    ctx.fillRect(0, 0, 100, 100);
    requestAnimationFrame(loop);
  });
};
```

2. Run the test:

```bash
npx perf
```

## Configuration

You can configure iPerf by creating a `perf.config.js` file in the root of your project:

```javascript
import { defineConfig } from 'perf';

export default defineConfig({
  perf: {
    socket: {
      port: 7880,
      timeout: 60 * 1000,
    },
    report: {
      dir: 'perf/reports-1',
    },
  },
  // other vite options
});
```

## License

&copy; 2024 Aarebecca. ISC License.