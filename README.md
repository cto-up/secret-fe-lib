# secret-fe-lib

Frontend library for the secret module. Consumed by hub and core-fe-lib
(SecretsAdminPage, secret-picker components) via git submodule.

## Layout

- **`lib/`** — generated TypeScript client (models + services) for the secret
  OpenAPI spec. Wiped and regenerated on every `make openapi` run in
  [`secret-lib`](https://github.com/cto-up/secret-lib). **Do not edit by hand.**
- Everything outside `lib/` (when added) is hand-authored.

## Regenerating the client

```sh
cd ../secret-lib
make openapi
```

That target writes into `../secret-fe-lib/lib/` (sibling checkout). Commit the
result here, then bump the submodule pointer in every consumer (hub +
core-fe-lib).
