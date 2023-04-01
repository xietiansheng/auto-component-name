import esbuild from 'esbuild'
const build = () => esbuild.buildSync({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  platform: "node",
  format: "esm"
});

build();
