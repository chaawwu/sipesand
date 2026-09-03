# Packages / Shared

Modul shared logic, services, context, dan utilitas:
- `api.js`: Klien HTTP Axios dengan konfigurasi multi-tenant header.
- `SettingsContext.jsx`: State global untuk identitas lembaga, logo, stempel, konfigurasi tema, dan NFC toggle.
- `tenantResolver.js`: Utilitas pendeteksi subdomain (`sipesand.web.id`, `app.sipesand.web.id`, `mitra.sipesand.web.id`, atau tenant).
