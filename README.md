# NetSim — FTTH & Network Simulator | محاكي الشبكات والألياف الضوئية

Educational, dependency-free simulator (HTML/CSS/JS). **Simulation only — not a scan of a real network.**
محاكي تعليمي بلا مكتبات. **محاكاة فقط، وليس فحصاً لشبكة حقيقية.**

## Run | التشغيل
Open `index.html` in a browser (no build step). Tests: `npm test` (Node ≥ 20). Deploy: push to `main` (GitHub Pages workflow included).
افتح `index.html` مباشرة. الاختبارات: `npm test`. النشر: ادفع إلى `main`.

## Model | النموذج
- Rx = Tx − (L·α + 2·0.5 dB connectors ± tol + splices·0.1 dB ± tol + ODF 1 dB + splitter + fault).
- GPON: 1310 nm upstream / 1490 nm downstream; the worse direction decides. Reach ≤ 20 km.
- Typical values: α(1310/1490/1550) = 0.35 / 0.25 / 0.22 dB/km; splitter 1:2…1:16 = 3.5 / 7.2 / 10.5 / 13.8 dB; dirty connector +3 dB (≈ −35 dB reflectance); macro-bend +1.5 dB.
- Defaults: Tx +3 dBm, sensitivity −27 dBm, overload −8 dBm (class B+ style). **Editable** — enter your equipment datasheet values.
- Normal power-meter readings (field): main cable at splitter input −4…−11 dBm; at ONT −12…−24 dBm. Optical budget is computed per optical segment.
- References: ITU-T G.652, G.984.2, TIA-568 (typical figures, see assumptions panel).

## OSI & servers | الطبقات والخوادم
Servers (DHCP, DNS, Web, Mail) sit on the switch. The OSI panel checks L1→L7 for the chosen service and names the first failing layer (e.g. fiber cut → L1, ACL/firewall → L3, DNS down → L7). Terminal: `ping trace ip vlan nslookup dhcp curl`.

## Scenarios JSON
`{"title","complaint","setup":{"len","sp","odf"},"fault":{"link","type":"cut|dirty|bend"}}` — import from Management tab (see `scenarios/example.json`). Stored in the browser (localStorage).

## PWA
Serve over HTTPS (GitHub Pages) to install on a phone; it then works offline.

## Not simulated | غير محاكى
Dispersion, polarization, BER, OTDR dead zone, real vendor behaviour.

## Structure
`engine.js` calculations/validation · `pdf.js` PDF writer · `i18n.js` AR/EN · `app.js` UI · `test/` node:test · `.github/workflows/` CI + Pages.

## License
MIT. See `LICENSE`. Case study: `docs/case-study.md`.
