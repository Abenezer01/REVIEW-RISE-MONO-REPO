import '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        colorSchemes: {
            light: {
                palette: PaletteOptions;
            };
            dark: {
                palette: PaletteOptions;
            };
        };
        customShadows: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
            primary: {
                sm: string;
                md: string;
                lg: string;
            };
            secondary: {
                sm: string;
                md: string;
                lg: string;
            };
            error: {
                sm: string;
                md: string;
                lg: string;
            };
            warning: {
                sm: string;
                md: string;
                lg: string;
            };
            info: {
                sm: string;
                md: string;
                lg: string;
            };
            success: {
                sm: string;
                md: string;
                lg: string;
            };
        };
    }

    interface ThemeOptions {
        colorSchemes?: {
            light?: {
                palette?: PaletteOptions;
            };
            dark?: {
                palette?: PaletteOptions;
            };
        };
        customShadows?: Theme['customShadows'];
    }

    interface Palette {
        customColors: {
            bodyBg: string;
            chatBg: string;
            greyLightBg: string;
            inputBorder: string;
            tableHeaderBg: string;
            tooltipText: string;
            trackBg: string;
        };
    }

    interface PaletteOptions {
        customColors?: {
            bodyBg?: string;
            chatBg?: string;
            greyLightBg?: string;
            inputBorder?: string;
            tableHeaderBg?: string;
            tooltipText?: string;
            trackBg?: string;
        };
    }
}
