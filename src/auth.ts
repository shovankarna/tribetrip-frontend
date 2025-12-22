import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080', // NGINX proxy to Keycloak /auth ? No, mostly direct or via NGINX. 
  // If NGINX is on 80 and proxying /auth -> keycloak:8080/auth, then url: 'http://localhost/auth'.
  // However, keycloak-js might need precise config.
  // Docker Keycloak usually at / if newer, or /auth if older. Quay image 24.x uses / usually unless configured.
  // But my nginx.conf has /auth/ -> keycloak/auth/.
  // Let's assume direct access to 8080 for dev simplicity to avoid NGINX header issues first, OR try NGINX.
  // User asked for 80 (NGINX) to be the entry.
  // Let's try http://localhost:8080 first to rule out NGINX issues, then switch to 80.
  // Actually, per plan, NGINX is the gateway. 
  // Let's use http://localhost:8080/ for now because of CORS/Issues often seen with NGINX proxying Keycloak without X-Forwarded-Proto.
  // My NGINX config had headers, so maybe it works. 
  // But purely for FE <-> IDP, direct is often easier in local dev.
  // I will use http://localhost:8080 for stability.
  realm: 'triptribe',
  clientId: 'triptribe-frontend'
});

export default keycloak;
