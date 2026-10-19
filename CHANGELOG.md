# Changelog

## 2.0.0
- GPON dual-wavelength model (1310 nm up / 1490 nm down); worst direction decides.
- Per-link connector/splice tolerance; editable OLT Tx, ONT sensitivity and overload.
- Modules: `engine.js` (calculations, validation, migration), `pdf.js`, `i18n.js`, `app.js` (UI).
- Strict schema validation + versioned snapshots; clearer error messages.
- Undo/redo, onboarding tour, keyboard navigation, ARIA labels, high-contrast mode.
- Field scenarios; node:test suite; GitHub Actions CI and Pages deploy.

## 1.x
- Topology editor, OTDR trace, power budget, tickets, SLA KPIs, VLAN/terminal, ACL/firewall, QoS, ROI, exam + PDF certificate, AR/EN.
