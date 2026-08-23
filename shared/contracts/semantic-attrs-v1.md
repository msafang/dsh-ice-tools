# Semantic attributes v1

The package uses the L2 semantic attribute convention. The root owner is always explicit, and child parts use bare values owned by that root.

## Root

```html
<section data-dsh-plugin="ice-tools">
```

The root value is the short package owner `ice-tools`, not the npm package name.

## Part enum

The current part values are:

- `settings-card` — the settings hub card container.
- `module-toggle` — one module toggle row inside the card.
- `module-link` — the per-module sub-settings link.

Parts must be emitted as bare values, for example `data-dsh-part="module-toggle"`. Do not prefix part values with `ice-tools:` because the parent `data-dsh-plugin` already establishes ownership.
