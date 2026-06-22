# Prompt Language

> A prompt language is a living grammar that compiles intention into inheritable behavior.

This repository is a collection of standalone HTML studies in operational prompting, cinematic interfaces, and executable language. Each study treats text as an interface: instructions become spatial systems, controls, transitions, and visible states rather than static explanation.

## View the collection

Open `index.html` in a browser. The index presents every study in a sandboxed iframe and provides a direct link to open each page independently.

No build step or package installation is required. The pages are self-contained HTML documents.

## Studies

| File | Study |
| --- | --- |
| `cineosis-zork.html` | CINEOSIS ZORK — The Operational Pragmatist |
| `c-zork.html` | CINEOSIS Mosaic ZORK |
| `c-flix.html` | CINEOSIS · FLIX |
| `cine-sem.html` | CINEOSIS · SEMIOSIS |
| `bcall.html` | BEFLIX Call |
| `bcall-01.html` | BEFLIX Call 01 |
| `bcall-02.html` | BEFLIX Call 02 |
| `bcall-03.html` | BEFLIX Call 03 |
| `bcall-04.html` | BEFLIX Call 04 |
| `icaro-flip.html` | Icaro Flip — full frame timeline and mobile editing reference |
| `OP-01/operator.html` | Operator 01 — split face/command quine prototype |
| `OP-02/operator-edge.html` | Operator 02 — sparse binary edge-codec prototype |
| `OP-03/operator-edge.html` | Operator 03 — adaptive edge call using the shared hardened Worker |
| `OP-04/operator-studio.html` | Operator 04 — shared film EDL, synchronized frame edits, presence, and voice |
| `OP-04/icaro-flip.html` | Icaro Flip reference colocated with Operator 04 |
| `OPERATOR/beflix-call.html` | BEFLIX Call Operator — room signaling, reconnect, and chat |
| `PRETEXT/icaro-quine/index.html` | Icaro Quine — canonical PRETEXT architecture reference |

## Publishing

Pushes to `main` are deployed by `.github/workflows/deploy-pages.yml`. The workflow can also be run manually from the repository's **Actions** tab.

Before publishing, the workflow verifies that `index.html` exists, every root-level HTML study has both a full-page link and an iframe preview, both Operator clients parse, and the room protocol and edge-codec tests pass. A missing gallery entry or broken client fails the deployment instead of silently publishing an incomplete site.

One repository setting is required before the first deployment:

1. Open **Settings → Pages** on GitHub.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`, or run the **Deploy GitHub Pages** workflow manually.

The deployment URL is `https://hartswf0.github.io/prompt-language/`. The workflow's `github-pages` environment records the exact URL after a successful deployment.

## Prime prompt

The governing prompt defines an **Operational Pragmatist**: a system that converts abstract input into a sequential script of concrete operations. Its central rule is that meaning is use. The message remains the literal payload of its medium, and analysis must preserve the distinctions between inner and outer states and between first- and second-order operations.

The interface grammar is deliberately strict:

- Begin in light mode with only absolute black and white.
- Preserve information density; use gradients instead of background blur.
- Give vertical space to the text by removing pagination controls.
- Anchor spatial models at the base where the stack meets the ground.
- Bind lines of logic to their corresponding viewport objects in both directions.
- Produce structural logic, interface topography, and operational states before application code.

The expected transformation target is an active XML document:

```xml
<script version="2.0" mode="operational">
  <execution><!-- one concrete operation --></execution>
</script>
```

Every execution node should act like a physical instruction slip: ordered, actionable, and testable.

## Adding a study

1. Add a self-contained `.html` file at the repository root.
2. Add a labeled, sandboxed preview and full-page link to `index.html`.
3. Add the study to the table above.

Iframe previews intentionally use `sandbox="allow-scripts"` and `referrerpolicy="no-referrer"`. Add permissions only when a study has a specific, documented requirement.
