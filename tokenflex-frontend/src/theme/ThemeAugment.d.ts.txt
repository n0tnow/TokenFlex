import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent1: Palette['primary'];
    accent2: Palette['primary'];
  }
  
  interface PaletteOptions {
    accent1?: PaletteOptions['primary'];
    accent2?: PaletteOptions['primary'];
  }

  interface PaletteColor {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  }

  interface TypeBackground {
    default: string;
    paper: string;
    gradient: string;
  }
}

// Button'da özel mor rengi kullanmak için
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    accent1: true;
    accent2: true;
  }
}

// Chip'te özel renkleri kullanmak için  
declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    accent1: true;
    accent2: true;
  }
}

// Icon'larda özel renkleri kullanmak için
declare module '@mui/material/SvgIcon' {
  interface SvgIconPropsColorOverrides {
    accent1: true;
    accent2: true;
  }
}