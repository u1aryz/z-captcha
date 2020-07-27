declare module 'react-google-recaptcha' {
  import * as React from 'react';

  export interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    asyncScriptOnLoad?: () => void;
  }

  export default // noinspection JSDuplicatedDeclaration
  class ReCAPTCHA extends React.Component<ReCAPTCHAProps> {}
}
