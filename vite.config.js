import { defineConfig } from vite;
import react from @vitejs/plugin-react;

// Dev-server proxy: frontend memakai URL relatif /api/*,
// diteruskan ke microservice lokal. Di Docker, nginx yang mem-proxy.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      /api/auth: http://localhost:5000,
      /api/vendors: http://localhost:3002,
      /api/items: http://localhost:3003,
      /api/projects: http://localhost:3004,
      /api/boq: http://localhost:3005,
      /api/categories: http://localhost:3005,
    },
  },
});
