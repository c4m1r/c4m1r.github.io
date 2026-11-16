import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [mkcert()],
  server: { port: 5174 },
  build: { outDir: "dist" },
});

// @ts-ignore
// import fs from "fs";
// import chokidar from "chokidar";

// const directoryToWatch = "public/icons";

// const watcher = chokidar.watch(directoryToWatch, {
//   ignored: /(^|[\/\\])\../, // ignore dotfiles
//   persistent: true,
// });

// watcher.on("add", (filePath) => {
//   fs.readFile(filePath, "utf8", (err: Error, data: string) => {
//     if (err) {
//       console.error(`Error reading file: ${err}`);
//       return;
//     }

//     const modifiedContent = data
//       .replace(/<svg width="28" height="28" /, '<svg id="icon" ')
//       .replace(/fill="#1C1C1E"/g, 'fill="currentColor"');

//     fs.writeFile(filePath, modifiedContent, "utf8", (err: Error) => {
//       if (err) {
//         console.error(`Error writing file: ${err}`);
//         return;
//       }

//       console.log(`File ${filePath} has been modified.`);
//     });
//   });
// });

// console.log(`Watching directory: ${directoryToWatch}`);
