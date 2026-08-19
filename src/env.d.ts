/// <reference types="astro/client" />

declare module '*.png' {
  const value: ImageMetadata;
  export default value;
}

declare module '*.jpg' {
  const value: ImageMetadata;
  export default value;
}

declare module '*.jpeg' {
  const value: ImageMetadata;
  export default value;
}

declare module '*.svg' {
  const value: ImageMetadata;
  export default value;
}

declare module '*.webp' {
  const value: ImageMetadata;
  export default value;
}
