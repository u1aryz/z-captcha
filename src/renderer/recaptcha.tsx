import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Store from 'electron-store';
import { ipcRenderer } from 'electron';
import ReCAPTCHA from 'react-google-recaptcha';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';

const { useState, useEffect, useRef } = React;
const store = new Store();

const sleep = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const useStyles = makeStyles((theme) => ({
  backButton: {
    marginTop: theme.spacing(1) / 2,
  },
}));

const App = () => {
  const classes = useStyles();
  const [sitekey, setSitekey] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    setSitekey(store.get('sitekey', '') as string);
  }, []);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const onSolve = (value: string | null) => {
    ipcRenderer.send('solve-recaptcha', value);
  };

  const onScriptLoad = async () => {
    await sleep(500); // 暫定対処
    if (mounted.current) {
      const iframeDocument = document.querySelector('iframe')?.contentWindow?.document;
      (iframeDocument?.querySelector('#recaptcha-anchor > div.recaptcha-checkbox-border') as HTMLElement)?.click();
    }
  };

  return (
    <div>
      <ReCAPTCHA sitekey={sitekey} onChange={onSolve} asyncScriptOnLoad={onScriptLoad} />
      <Button
        className={classes.backButton}
        variant="contained"
        onClick={() => {
          window.history.back();
        }}
      >
        Back
      </Button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
