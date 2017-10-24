/* SystemJS module definition */
declare var module: NodeModule;

interface NodeModule {
  id: string;
}

declare var web3: any;
declare var window: Window;

declare module '*.json' {
  const value: any;
  export default value;
}
