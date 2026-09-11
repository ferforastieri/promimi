# ADR 004 — Isolamento do WhatsApp

QR, navegador automatizado e sessão persistente vivem no bridge `apps/whatsapp`. A API apenas configura credenciais cifradas e o worker chama o bridge; uma reconexão nunca bloqueia HTTP público ou a fila de outras integrações.
