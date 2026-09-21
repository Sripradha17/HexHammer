/// <reference types="vite/client" />

// Lets TypeScript understand imports that end in ?worker (Vite turns them into Worker classes).
declare module "*?worker" {
  const WorkerConstructor: new () => Worker;
  export default WorkerConstructor;
}

// Monaco looks for this global to find its workers.
interface Window {
  MonacoEnvironment?: { getWorker(workerId: string, label: string): Worker };
}
