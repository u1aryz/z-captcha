import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ipcRenderer } from 'electron';
import * as Store from 'electron-store';

const { useState, useEffect } = React;
const store = new Store();

const theme = createMuiTheme({
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});
const useStyles = makeStyles(() => ({
  '@global': {
    body: {
      margin: 0,
    },
  },
  content: {
    margin: '0 auto',
    maxWidth: 400,
    padding: `${theme.spacing(6)}px ${theme.spacing(3)}px`,
  },
  mb2: {
    marginBottom: theme.spacing(2),
  },
  mb4: {
    marginBottom: theme.spacing(4),
  },
}));

const App = () => {
  const classes = useStyles();
  const [sitekey, setSitekey] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    setSitekey(store.get('sitekey', '') as string);
    setUrl(store.get('url', '') as string);
  }, []);

  const openYouTube = () => {
    ipcRenderer.send('open-youtube');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    store.set('sitekey', sitekey);
    store.set('url', url);
    ipcRenderer.send('start-recaptcha', { sitekey, url });
  };

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.content}>
        <form onSubmit={onSubmit}>
          <TextField
            className={classes.mb2}
            label="Sitekey"
            value={sitekey}
            onChange={(e) => setSitekey(e.target.value)}
            fullWidth
            required
          />
          <TextField
            className={classes.mb4}
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            required
          />
          <Button className={classes.mb2} fullWidth variant="contained" color="primary" type="submit">
            START reCAPTCHA
          </Button>
          <Button fullWidth variant="contained" onClick={openYouTube}>
            OPEN YOUTUBE
          </Button>
        </form>
      </div>
    </MuiThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
