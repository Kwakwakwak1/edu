# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Dependencies

### Audio Processing
- FFmpeg is required for audio file conversion
  ```
  brew install ffmpeg
  ```

## Running the Application

### Development
```
npm run dev
```

### Sound Generation Server
```
npm run server
```

This will start a server on port 3001 that can generate sound files for words.

### Command-line Sound Generation
You can also generate sounds directly from the command line:

```
npm run generate-sounds "cat,dog,house" [outputDir] [voice] [prefix]
```

Example:
```
npm run generate-sounds "apple,banana,cherry" "sounds/fruits" "Samantha" "fruit"
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
