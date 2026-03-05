# Visual Parity Checklist

## Main Rule

- The output components should match the input HTML/screenshot as close to 1:1 as possible

## Checklist

The following items should match between the output component and the input HTML it corresponds to

- Background color
- Text color
- Font weight/size
- Horizontal alignment
- Vertical alignment
- Border radius/rounded corners
- Padding/Margin/Spacing
- Max-width of sections
- Image transparency and overlays

## Other Rules

Validate the following items:

- Header and footer defaultProps links must pass strict 1:1 parity against the plan-step link table.
- Validate parity row-by-row for:
  - section (`header` vs `footer`)
  - group/band placement
  - index/order within group
  - visible label text
  - href
- The number of links must match exactly for each header/footer group.
- Do not treat set inclusion as pass criteria. Order and grouping are required.
