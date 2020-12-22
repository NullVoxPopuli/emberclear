type LIES<T> = T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TODO<T = any> = T;

// This ends up just being any....
type Json =  ReturnType<JSON['parse']>;
