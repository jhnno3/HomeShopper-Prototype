/**
 * The report page's backdrop, modeled on a "gradient inspiration" reference
 * square: one continuous diagonal gradation running top-left → bottom-right —
 * no radial pools, no grain. Recolored from the reference's blue/salmon
 * pairing to our brand ramp (#0083FF → #4C2CE2): a clearly-saturated blue in
 * the top-left corner melting through a brief near-white middle into a
 * clearly-saturated violet at the bottom-right.
 */
export function ReportBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #AECBFF 0%, #D6E3FE 18%, #F7F8FD 46%, #E9D9FB 74%, #C9A9F2 100%)',
      }}
    />
  );
}
