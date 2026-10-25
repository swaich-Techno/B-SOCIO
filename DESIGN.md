# B Socio Design System

## Direction

Editorial studio, not generic SaaS. The work leads; the interface uses asymmetry, large type, hairline rules and a restrained palette. Decorative effects never compete with project imagery.

## Tokens

- Paper: `#f2efe6`
- Raised paper: `#fbf9f3`
- Ink: `#131510`
- Muted ink: `#5d6058`
- Signal: `#f15a3b`
- Utility blue: `#2846d3`
- Rule: `rgba(19, 21, 16, 0.22)`
- Display type: Georgia with Times fallback
- Body type: system sans-serif stack
- Container: 1440px maximum with fluid gutters
- Corners: 2px for controls, 12px for media only
- Motion: 120ms press, 220ms hover, 420ms reveal; transform and opacity only

## Layout rules

- A 12-column grid at desktop, collapsing at 960px and 640px.
- One major idea per viewport; generous vertical rhythm.
- Project imagery keeps a fixed aspect ratio to prevent layout shift.
- The mobile navigation and all controls maintain at least a 44px hit target.

## Accessibility rules

- Sequential heading levels and one `h1` per page.
- Visible `:focus-visible` states with a 3px high-contrast outline.
- Semantic links, buttons, labels, lists and disclosure states.
- Motion is optional and collapses under `prefers-reduced-motion`.
- Body copy targets a readable 60-72 character line length.

## Content rules

- Real work appears before concept demonstrations.
- No invented metrics, testimonials, technologies or outcomes.
- Concepts are labelled as concepts.
- Calls to action use specific verbs: Explore Our Work, View Live Website, Start a Project.
