/**
 * Type declarations to prevent inference on certain return types
 */

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type NoInfer<T> = [T][T extends any ? 0 : never];

export type NoInferUnion<T> = NoInfer<T> extends infer U ? U : never;
export type NoInferObj<T extends object> = { [K in keyof T]: NoInfer<T[K]> };