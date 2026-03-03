const esbuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

async function main() {
  const ctx = await esbuild.context({
    entryPoints: {
      extension: "src/extension.ts",
      hook: "../src/index.ts",
    },
    bundle: true,
    format: "cjs",
    minify: production,
    sourcemap: !production,
    platform: "node",
    outdir: "dist",
    external: ["vscode"],
    plugins: [
      copy({
        assets: [
          { from: ["../dictionary/**/*.json"], to: ["./dictionary"] },
          { from: ["../config/**/*.json"], to: ["./config"] },
        ],
      }),
    ],
  });

  if (watch) {
    await ctx.watch();
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
