# Changelog

## 2.3.0
- Normal power-meter windows from field practice: splitter input −4…−11 dBm, ONT −12…−24 dBm; verdicts (feeder low/high, drop low, ONT high, LOS, weaker-than-siblings).
- Optical budget is evaluated per optical segment (power is regenerated at active devices), fixing ONT-to-ONT paths.
- Defaults recalibrated (feeder 16 km, 6 splices + ODF, Tx +1.5 dBm) so a healthy network reads inside the windows.

## 2.2.0
- Five tabs (Network, Fiber & diagnosis, Servers & OSI, Security & QoS, Management) replace the single long page.
- PWA: manifest, service worker, icons — installable and works offline (bump `V` in `sw.js` on each release).
- XGS-PON (1270/1577 nm), WDM coexistence (+1.5 dB), estimated BER, OTDR dead-zone flag.
- Redundant switch with STP (blocked link shown, automatic failover), static routes, NAT/PAT, `ping 8.8.8.8`.
- FTTH route map + bill of materials; scenario library (import JSON, see `scenarios/example.json`); local scoreboard.

## 2.1.0
- Four servers (DHCP, DNS, Web, Mail) on the switch, each with a role/impact card; roles for router, switch/OLT, splitter and ONT.
- OSI 7-layer panel: layer-by-layer check per service (web, DNS, DHCP, mail, ICMP) that reports the first failing layer.
- Terminal: `nslookup`, `dhcp`, `curl`.

## 2.0.0
- GPON dual-wavelength model (1310 nm up / 1490 nm down); worst direction decides.
- Per-link connector/splice tolerance; editable OLT Tx, ONT sensitivity and overload.
- Modules: `engine.js` (calculations, validation, migration), `pdf.js`, `i18n.js`, `app.js` (UI).
- Strict schema validation + versioned snapshots; clearer error messages.
- Undo/redo, onboarding tour, keyboard navigation, ARIA labels, high-contrast mode.
- Field scenarios; node:test suite; GitHub Actions CI and Pages deploy.

## 1.x
- Topology editor, OTDR trace, power budget, tickets, SLA KPIs, VLAN/terminal, ACL/firewall, QoS, ROI, exam + PDF certificate, AR/EN.
