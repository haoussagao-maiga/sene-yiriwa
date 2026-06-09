// Global type fixes for React Native + TypeScript environment
declare namespace NodeJS {
  // Align NodeJS.Timeout with browser setTimeout return type used in RN
  type Timeout = ReturnType<typeof setTimeout>;
}
