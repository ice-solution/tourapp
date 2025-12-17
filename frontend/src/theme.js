import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#c9503d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ef7b20',
      contrastText: '#ffffff',
    },
    background: {
      default: '#c4d971',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f1f1f',
      secondary: '#5c5c5c',
    },
  },
  typography: {
    fontFamily: ['"Noto Sans TC"', '"Roboto"', '"Helvetica"', 'Arial', 'sans-serif'].join(','),
    h5: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
})

export default theme


