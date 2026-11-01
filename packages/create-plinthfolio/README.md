# create-plinthfolio

Start a portfolio built with [Plinth](https://github.com/leigharriane/Plinth) in one command:

```bash
npx create-plinthfolio my-site
```

It asks for your name, what you do and your email, copies Plinth into the folder with those filled in, starts a git repository and installs the dependencies. Pass `--yes` to skip the questions, `--no-install` or `--no-git` to skip those steps, and `--help` for the rest.

## Publishing

The package carries a copy of the Plinth repo in `template/`, made by `npm run sync-template` (it also runs before `npm pack` and `npm publish`). Bump `version` in this package.json, then from this folder:

```bash
npm publish
```

To try it without publishing:

```bash
npm run sync-template
node bin/create-plinthfolio.mjs ../../../somewhere/my-site --yes --no-install
```
