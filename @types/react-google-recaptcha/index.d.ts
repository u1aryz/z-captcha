declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    asyncScriptOnLoad?: () => void;
  }

  // noinspection JSDuplicatedDeclaration
  export default class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {}
}
