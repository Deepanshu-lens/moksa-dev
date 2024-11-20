export {};

declare global {
  interface Window {
    api?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      navigate: (path: string) => void;
    };
  }
}
