# Case study | دراسة حالة

**Problem.** Fiber-fault diagnosis is hard to practise without live networks: faults are rare, equipment is costly, mistakes are expensive.
**Solution.** A browser simulator that models an FTTH link budget (GPON 1310/1490 nm), injects faults (cut, dirty connector, bend), and lets the learner diagnose them with a power meter, OTDR events and a standards-based diagnosis table — plus tickets, SLA/MTTR/MTBF, ROI, security and QoS views for the IT-management side.
**Decisions.** No dependencies (opens from a file, easy to host); calculations isolated in `engine.js` and unit-tested; strict import validation; every value documented as typical, with editable equipment parameters.
**Results.** 11 automated tests, CI, bilingual UI, accessibility features, PDF report/certificate generated without libraries.
**Next.** Vendor datasheet profiles, geographic route planning, dead-zone and BER modelling.
