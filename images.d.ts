// images.d.ts
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpeg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.gif' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.bmp' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.tiff' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

// You can add other image types if needed, e.g., SVG, WebP
// For SVG with react-native-svg-transformer:
/*
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
*/