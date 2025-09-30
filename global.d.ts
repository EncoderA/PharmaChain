// Global type declarations for the project

// CSS Modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// CSS Modules with specific extensions
declare module '*.module.css' {
  const content: { [className: string]: string };
  export default content;
}

// SCSS/Sass modules
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

// Less modules
declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.module.less' {
  const content: { [className: string]: string };
  export default content;
}

// Stylus modules
declare module '*.styl' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.stylus' {
  const content: { [className: string]: string };
  export default content;
}