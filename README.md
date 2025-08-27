# 🗺️ Proyecto de Búsqueda de Rutas

Una aplicación web interactiva para la búsqueda y visualización de rutas en mapas, construida con React y Leaflet.

## ✨ Características

- 🌍 **Mapas interactivos** con soporte para múltiples capas
- 🧭 **Cálculo de rutas** optimizado con OSRM
- 📍 **Geocodificación bidireccional** (dirección ↔ coordenadas)
- 🎯 **Marcadores personalizados** para origen, paradas y destino
- 📱 **Interfaz responsiva** con Tailwind CSS
- ⚡ **Búsqueda en tiempo real** con debounce integrado
- 📊 **Información detallada** de distancia, tiempo e instrucciones

## 🛠️ Stack Tecnológico

### Frontend Base
- **React + TypeScript** - Framework principal y tipado estático
- **Vite** - Bundler y servidor de desarrollo
- **Tailwind CSS** - Framework de utilidades CSS

### Mapas y Navegación
- **Leaflet** - Motor de mapas en el navegador
- **React-Leaflet** - Componentes React para Leaflet
- **Leaflet Routing Machine (LRM)** - Cálculo y visualización de rutas
- **OSRM** - Servicio de ruteo (Open Source Routing Machine)

### Geocodificación
- **Nominatim (OpenStreetMap)** - Servicio de geocodificación
  - Búsqueda: texto → coordenadas
  - Reversa: coordenadas → dirección

### UI y Utilidades
- **lucide-react** - Biblioteca de iconos
- **clsx** - Composición condicional de clases CSS
- **tailwind-merge** - Resolución de conflictos en clases Tailwind

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd proyecto-rutas
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 🚀 Uso

### Configuración básica del mapa

El proyecto utiliza OpenStreetMap como fuente de tiles:

```typescript
// Asegúrate de importar los estilos de Leaflet
import "leaflet/dist/leaflet.css";
```

### Características principales

#### 🗺️ **Visualización de mapas**
- Mapas interactivos con zoom y paneo
- Tiles de OpenStreetMap con atribución requerida
- Marcadores personalizados tipo "dot" con colores diferenciados

#### 🧭 **Cálculo de rutas**
- Integración con OSRM para cálculo de rutas optimizadas
- Soporte para múltiples paradas intermedias
- Información detallada de:
  - Distancia total en kilómetros
  - Tiempo estimado de viaje
  - Instrucciones paso a paso

#### 🔍 **Búsqueda de ubicaciones**
- Geocodificación en tiempo real con Nominatim
- Debounce implementado para optimizar las consultas
- Búsqueda bidireccional (coordenadas ↔ direcciones)

## ⚙️ Arquitectura

### Componentes principales
- **MapContainer**: Contenedor principal del mapa
- **TileLayer**: Capa de tiles de OpenStreetMap
- **Marker**: Marcadores personalizados para puntos de interés
- **RoutingControl**: Control de ruteo con LRM

### Utilidades propias
- **Debounce personalizado**: Optimización de consultas a Nominatim
- **DivIcon personalizado**: Marcadores coloreados para diferentes tipos de puntos
- **Gestión de refs**: Manejo eficiente de instancias del control de ruteo
- **Event listeners**: Manejo robusto de eventos de ruteo

### Eventos de ruteo
El sistema maneja los siguientes eventos de LRM:
- `routesfound`: Cuando se encuentran rutas disponibles
- `routeselected`: Cuando se selecciona una ruta específica
- `routingerror`: Manejo de errores en el cálculo de rutas

## 🔧 Configuración

### Servicios externos utilizados
- **OSRM Demo**: Servidor público de ruteo
- **OpenStreetMap Tiles**: Fuente de mapas base
- **Nominatim**: Servicio de geocodificación de OSM

## 📱 Responsividad

El proyecto está diseñado para funcionar en:
- 💻 Escritorio
- 📱 Dispositivos móviles
- 📟 Tablets

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🙏 Reconocimientos

- **OpenStreetMap** - Datos de mapas
- **Leaflet** - Motor de mapas
- **OSRM** - Servicio de ruteo
- **Nominatim** - Servicio de geocodificación

---

**Nota**: Este proyecto utiliza servicios públicos para demostración. Para uso en producción, considera implementar tus propios servidores de tiles y ruteo para mayor control y rendimiento.
