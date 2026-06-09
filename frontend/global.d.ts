// Global augmentation so `NodeJS.Timeout` is available in RN/TS
declare namespace NodeJS {
  type Timeout = ReturnType<typeof setTimeout>;
}
