<div align="center">
<img width="1200" height="475" alt="Alumbrar Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 💎 Alumbrar: Camino a UCDM
### Una plataforma de acompañamiento espiritual basada en Un Curso de Milagros.
</div>

---

## 🌟 Sobre el Proyecto
**Alumbrar** es una aplicación SaaS diseñada para acompañar a los estudiantes de Un Curso de Milagros (UCDM) en su práctica diaria. Combina la sabiduría de las lecciones diarias con la tecnología de Inteligencia Artificial para ofrecer una experiencia de paz, perdón y consciencia.

## 🚀 Funcionalidades Principales
- **Gemas Diarias**: Afirmaciones, ideas guía y microacciones para aplicar durante el día.
- **El Guía (IA)**: Un chat inteligente entrenado en la filosofía de UCDM para resolver dudas y encontrar paz en momentos de conflicto.
- **Lecciones del Curso**: Resúmenes dinámicos de las 365 lecciones generados por IA.
- **Perfil Personalizado**:
  - **Sincronización**: Guarda favoritos e historial de chat.
  - **Premium (Freemium)**: Modelo de suscripción con Stripe para acceso ilimitado.

## 🛠️ Stack Tecnológico
- **Frontend**: React + Vite + Tailwind CSS.
- **Iconos**: Lucide React.
- **IA**: Google Gemini 1.5 Flash (Google AI Studio).
- **Backend**: Supabase (Auth + Database + RLS).
- **Pagos**: Stripe (Próximamente).

---

## ⚙️ Configuración y Desarrollo

### 1. Clonar e Instalar
```bash
git clone https://github.com/verovilab/alumbrar.git
cd alumbrar
npm install
```

### 2. Variables de Entorno
Crea un archivo `.env.local` en la raíz con el siguiente formato:
```env
# Gemini API Key (obtener en Google AI Studio)
VITE_GEMINI_API_KEY=tu_api_key_aqui

# Supabase (obtener en el dashboard de Supabase)
VITE_SUPABASE_URL=tu_url_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Stripe (opcional para desarrollo)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Base de Datos
Ejecuta el script `supabase_schema.sql` en el "SQL Editor" de tu proyecto de Supabase para crear las tablas y políticas de seguridad necesarias.

### 4. Ejecutar Localmente
```bash
npm run dev
```

---

## 🌍 Despliegue
El proyecto está optimizado para **Vercel** o **Netlify**. 
Asegúrate de configurar las variables de entorno en tu panel de control de despliegue.

---

<div align="center">
"La Verdad espera tu reconocimiento silencioso."
</div>
