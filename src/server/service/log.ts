const unhandledRejection = require('unhandled-rejection');
const stackTrace = require('stack-trace');
const rejectionEmitter = unhandledRejection({
  timeout: 20
});
const initTrace = stackTrace.get()[0].getFileName().length - 25;

rejectionEmitter.on('unhandledRejection', (error, promise) => {
  console.log('UNHANDLED ERROR: ', stackTrace.get());
  console.log('UNHANDLED ERROR: ', error);
});

// Main error logging
const error = (error: string, level?: number, user?: string, type?: string): void => {
  console.log(error)
}

// Debug logs
let debug = (error: any, module?: string, level?:number): void => {
  // console.trace(error)
  if (process.argv[2] == "debug") {
    let trace = stackTrace.get();
    console.log(trace[1].getFileName().slice(initTrace)+":"+trace[1].getLineNumber(), error, "\n")
  }
}

// cast message to user (personal collection, pushes, etc)
const cast = (text: string, user: string, exchange: string) => {

}

const log = {
  error: error,
  cast: cast,
  debug: debug
}

export {log}
