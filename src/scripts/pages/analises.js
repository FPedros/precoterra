import { initSmoothScroll } from '../shared/smooth-scroll.js';

let mapboxgl;

// Configure apenas um token público do Mapbox pela variável de ambiente.
const MAPBOX_PUBLIC_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const PROPERTY_STYLE = Object.freeze({
  color: '#2F6B47',
  fillOpacity: .2,
  strokeOpacity: .9,
  lineWidth: 2,
});

const SOCIO_PROPERTY_STYLE = Object.freeze({
  color: '#B6D65C',
  fillOpacity: .24,
  strokeOpacity: .95,
  lineWidth: 2,
});

const lenis = initSmoothScroll({ anchorOffset: -112 });

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mainNav = document.querySelector('[data-nav]');
const introSection = document.querySelector('.page-intro');
const expandingDivider = document.querySelector('[data-analysis-tabs]');
let lastScrollY = window.scrollY;
let directionDistance = 0;
let lastDirection = 0;
let tabNavigationInProgress = false;
let tabNavigationId = 0;

function setHeaderHidden(isHidden) {
  document.documentElement.classList.toggle('analysis-header-hidden', isHidden && window.innerWidth > 800);
}

window.addEventListener('resize', () => {
  if (window.innerWidth <= 800) setHeaderHidden(false);
}, { passive: true });

window.addEventListener('scroll', () => {
  const currentScrollY = Math.max(window.scrollY, 0);
  const delta = currentScrollY - lastScrollY;
  const direction = Math.sign(delta);

  header?.classList.toggle('scrolled', currentScrollY > 40);

  if (introSection) {
    const brandEnd = Math.max(introSection.offsetHeight * .62, 1);
    const brandProgress = Math.min(1, Math.max(0, currentScrollY / brandEnd));
    document.documentElement.style.setProperty('--brand-scroll-progress', String(brandProgress));
    document.documentElement.style.setProperty('--brand-intro-opacity', String(1 - brandProgress));
    document.documentElement.style.setProperty('--brand-intro-scale', String(1 - brandProgress * .16));
    document.documentElement.classList.toggle('brand-in-header', brandProgress > .72);
  }

  if (introSection && expandingDivider) {
    const start = Math.max(introSection.offsetHeight * .08, 1);
    const end = Math.max(introSection.offsetHeight * .78, start + 1);
    const progress = Math.min(1, Math.max(0, (currentScrollY - start) / (end - start)));
    expandingDivider.style.setProperty('--divider-progress', String(progress));
  }

  if (currentScrollY <= 24) {
    setHeaderHidden(false);
    directionDistance = 0;
  } else if (!tabNavigationInProgress && Math.abs(delta) > .5 && !mainNav?.classList.contains('open')) {
    directionDistance = direction === lastDirection
      ? directionDistance + Math.abs(delta)
      : Math.abs(delta);

    if (direction > 0 && currentScrollY > 90 && directionDistance > 14) setHeaderHidden(true);
    if (direction < 0 && directionDistance > 10) setHeaderHidden(false);
  }

  if (direction) lastDirection = direction;
  lastScrollY = currentScrollY;
}, { passive: true });

requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')));

function animateIntroBrand() {
  const stage = document.querySelector('.intro-brand-stage');
  const logo = stage?.querySelector('.intro-logo');
  if (!stage || !logo || stage.dataset.animating === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  stage.dataset.animating = 'true';

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    inset: '-70%',
    width: '240%',
    height: '240%',
    zIndex: '-1',
    pointerEvents: 'none',
  });
  stage.prepend(canvas);

  const context = canvas.getContext('2d');
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(bounds.width * ratio));
  canvas.height = Math.max(1, Math.round(bounds.height * ratio));
  context.scale(ratio, ratio);

  const width = bounds.width;
  const height = bounds.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const particles = Array.from({ length: 42 }, (_, index) => {
    const angle = index / 42 * Math.PI * 2 + (index % 3) * .08;
    const radius = Math.min(width, height) * (.28 + (index % 7) * .028);
    return {
      startX: centerX + Math.cos(angle) * radius,
      startY: centerY + Math.sin(angle) * radius * .58,
      targetX: centerX + (index % 2 ? 1 : -1) * width * (.06 + (index % 5) * .018),
      targetY: centerY + ((index % 9) - 4) * 3,
      size: index % 6 === 0 ? 2.2 : 1.1,
    };
  });

  const logoAnimation = logo.animate([
    { opacity: 0, transform: 'scale(.86)', clipPath: 'inset(0 50% 0 50%)' },
    { opacity: 1, transform: 'scale(1.025)', clipPath: 'inset(0)', offset: .72 },
    { opacity: 1, transform: 'scale(1)', clipPath: 'inset(0)' },
  ], { duration: 1350, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
  logoAnimation.finished.then(() => logoAnimation.cancel()).catch(() => {});

  const startTime = performance.now();
  const duration = 1550;
  const draw = (time) => {
    const progress = Math.min(1, (time - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = 'source-over';

    particles.forEach((particle) => {
      const x = particle.startX + (particle.targetX - particle.startX) * eased;
      const y = particle.startY + (particle.targetY - particle.startY) * eased;
      const alpha = Math.sin(progress * Math.PI) * .58;
      context.beginPath();
      context.moveTo(particle.startX, particle.startY);
      context.lineTo(x, y);
      context.strokeStyle = `rgba(92,126,78,${alpha * .22})`;
      context.lineWidth = .7;
      context.stroke();
      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fillStyle = `rgba(182,214,92,${alpha})`;
      context.fill();
    });

    if (progress < 1) requestAnimationFrame(draw);
    else {
      canvas.remove();
      delete stage.dataset.animating;
    }
  };
  requestAnimationFrame(draw);
}

const introBrandStage = document.querySelector('.intro-brand-stage');
if (introBrandStage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const introBrandObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) animateIntroBrand();
  }, { threshold: .42 });
  introBrandObserver.observe(introBrandStage);
}

function setMenuOpen(isOpen) {
  if (isOpen) setHeaderHidden(false);
  mainNav?.classList.toggle('open', isOpen);
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
}

menuToggle?.addEventListener('click', () => setMenuOpen(!mainNav?.classList.contains('open')));
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

let menuTouchStartX = 0;
let menuTouchStartY = 0;

window.addEventListener('touchstart', (event) => {
  menuTouchStartX = event.touches[0].clientX;
  menuTouchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (event) => {
  if (window.innerWidth > 800 || !mainNav) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - menuTouchStartX;
  const deltaY = touch.clientY - menuTouchStartY;
  const horizontal = Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
  if (!horizontal) return;
  if (deltaX < 0 && menuTouchStartX > window.innerWidth * .72) setMenuOpen(true);
  if (deltaX > 0 && mainNav.classList.contains('open')) setMenuOpen(false);
}, { passive: true });

const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    reveal.unobserve(entry.target);
  }
}), { threshold: 0.08, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.analysis-block, .categories, .analysis-contact').forEach((section) => {
  section.classList.add('is-reveal');
  reveal.observe(section);
});

const accessMap = document.querySelector('.access-map');
if (accessMap) {
  accessMap.classList.add('route-visible');
}

const landUseMapElement = document.querySelector('[data-land-use-map]');
const landUseLoading = document.querySelector('[data-land-use-loading]');

function simulationCircle(center, radiusKm, properties, steps = 64) {
  const latitudeRadius = radiusKm / 110.574;
  const longitudeRadius = radiusKm / (111.32 * Math.cos(center[1] * Math.PI / 180));
  const coordinates = Array.from({ length: steps + 1 }, (_, index) => {
    const angle = index / steps * Math.PI * 2;
    return [
      center[0] + Math.cos(angle) * longitudeRadius,
      center[1] + Math.sin(angle) * latitudeRadius,
    ];
  });
  return {
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates: [coordinates] },
  };
}

function geometryBounds(featureCollection) {
  const bounds = new mapboxgl.LngLatBounds();
  const visit = (coordinates) => {
    if (typeof coordinates[0] === 'number') bounds.extend(coordinates);
    else coordinates.forEach(visit);
  };
  featureCollection.features.forEach((feature) => visit(feature.geometry.coordinates));
  return bounds;
}

async function initializeLandUseMap() {
  if (!landUseMapElement || landUseMapElement.dataset.initialized) return;
  landUseMapElement.dataset.initialized = 'true';

  try {
    const mapboxToken = MAPBOX_PUBLIC_TOKEN;
    if (!mapboxToken) {
      landUseLoading?.classList.add('hidden');
      return;
    }
    if (!mapboxgl) {
      const [{ default: MapboxGL }] = await Promise.all([
        import('mapbox-gl'),
        import('mapbox-gl/dist/mapbox-gl.css'),
      ]);
      mapboxgl = MapboxGL;
    }
    const response = await fetch('/assets/analises/data/car-go-5209903.geojson');
    if (!response.ok) throw new Error('Não foi possível carregar o perímetro do CAR.');
    const propertyCollection = await response.json();
    const bounds = geometryBounds(propertyCollection);
    mapboxgl.accessToken = mapboxToken;

    const satelliteFallbackStyle = {
      version: 8,
      sources: {
        satellite: {
          type: 'raster',
          tiles: ['/assets/analises/maps/car-satellite-tiles/{z}-{x}-{y}.jpg'],
          tileSize: 256,
          minzoom: 9,
          maxzoom: 12,
          attribution: 'Imagery © Esri',
        },
      },
      layers: [
        { id: 'satellite-background', type: 'background', paint: { 'background-color': '#13281d' } },
        {
          id: 'satellite',
          type: 'raster',
          source: 'satellite',
          paint: { 'raster-saturation': -.35, 'raster-contrast': .08, 'raster-brightness-max': .84 },
        },
      ],
    };

    const landMap = new mapboxgl.Map({
      container: landUseMapElement,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: bounds.getCenter(),
      zoom: 10,
      dragRotate: false,
      pitchWithRotate: false,
      cooperativeGestures: true,
      attributionControl: false,
    });

    landMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    landMap.addControl(new mapboxgl.AttributionControl({
      compact: true,
      customAttribution: 'Mapbox GL · Simulação Agrovalora',
    }), 'bottom-left');

    landMap.on('load', () => {
      const nativeVegetation = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { class: 'native' },
            geometry: { type: 'Polygon', coordinates: [[
              [-46.808, -13.828], [-46.771, -13.816], [-46.752, -13.841],
              [-46.758, -13.867], [-46.784, -13.879], [-46.812, -13.855],
              [-46.808, -13.828],
            ]] },
          },
          {
            type: 'Feature',
            properties: { class: 'native' },
            geometry: { type: 'Polygon', coordinates: [[
              [-46.858, -13.868], [-46.831, -13.852], [-46.810, -13.873],
              [-46.818, -13.907], [-46.847, -13.918], [-46.866, -13.893],
              [-46.858, -13.868],
            ]] },
          },
          {
            type: 'Feature',
            properties: { class: 'native' },
            geometry: { type: 'Polygon', coordinates: [[
              [-46.835, -13.946], [-46.806, -13.927], [-46.782, -13.955],
              [-46.786, -13.997], [-46.826, -14.001], [-46.844, -13.973],
              [-46.835, -13.946],
            ]] },
          },
          {
            type: 'Feature',
            properties: { class: 'native' },
            geometry: { type: 'Polygon', coordinates: [[
              [-46.774, -13.882], [-46.744, -13.870], [-46.733, -13.899],
              [-46.752, -13.926], [-46.778, -13.913], [-46.774, -13.882],
            ]] },
          },
        ],
      };
      const pivots = {
        type: 'FeatureCollection',
        features: [
          simulationCircle([-46.792, -13.857], 1.58, { class: 'pivot' }),
          simulationCircle([-46.800, -13.907], 1.76, { class: 'pivot' }),
          simulationCircle([-46.803, -13.960], 1.88, { class: 'pivot' }),
          simulationCircle([-46.758, -13.886], 1.32, { class: 'pivot' }),
        ],
      };
      const otherUses = {
        type: 'FeatureCollection',
        features: [
          [-46.776, -13.842], [-46.805, -13.881], [-46.833, -13.936],
          [-46.789, -13.978], [-46.750, -13.912],
        ].map((coordinates) => ({
          type: 'Feature',
          properties: { class: 'other' },
          geometry: { type: 'Point', coordinates },
        })),
      };
      const transmissionLine = {
        type: 'Feature',
        properties: { class: 'transmission' },
        geometry: {
          type: 'LineString',
          coordinates: [[-46.854, -13.968], [-46.829, -13.944], [-46.798, -13.916], [-46.769, -13.886], [-46.742, -13.856]],
        },
      };

      landMap.addSource('car-property', { type: 'geojson', data: propertyCollection });
      landMap.addSource('native-vegetation', { type: 'geojson', data: nativeVegetation });
      landMap.addSource('irrigation-pivots', { type: 'geojson', data: pivots });
      landMap.addSource('other-uses', { type: 'geojson', data: otherUses });
      landMap.addSource('transmission-line', { type: 'geojson', data: transmissionLine });

      landMap.addLayer({
        id: 'property-fill',
        type: 'fill',
        source: 'car-property',
        paint: {
          'fill-color': PROPERTY_STYLE.color,
          'fill-opacity': PROPERTY_STYLE.fillOpacity,
        },
      });
      landMap.addLayer({
        id: 'pasture-fill',
        type: 'fill',
        source: 'car-property',
        paint: { 'fill-color': '#C9985D', 'fill-opacity': .14 },
      });
      landMap.addLayer({
        id: 'native-fill',
        type: 'fill',
        source: 'native-vegetation',
        paint: { 'fill-color': '#176A43', 'fill-opacity': .34 },
      });
      landMap.addLayer({
        id: 'native-outline',
        type: 'line',
        source: 'native-vegetation',
        paint: { 'line-color': '#79BC8B', 'line-width': 1, 'line-opacity': .7 },
      });
      landMap.addLayer({
        id: 'pivot-fill',
        type: 'fill',
        source: 'irrigation-pivots',
        paint: { 'fill-color': '#F2B830', 'fill-opacity': .2 },
      });
      landMap.addLayer({
        id: 'pivot-outline',
        type: 'line',
        source: 'irrigation-pivots',
        paint: { 'line-color': '#FFD45B', 'line-width': 2, 'line-opacity': .95 },
      });
      landMap.addLayer({
        id: 'other-use',
        type: 'circle',
        source: 'other-uses',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3, 13, 7],
          'circle-color': '#FF6554',
          'circle-stroke-color': '#F8FAF7',
          'circle-stroke-width': 1,
        },
      });
      landMap.addLayer({
        id: 'transmission-shadow',
        type: 'line',
        source: 'transmission-line',
        paint: { 'line-color': 'rgba(5,18,12,.8)', 'line-width': 5 },
      });
      landMap.addLayer({
        id: 'transmission-line',
        type: 'line',
        source: 'transmission-line',
        paint: { 'line-color': '#D8FF6D', 'line-width': 2, 'line-dasharray': [2, 2] },
      });
      landMap.addLayer({
        id: 'transmission-hit',
        type: 'line',
        source: 'transmission-line',
        paint: { 'line-color': 'rgba(0,0,0,0)', 'line-width': 14 },
      });
      landMap.addLayer({
        id: 'property-outline',
        type: 'line',
        source: 'car-property',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': PROPERTY_STYLE.color,
          'line-width': PROPERTY_STYLE.lineWidth,
          'line-opacity': PROPERTY_STYLE.strokeOpacity,
        },
      });

      const layerDetails = {
        'pasture-fill': ['Pastagem', '63,93% · 10.834,86 ha'],
        'native-fill': ['Vegetação nativa', '23,27% · 3.943,80 ha'],
        'pivot-fill': ['Área de pivô', '11,93% · 2.021,90 ha'],
        'other-use': ['Outros usos', '0,30% · 50,84 ha'],
        'transmission-hit': ['Linha de transmissão', '0,57% · 96,60 ha'],
      };
      Object.entries(layerDetails).forEach(([layerId, [title, detail]]) => {
        let hoverPopup;
        landMap.on('mouseenter', layerId, (event) => {
          landMap.getCanvas().style.cursor = 'crosshair';
          hoverPopup = new mapboxgl.Popup({ className: 'land-use-popup', closeButton: false, closeOnClick: false, offset: 12 })
            .setLngLat(event.lngLat)
            .setHTML(`<strong>${title}</strong><span>${detail}</span>`)
            .addTo(landMap);
        });
        landMap.on('mousemove', layerId, (event) => hoverPopup?.setLngLat(event.lngLat));
        landMap.on('mouseleave', layerId, () => {
          landMap.getCanvas().style.cursor = '';
          hoverPopup?.remove();
          hoverPopup = undefined;
        });
      });

      const mapPadding = window.innerWidth <= 600 ? 48 : 74;
      landMap.fitBounds(bounds, {
        padding: { top: mapPadding, right: mapPadding, bottom: mapPadding, left: mapPadding },
        offset: [0, 0],
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400,
      });
      landUseLoading?.classList.add('hidden');
      landMap.once('idle', () => {
        landUseMapElement.closest('.land-use-map-shell')?.classList.add('mapbox-active');
      });
      setTimeout(() => landMap.resize(), 450);
    });
  } catch (error) {
    if (landUseLoading) landUseLoading.innerHTML = `<span>${error.message}</span>`;
  }
}

if (landUseMapElement) {
  if ('IntersectionObserver' in window) {
    const landUseObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      initializeLandUseMap();
    }, { rootMargin: '450px 0px' });
    landUseObserver.observe(landUseMapElement);
  } else {
    initializeLandUseMap();
  }
}

const socioMapElement = document.querySelector('[data-socio-map]');

async function initializeSocioMap() {
  if (!socioMapElement || socioMapElement.dataset.initialized) return;
  socioMapElement.dataset.initialized = 'true';
  const token = MAPBOX_PUBLIC_TOKEN;
  if (!token) throw new Error('Token público do Mapbox não configurado');
  if (!mapboxgl) {
    const [{ default: MapboxGL }] = await Promise.all([
      import('mapbox-gl'),
      import('mapbox-gl/dist/mapbox-gl.css'),
    ]);
    mapboxgl = MapboxGL;
  }
  mapboxgl.accessToken = token;
  const property = await fetch('/assets/analises/data/car-go-5209903.geojson').then((response) => response.json());
  const propertyFeature = property.type === 'FeatureCollection' ? property.features[0] : property;
  const coordinates = propertyFeature.geometry.coordinates[0];
  const propertyBounds = new mapboxgl.LngLatBounds();
  coordinates.forEach((coordinate) => propertyBounds.extend(coordinate));
  const propertyRing = coordinates.slice(0, -1);
  const propertyCentroid = propertyRing.reduce(
    ([longitudeTotal, latitudeTotal], [longitude, latitude]) => [longitudeTotal + longitude, latitudeTotal + latitude],
    [0, 0],
  ).map((total) => total / propertyRing.length);
  const pointInsideProperty = ([longitude, latitude]) => {
    let inside = false;
    for (let index = 0, previous = propertyRing.length - 1; index < propertyRing.length; previous = index++) {
      const current = propertyRing[index];
      const prior = propertyRing[previous];
      const intersects = ((current[1] > latitude) !== (prior[1] > latitude))
        && (longitude < ((prior[0] - current[0]) * (latitude - current[1])) / (prior[1] - current[1]) + current[0]);
      if (intersects) inside = !inside;
    }
    return inside;
  };
  const propertyLongitudes = propertyRing.map(([longitude]) => longitude);
  const propertyLatitudes = propertyRing.map(([, latitude]) => latitude);
  const propertyWest = Math.min(...propertyLongitudes);
  const propertyEast = Math.max(...propertyLongitudes);
  const propertySouth = Math.min(...propertyLatitudes);
  const propertyNorth = Math.max(...propertyLatitudes);
  const geographicCandidates = [];
  for (let row = 1; row < 20; row += 1) {
    for (let column = 1; column < 20; column += 1) {
      const candidate = [
        propertyWest + (propertyEast - propertyWest) * column / 20,
        propertySouth + (propertyNorth - propertySouth) * row / 20,
      ];
      if (pointInsideProperty(candidate)) geographicCandidates.push(candidate);
    }
  }
  const pickPropertyAnchors = (targetRatios, reservedAnchors = []) => targetRatios.reduce((anchors, [xRatio, yRatio]) => {
    const target = [
      propertyWest + (propertyEast - propertyWest) * xRatio,
      propertySouth + (propertyNorth - propertySouth) * yRatio,
    ];
    const unavailable = [...reservedAnchors, ...anchors];
    const available = geographicCandidates.filter((candidate) => !unavailable.includes(candidate));
    const closest = available.reduce((best, candidate) => {
      const score = (candidate[0] - target[0]) ** 2 + (candidate[1] - target[1]) ** 2;
      return !best || score < best.score ? { coordinate: candidate, score } : best;
    }, null);
    anchors.push(closest?.coordinate || propertyCentroid);
    return anchors;
  }, []);
  const initialInsightAnchors = pickPropertyAnchors([[.7, .72], [.3, .47], [.58, .22]]);
  const miningOccurrenceAnchors = pickPropertyAnchors([
    [.18, .2], [.43, .13], [.72, .2], [.83, .42],
    [.65, .58], [.4, .72], [.18, .82],
  ], initialInsightAnchors);
  const propertyInsights = [
    { label: 'Processos minerários', shortLabel: 'Processos ANM', value: '7 ocorrências', tone: 'mining' },
    { label: 'Verificação PRODES', shortLabel: 'PRODES', value: 'Alerta pós-2019', tone: 'alert' },
    { label: 'Supressão vegetal', shortLabel: 'Supressão', value: '6,04 ha · 0,04%', tone: 'vegetation' },
  ];
  const socioMap = new mapboxgl.Map({
    container: socioMapElement,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: propertyBounds.getCenter(),
    zoom: 10,
    pitch: 52,
    bearing: -22,
    antialias: true,
    attributionControl: true,
  });
  socioMap.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
  socioMap.scrollZoom.disable();

  socioMap.on('load', () => {
    socioMap.resize();
    socioMap.addSource('socio-property', { type: 'geojson', data: property });
    socioMap.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
    socioMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.25 });
    socioMap.addLayer({
      id: 'socio-property-surface',
      type: 'fill-extrusion',
      source: 'socio-property',
      paint: {
        'fill-extrusion-color': SOCIO_PROPERTY_STYLE.color,
        'fill-extrusion-height': 12,
        'fill-extrusion-base': 6,
        'fill-extrusion-opacity': SOCIO_PROPERTY_STYLE.fillOpacity,
        'fill-extrusion-vertical-gradient': false,
      },
    });
    socioMap.addLayer({
      id: 'socio-property-outline',
      type: 'line',
      source: 'socio-property',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': SOCIO_PROPERTY_STYLE.color,
        'line-width': SOCIO_PROPERTY_STYLE.lineWidth,
        'line-opacity': SOCIO_PROPERTY_STYLE.strokeOpacity,
      },
    });
    miningOccurrenceAnchors.forEach((coordinate, index) => {
      const element = document.createElement('div');
      element.className = 'socio-mining-occurrence';
      element.style.setProperty('--occurrence-delay', `${index * 360}ms`);
      element.setAttribute('aria-hidden', 'true');
      element.innerHTML = '<i></i><span></span>';
      new mapboxgl.Marker({ element, anchor: 'center' })
        .setLngLat(coordinate)
        .addTo(socioMap);
    });
    const insightMarkers = propertyInsights.map((insight, index) => {
      const displayLabel = socioMapElement.clientWidth < 620 ? insight.shortLabel : insight.label;
      const condensed = socioMapElement.clientWidth >= 620 && socioMapElement.clientWidth < 800;
      const element = document.createElement('div');
      element.className = `socio-insight-marker is-${insight.tone}`;
      element.classList.toggle('is-condensed', condensed);
      element.style.setProperty('--insight-delay', `${index * 170}ms`);
      element.setAttribute('role', 'note');
      element.setAttribute('aria-label', `${insight.label}: ${insight.value}`);
      element.innerHTML = `
        <div class="socio-insight-enter">
          <div class="socio-insight-float">
            <div class="socio-insight-card">
              <span><i></i><em>${displayLabel}</em></span>
              <strong>${insight.value}</strong>
            </div>
            <span class="socio-insight-stem"></span>
            <i class="socio-insight-pin"></i>
          </div>
        </div>
      `;
      const marker = new mapboxgl.Marker({ element, anchor: 'bottom' })
        .setLngLat(initialInsightAnchors[index])
        .addTo(socioMap);
      return { marker, element };
    });

    const pointInsideProjectedProperty = ([x, y], ring) => {
      let inside = false;
      for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
        const currentPoint = ring[index];
        const previousPoint = ring[previous];
        const intersects = ((currentPoint.y > y) !== (previousPoint.y > y))
          && (x < ((previousPoint.x - currentPoint.x) * (y - currentPoint.y)) / (previousPoint.y - currentPoint.y) + currentPoint.x);
        if (intersects) inside = !inside;
      }
      return inside;
    };
    let insightsLayoutReady = false;
    let insightsInViewport = false;
    const updateInsightVisibility = (replay = false) => {
      const shouldShow = insightsLayoutReady && insightsInViewport;
      insightMarkers.forEach(({ element }) => {
        if (!shouldShow) {
          element.classList.remove('is-visible');
          return;
        }
        if (replay || !element.classList.contains('is-visible')) {
          element.classList.remove('is-visible');
          void element.offsetWidth;
          element.classList.add('is-visible');
        }
      });
    };

    const layoutInsightMarkers = () => {
      const projectedRing = propertyRing.map((coordinate) => socioMap.project(coordinate));
      const xValues = projectedRing.map(({ x }) => x);
      const yValues = projectedRing.map(({ y }) => y);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      const compact = socioMapElement.clientWidth < 620;
      const condensed = socioMapElement.clientWidth >= 620 && socioMapElement.clientWidth < 800;
      const halfWidth = compact ? 40 : condensed ? 60 : 78;
      const stemHeight = compact ? 12 : condensed ? 28 : 36;
      const cardHeight = compact ? 28 : condensed ? 46 : 58;
      const totalHeight = stemHeight + cardHeight + 8;
      const step = compact ? 4 : 6;
      const candidates = [];

      for (let y = minY + totalHeight; y <= maxY - 5; y += step) {
        for (let x = minX + halfWidth; x <= maxX - halfWidth; x += step) {
          const footprint = [
            [x, y],
            [x - halfWidth, y - stemHeight],
            [x + halfWidth, y - stemHeight],
            [x - halfWidth, y - totalHeight],
            [x, y - totalHeight],
            [x + halfWidth, y - totalHeight],
          ];
          if (footprint.every((point) => pointInsideProjectedProperty(point, projectedRing))) {
            candidates.push({ x, y });
          }
        }
      }

      if (candidates.length < propertyInsights.length) return;
      const targetRatios = [[.72, .08], [.28, .55], [.6, .9]];
      const targets = targetRatios.map(([xRatio, yRatio]) => ({
        x: minX + (maxX - minX) * xRatio,
        y: minY + totalHeight + (maxY - minY - totalHeight) * yRatio,
      }));
      const rankedCandidates = targets.map((target) => candidates
        .map((candidate) => ({
          ...candidate,
          targetScore: (candidate.x - target.x) ** 2 + (candidate.y - target.y) ** 2,
        }))
        .sort((first, second) => first.targetScore - second.targetScore)
        .slice(0, compact ? 80 : 60));

      const cardRectangle = ({ x, y }) => ({
        left: x - halfWidth,
        right: x + halfWidth,
        top: y - totalHeight,
        bottom: y - stemHeight - 8,
      });
      const calloutsCollide = (first, second) => {
        const firstCard = cardRectangle(first);
        const secondCard = cardRectangle(second);
        const cardsOverlap = !(
          firstCard.right + 10 < secondCard.left
          || secondCard.right + 10 < firstCard.left
          || firstCard.bottom + 10 < secondCard.top
          || secondCard.bottom + 10 < firstCard.top
        );
        if (cardsOverlap) return true;
        const firstLineHitsSecondCard = first.x > secondCard.left - 5
          && first.x < secondCard.right + 5
          && first.y > secondCard.top
          && first.y - stemHeight < secondCard.bottom;
        const secondLineHitsFirstCard = second.x > firstCard.left - 5
          && second.x < firstCard.right + 5
          && second.y > firstCard.top
          && second.y - stemHeight < firstCard.bottom;
        return firstLineHitsSecondCard || secondLineHitsFirstCard;
      };

      let bestLayout;
      rankedCandidates[0].forEach((first) => {
        rankedCandidates[1].forEach((second) => {
          if (calloutsCollide(first, second)) return;
          rankedCandidates[2].forEach((third) => {
            if (calloutsCollide(first, third) || calloutsCollide(second, third)) return;
            const score = first.targetScore + second.targetScore + third.targetScore;
            if (!bestLayout || score < bestLayout.score) bestLayout = { anchors: [first, second, third], score };
          });
        });
      });

      if (!bestLayout) {
        insightsLayoutReady = true;
        updateInsightVisibility(true);
        return;
      }
      insightMarkers.forEach(({ marker }, index) => {
        const anchor = bestLayout.anchors[index];
        marker.setLngLat(socioMap.unproject([anchor.x, anchor.y]));
      });
      insightsLayoutReady = true;
      updateInsightVisibility(true);
    };

    const socioSection = socioMapElement.closest('#socioambiental');
    if ('IntersectionObserver' in window && socioSection) {
      const insightObserver = new IntersectionObserver(([entry]) => {
        insightsInViewport = entry.isIntersecting;
        updateInsightVisibility(entry.isIntersecting);
      }, { threshold: .08 });
      insightObserver.observe(socioSection);
    } else {
      insightsInViewport = true;
      updateInsightVisibility();
    }

    socioMap.once('moveend', () => {
      const mapWidth = socioMapElement.clientWidth;
      if (mapWidth >= 620 && mapWidth < 1100) {
        socioMap.setZoom(socioMap.getZoom() + .75);
        requestAnimationFrame(layoutInsightMarkers);
      } else {
        layoutInsightMarkers();
      }
    });
    requestAnimationFrame(() => {
      socioMap.resize();
      const compact = socioMapElement.clientWidth < 620;
      socioMap.fitBounds(propertyBounds, {
        padding: compact ? 14 : 72,
        pitch: compact ? 20 : 52,
        bearing: -22,
        duration: 1800,
      });
    });
    window.setTimeout(() => {
      if (insightsLayoutReady) return;
      layoutInsightMarkers();
      if (!insightsLayoutReady) {
        insightsLayoutReady = true;
        updateInsightVisibility(true);
      }
    }, 2400);

  });
}

if (socioMapElement) initializeSocioMap().catch((error) => {
  socioMapElement.innerHTML = `<span class="socio-map-error">Não foi possível renderizar o vetor: ${error.message}</span>`;
});

const analysisSections = [...document.querySelectorAll('.analysis-block[id]')];
const analysisLinks = [...document.querySelectorAll('[data-analysis-tabs] a')];
const analysisNavigationLinks = [...document.querySelectorAll('[data-analysis-tabs] a, .categories nav a')];
const analysisTabs = document.querySelector('[data-analysis-tabs]');
const analysisTabsScroller = analysisTabs?.querySelector('.analysis-tabs-links');

analysisNavigationLinks.forEach((link) => link.addEventListener('click', (event) => {
  const section = document.getElementById(link.hash.slice(1));
  if (!section) return;

  event.preventDefault();
  event.stopPropagation();
  setHeaderHidden(true);
  tabNavigationInProgress = true;
  const navigationId = ++tabNavigationId;
  const title = section.querySelector('.analysis-content header') || section;
  const tabsHeight = analysisTabs?.offsetHeight || (window.innerWidth <= 800 ? 48 : 42);
  const mobileNavigation = window.innerWidth <= 800;
  const headerHeight = mobileNavigation ? (header?.offsetHeight || 70) : 0;
  const titleGap = mobileNavigation ? 18 : 30;
  const titleTop = headerHeight + tabsHeight + titleGap;
  const offset = -titleTop;

  analysisLinks.forEach((tabLink) => tabLink.classList.toggle('active', tabLink.hash === link.hash));
  history.replaceState(null, '', link.hash);
  lenis.scrollTo(title, {
    offset,
    duration: 1.35,
    onComplete: () => {
      if (navigationId === tabNavigationId) tabNavigationInProgress = false;
    },
  });
}));

const activeAnalysis = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const currentLink = analysisLinks.find((link) => link.hash === `#${entry.target.id}`);
    analysisLinks.forEach((link) => link.classList.toggle('active', link === currentLink));
    if (currentLink && analysisTabsScroller) {
      const centeredLeft = currentLink.offsetLeft
        - (analysisTabsScroller.clientWidth - currentLink.offsetWidth) / 2;
      analysisTabsScroller.scrollTo({ left: centeredLeft, behavior: 'smooth' });
    }
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
analysisSections.forEach((section) => activeAnalysis.observe(section));

const map = document.querySelector('.land-price-map');
const mapImage = map?.querySelector('img');
const mapTooltip = map?.querySelector('[data-map-tooltip]');
const mapHint = map?.querySelector('[data-map-hint]');

if (map && mapHint) {
  map.addEventListener('pointerenter', () => map.classList.add('map-interacted'));
  map.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'touch') map.classList.remove('map-interacted');
  });
  map.addEventListener('touchstart', () => map.classList.add('map-interacted'), { once: true, passive: true });
}
const classRows = [
  ['Agricultura de Alto Potencial', 100000],
  ['Agricultura de Médio Potencial', 75000],
  ['Culturas Permanentes', 50000],
  ['Pastagem de Alto Suporte', 30000],
  ['Pastagem de Médio Suporte', 15000],
  ['Silvicultura', 25000],
  ['Remanescente de Vegetação', 7000],
];
const poleFactors = { 1: 1, 2: .94, 3: .88, 4: .81, 5: .74, 6: .68, 7: .62, 8: .56, 9: .51, 10: .46 };
const valueFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const poleColors = {
  1: [24, 88, 45, 132],
  2: [48, 111, 49, 129],
  3: [76, 137, 54, 126],
  4: [106, 159, 58, 123],
  5: [137, 180, 63, 120],
  6: [166, 198, 69, 117],
  7: [190, 211, 77, 114],
  8: [208, 220, 86, 111],
  9: [221, 226, 98, 108],
  10: [232, 232, 112, 105],
};

async function prepareVectorBoundaries() {
  const mobileMap = window.matchMedia('(max-width: 800px)').matches;
  const [polesResponse, stateResponse] = await Promise.all([
    fetch('/assets/analises/data/polos-agro.geojson'),
    fetch('/assets/analises/data/mt-limite.geojson'),
  ]);
  if (!polesResponse.ok || !stateResponse.ok) throw new Error('Não foi possível carregar os limites territoriais.');
  const [polesCollection, stateCollection] = await Promise.all([
    polesResponse.json(),
    stateResponse.json(),
  ]);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = mapImage.naturalWidth;
  canvas.height = mapImage.naturalHeight;
  canvas.className = 'map-boundary-overlay';

  const worldSize = 1024 * Math.pow(2, 3.7);
  const project = ([longitude, latitude]) => {
    const sinLatitude = Math.sin(latitude * Math.PI / 180);
    const worldX = (longitude + 180) / 360 * worldSize;
    const worldY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * worldSize;
    const centerLongitude = (-57.5 + 180) / 360 * worldSize;
    const centerSinLatitude = Math.sin(-11 * Math.PI / 180);
    const centerLatitude = (0.5 - Math.log((1 + centerSinLatitude) / (1 - centerSinLatitude)) / (4 * Math.PI)) * worldSize;
    return [
      worldX - centerLongitude + canvas.width / 2,
      worldY - centerLatitude + canvas.height / 2,
    ];
  };

  const traceRing = (target, ring) => {
    ring.forEach((coordinate, index) => {
      const [x, y] = project(coordinate);
      if (index === 0) target.moveTo(x, y);
      else target.lineTo(x, y);
    });
    target.closePath();
  };

  context.lineJoin = 'round';
  context.lineCap = 'round';
  const getGeometries = (collection) => collection.features?.map((feature) => feature.geometry)
    || collection.geometries
    || [collection];

  if (mobileMap) {
    const stateExtent = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const measureCoordinates = (coordinates) => {
      if (typeof coordinates[0] === 'number') {
        const [x, y] = project(coordinates);
        stateExtent.minX = Math.min(stateExtent.minX, x);
        stateExtent.minY = Math.min(stateExtent.minY, y);
        stateExtent.maxX = Math.max(stateExtent.maxX, x);
        stateExtent.maxY = Math.max(stateExtent.maxY, y);
        return;
      }
      coordinates.forEach(measureCoordinates);
    };
    getGeometries(stateCollection).forEach((geometry) => measureCoordinates(geometry.coordinates));

    const stateHeightRatio = (stateExtent.maxY - stateExtent.minY) / canvas.height;
    const stateCenterX = (stateExtent.minX + stateExtent.maxX) / 2 / canvas.width;
    const stateCenterY = (stateExtent.minY + stateExtent.maxY) / 2 / canvas.height;
    const fitScale = Math.min(2.35, .9 / stateHeightRatio);
    const shiftX = fitScale * (.5 - stateCenterX) * 100;
    const shiftY = fitScale * (.5 - stateCenterY) * 100;
    map.style.setProperty('--mt-fit-scale', fitScale.toFixed(4));
    map.style.setProperty('--mt-fit-x', `${shiftX.toFixed(3)}%`);
    map.style.setProperty('--mt-fit-y', `${shiftY.toFixed(3)}%`);
  }

  const drawCollection = (collection, { color, width, shadowColor = 'transparent', shadowBlur = 0 }) => {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.shadowColor = shadowColor;
    context.shadowBlur = shadowBlur;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    getGeometries(collection).forEach((geometry) => {
      const polygons = geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [geometry.coordinates];
      context.beginPath();
      polygons.forEach((polygon) => polygon.forEach((ring) => traceRing(context, ring)));
      context.stroke();
    });
  };

  drawCollection(polesCollection, {
    color: 'rgba(139, 145, 140, 0.68)',
    width: mobileMap ? .55 : 1,
  });
  drawCollection(stateCollection, {
    color: 'rgba(47, 107, 71, 0.95)',
    width: mobileMap ? 1.25 : 2.4,
    shadowColor: 'rgba(18, 36, 24, 0.3)',
    shadowBlur: mobileMap ? 3 : 6,
  });

  map.insertBefore(canvas, mapTooltip);

  const highlightCanvas = document.createElement('canvas');
  const highlightContext = highlightCanvas.getContext('2d');
  highlightCanvas.width = canvas.width;
  highlightCanvas.height = canvas.height;
  highlightCanvas.className = 'pixel-region-overlay';
  map.insertBefore(highlightCanvas, mapTooltip);
  const cursorLabel = document.createElement('div');
  cursorLabel.className = 'map-cursor-label';
  map.insertBefore(cursorLabel, mapTooltip);
  const statePrompt = document.createElement('div');
  statePrompt.className = 'map-state-prompt';
  statePrompt.innerHTML = '<strong>Passe o mouse</strong><small>Explore os valores de cada polo</small>';
  map.insertBefore(statePrompt, mapTooltip);

  const statePath = new Path2D();
  getGeometries(stateCollection).forEach((geometry) => {
    const polygons = geometry.type === 'MultiPolygon'
      ? geometry.coordinates
      : [geometry.coordinates];
    polygons.forEach((polygon) => polygon.forEach((ring) => traceRing(statePath, ring)));
  });

  const polePaths = polesCollection.features.map((feature) => {
    const path = new Path2D();
    const polygons = feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates];
    polygons.forEach((polygon) => polygon.forEach((ring) => traceRing(path, ring)));
    return { path, pole: feature.properties.polo, properties: feature.properties };
  });
  let highlightedPole = 0;
  let priceAnimation = 0;

  const animatePriceValues = () => {
    const animationId = ++priceAnimation;
    const cells = [...mapTooltip.querySelectorAll('[data-value]')];
    const duration = mobileMap ? 1050 : 1600;
    const startedAt = performance.now();

    const update = (now) => {
      if (animationId !== priceAnimation) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      cells.forEach((cell) => {
        const finalValue = Number(cell.dataset.value);
        cell.textContent = valueFormatter.format(Math.round(finalValue * eased));
      });
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        cells.forEach((cell) => {
          cell.textContent = 'R$*******';
        });
      }
    };

    requestAnimationFrame(update);
  };

  const paintStatePrompt = () => {
    highlightContext.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    highlightContext.fillStyle = 'rgba(13, 37, 27, 0.58)';
    highlightContext.strokeStyle = 'rgba(182, 214, 92, 0.72)';
    highlightContext.lineWidth = 2.4;
    highlightContext.lineJoin = 'round';
    highlightContext.fill(statePath, 'evenodd');
    highlightContext.stroke(statePath);
    statePrompt.classList.remove('hidden');
  };

  const paintHighlight = (poleEntry) => {
    const nextPole = poleEntry?.pole || 0;
    if (nextPole === highlightedPole) return;
    highlightedPole = nextPole;
    highlightContext.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    if (!poleEntry) {
      paintStatePrompt();
      mapTooltip.classList.remove('visible');
      mapTooltip.setAttribute('aria-hidden', 'true');
      return;
    }
    statePrompt.classList.add('hidden');
    highlightContext.fillStyle = 'rgba(47, 107, 71, 0.2)';
    highlightContext.strokeStyle = 'rgba(47, 107, 71, 0.9)';
    highlightContext.lineWidth = mobileMap ? 1 : 2;
    highlightContext.lineJoin = 'round';
    highlightContext.fill(poleEntry.path, 'evenodd');
    highlightContext.stroke(poleEntry.path);

    const factor = poleFactors[poleEntry.pole];
    const rows = classRows.map(([name, baseValue]) => {
      const finalValue = Math.round(baseValue * factor / 500) * 500;
      return `<tr><th>${name}</th><td data-value="${finalValue}">0,00</td></tr>`;
    }).join('');
    mapTooltip.innerHTML = `<b>Polo ${String(poleEntry.pole).padStart(2, '0')}</b><strong>Classes e valores da terra</strong><small>${poleEntry.properties.referencia}</small><div class="tooltip-table-wrap"><table><thead><tr><th>Classe</th><th>Valor/ha</th></tr></thead><tbody>${rows}</tbody></table></div><p class="tooltip-disclaimer">Valores meramente demonstrativos. Não representam referências reais de mercado.</p>`;
    mapTooltip.classList.add('visible');
    mapTooltip.setAttribute('aria-hidden', 'false');
    if (mobileMap) {
      highlightCanvas.classList.remove('pole-transition');
      mapTooltip.classList.remove('pole-transition');
      void highlightCanvas.offsetWidth;
      highlightCanvas.classList.add('pole-transition');
      mapTooltip.classList.add('pole-transition');
    }
    animatePriceValues();
  };

  if (mobileMap) {
    mapTooltip.classList.add('mobile-price-panel');
    map.after(mapTooltip);
    const orderedPoles = [...polePaths].sort((first, second) => first.pole - second.pole);
    let mobilePoleIndex = 0;
    let mobileRotationTimer = 0;
    const showMobilePole = () => {
      paintHighlight(orderedPoles[mobilePoleIndex]);
      mobilePoleIndex = (mobilePoleIndex + 1) % orderedPoles.length;
    };
    const stopMobileRotation = () => {
      window.clearInterval(mobileRotationTimer);
      mobileRotationTimer = 0;
    };
    const startMobileRotation = () => {
      if (mobileRotationTimer) return;
      showMobilePole();
      mobileRotationTimer = window.setInterval(showMobilePole, 2600);
    };
    const mobileMapObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startMobileRotation();
      else stopMobileRotation();
    }, { threshold: .18 });
    mobileMapObserver.observe(map);
  } else {
    paintStatePrompt();
  }

  const findPoleAt = (clientX, clientY) => {
    const rect = mapImage.getBoundingClientRect();
    const coverScale = Math.max(rect.width / canvas.width, rect.height / canvas.height);
    const cropX = (canvas.width * coverScale - rect.width) / 2;
    const cropY = (canvas.height * coverScale - rect.height) / 2;
    const x = (clientX - rect.left + cropX) / coverScale;
    const y = (clientY - rect.top + cropY) / coverScale;
    const poleEntry = polePaths.find(({ path }) => highlightContext.isPointInPath(path, x, y, 'evenodd'));
    return { poleEntry, rect };
  };

  map.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const { poleEntry, rect } = findPoleAt(event.clientX, event.clientY);
    paintHighlight(poleEntry);
    if (poleEntry) {
      cursorLabel.textContent = `Polo ${String(poleEntry.pole).padStart(2, '0')}`;
      cursorLabel.style.left = `${event.clientX - rect.left}px`;
      cursorLabel.style.top = `${event.clientY - rect.top}px`;
      cursorLabel.classList.add('visible');
    } else {
      cursorLabel.classList.remove('visible');
    }

    if (poleEntry && window.innerWidth > 800) {
      const viewportMargin = 16;
      const panelWidth = Math.min(390, Math.max(220, rect.left - viewportMargin));
      mapTooltip.style.width = `${panelWidth}px`;
      mapTooltip.style.left = `${Math.max(viewportMargin, rect.left - panelWidth)}px`;
      const tooltipHalfHeight = mapTooltip.offsetHeight / 2;
      const minimumCenter = viewportMargin + tooltipHalfHeight;
      const maximumCenter = window.innerHeight - viewportMargin - tooltipHalfHeight;
      const mapCenter = rect.top + rect.height / 2;
      const desiredCenter = Math.max(minimumCenter, Math.min(maximumCenter, mapCenter));
      mapTooltip.style.top = `${desiredCenter}px`;
    }
  });

  let touchStart = null;
  map.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    touchStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  map.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'touch' || !touchStart) return;
    const movement = Math.hypot(event.clientX - touchStart.x, event.clientY - touchStart.y);
    touchStart = null;
    if (movement > 12) return;
    const { poleEntry } = findPoleAt(event.clientX, event.clientY);
    if (poleEntry) paintHighlight(poleEntry);
  }, { passive: true });
  map.addEventListener('pointercancel', () => { touchStart = null; });

  map.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return;
    paintHighlight(null);
    cursorLabel.classList.remove('visible');
    mapTooltip.style.removeProperty('width');
    mapTooltip.style.removeProperty('left');
    mapTooltip.style.removeProperty('top');
  });
  map.classList.add('pointer-ready');
}

function prepareRedBoundaryMap(boundaryImage) {
  const maxDetectionWidth = 1200;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = Math.min(maxDetectionWidth, mapImage.naturalWidth);
  canvas.height = Math.round(canvas.width * mapImage.naturalHeight / mapImage.naturalWidth);

  // Reprojeta o recorte histórico dos polos para o enquadramento continental
  // da imagem Mapbox (centro -57.5/-11, zoom 3.7).
  const outputScale = canvas.width / mapImage.naturalWidth;
  const worldSize = 1024 * Math.pow(2, 3.7) * outputScale;
  const project = (longitude, latitude) => {
    const sinLatitude = Math.sin(latitude * Math.PI / 180);
    return {
      x: (longitude + 180) / 360 * worldSize,
      y: (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * worldSize,
    };
  };
  const mapCenter = project(-57.5, -11);
  const viewportLeft = mapCenter.x - canvas.width / 2;
  const viewportTop = mapCenter.y - canvas.height / 2;
  const sourceNorthWest = project(-64.9, -6.9);
  const sourceSouthEast = project(-46.95, -18.35);
  const boundaryOffsetX = sourceNorthWest.x - viewportLeft;
  const boundaryOffsetY = sourceNorthWest.y - viewportTop;
  const boundaryWidth = sourceSouthEast.x - sourceNorthWest.x;
  const boundaryHeight = sourceSouthEast.y - sourceNorthWest.y;
  context.drawImage(boundaryImage, boundaryOffsetX, boundaryOffsetY, boundaryWidth, boundaryHeight);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const pixelCount = canvas.width * canvas.height;
  const redBoundary = new Uint8Array(pixelCount);

  for (let index = 0; index < pixelCount; index += 1) {
    const pixel = index * 4;
    const red = pixels[pixel];
    const green = pixels[pixel + 1];
    const blue = pixels[pixel + 2];
    if (red > 145 && red - green > 48 && red - blue > 38 && green < 165) redBoundary[index] = 1;
  }

  // Expande levemente os traços para fechar as áreas apesar do antialiasing.
  const sealedBoundary = redBoundary.slice();
  const boundaryRadius = 2;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const index = y * canvas.width + x;
      if (!redBoundary[index]) continue;
      for (let offsetY = -boundaryRadius; offsetY <= boundaryRadius; offsetY += 1) {
        const neighborY = y + offsetY;
        if (neighborY < 0 || neighborY >= canvas.height) continue;
        for (let offsetX = -boundaryRadius; offsetX <= boundaryRadius; offsetX += 1) {
          const neighborX = x + offsetX;
          if (neighborX < 0 || neighborX >= canvas.width) continue;
          sealedBoundary[neighborY * canvas.width + neighborX] = 1;
        }
      }
    }
  }

  const boundaryCanvas = document.createElement('canvas');
  const boundaryContext = boundaryCanvas.getContext('2d');
  boundaryCanvas.width = canvas.width;
  boundaryCanvas.height = canvas.height;
  boundaryCanvas.className = 'map-boundary-overlay';
  const boundaryLayer = boundaryContext.createImageData(canvas.width, canvas.height);
  for (let index = 0; index < pixelCount; index += 1) {
    if (!sealedBoundary[index]) continue;
    const pixel = index * 4;
    boundaryLayer.data[pixel] = 47;
    boundaryLayer.data[pixel + 1] = 107;
    boundaryLayer.data[pixel + 2] = 71;
    boundaryLayer.data[pixel + 3] = 255;
  }
  boundaryContext.putImageData(boundaryLayer, 0, 0);
  map.insertBefore(boundaryCanvas, mapTooltip);

  const labels = new Uint32Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const components = [{ area: 0, touchesEdge: true }];
  let label = 0;

  for (let start = 0; start < pixelCount; start += 1) {
    if (sealedBoundary[start] || labels[start]) continue;
    label += 1;
    let head = 0;
    let tail = 0;
    let touchesEdge = false;
    labels[start] = label;
    queue[tail++] = start;

    while (head < tail) {
      const index = queue[head++];
      const x = index % canvas.width;
      const y = Math.floor(index / canvas.width);
      if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) touchesEdge = true;

      const neighbors = [
        x > 0 ? index - 1 : -1,
        x < canvas.width - 1 ? index + 1 : -1,
        y > 0 ? index - canvas.width : -1,
        y < canvas.height - 1 ? index + canvas.width : -1,
      ];
      for (const neighbor of neighbors) {
        if (neighbor < 0 || sealedBoundary[neighbor] || labels[neighbor]) continue;
        labels[neighbor] = label;
        queue[tail++] = neighbor;
      }
    }

    components[label] = { area: tail, touchesEdge };
  }

  const poleAnchors = {
    1: [.292, .266],
    2: [.511, .234],
    3: [.722, .42],
    4: [.70, .75],
    5: [.60, .86],
    6: [.60, .67],
    7: [.45, .79],
    8: [.32, .73],
    9: [.36, .56],
    10: [.52, .46],
  };
  const minimumPoleArea = pixelCount * .004;
  const labelToPole = new Map();

  const isValidPoleLabel = (candidate) => candidate
    && !components[candidate]?.touchesEdge
    && components[candidate].area >= minimumPoleArea
    && !labelToPole.has(candidate);

  Object.entries(poleAnchors).forEach(([poleValue, [relativeX, relativeY]]) => {
    const pole = Number(poleValue);
    const anchorX = Math.round(boundaryOffsetX + relativeX * boundaryWidth);
    const anchorY = Math.round(boundaryOffsetY + relativeY * boundaryHeight);
    let componentLabel = labels[anchorY * canvas.width + anchorX];

    if (!isValidPoleLabel(componentLabel)) {
      componentLabel = 0;
      const searchLimit = Math.round(Math.min(canvas.width, canvas.height) * .07);
      for (let radius = 4; radius <= searchLimit && !componentLabel; radius += 4) {
        const samples = Math.max(16, Math.round(radius * .8));
        for (let sample = 0; sample < samples; sample += 1) {
          const angle = sample / samples * Math.PI * 2;
          const x = Math.round(anchorX + Math.cos(angle) * radius);
          const y = Math.round(anchorY + Math.sin(angle) * radius);
          if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
          const candidate = labels[y * canvas.width + x];
          if (isValidPoleLabel(candidate)) { componentLabel = candidate; break; }
        }
      }
    }

    if (componentLabel) labelToPole.set(componentLabel, pole);
  });

  const regions = new Uint8Array(pixelCount);
  for (let index = 0; index < pixelCount; index += 1) {
    regions[index] = labelToPole.get(labels[index]) || 0;
  }

  // Mantém o entorno nítido e aplica o desfoque inicial somente dentro dos
  // limites detectados do estado.
  const stateBlurCanvas = document.createElement('canvas');
  const stateBlurContext = stateBlurCanvas.getContext('2d');
  stateBlurCanvas.width = canvas.width;
  stateBlurCanvas.height = canvas.height;
  stateBlurCanvas.className = 'map-state-blur';
  stateBlurContext.filter = 'blur(10px)';
  stateBlurContext.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
  stateBlurContext.filter = 'none';
  stateBlurContext.globalCompositeOperation = 'destination-in';
  const stateMask = stateBlurContext.createImageData(canvas.width, canvas.height);
  for (let index = 0; index < regions.length; index += 1) {
    if (!regions[index]) continue;
    const pixel = index * 4;
    stateMask.data[pixel] = 255;
    stateMask.data[pixel + 1] = 255;
    stateMask.data[pixel + 2] = 255;
    stateMask.data[pixel + 3] = 255;
  }
  const stateMaskCanvas = document.createElement('canvas');
  stateMaskCanvas.width = canvas.width;
  stateMaskCanvas.height = canvas.height;
  stateMaskCanvas.getContext('2d').putImageData(stateMask, 0, 0);
  stateBlurContext.drawImage(stateMaskCanvas, 0, 0);
  stateBlurContext.globalCompositeOperation = 'source-over';
  map.insertBefore(stateBlurCanvas, mapTooltip);

  const regionCanvas = document.createElement('canvas');
  const regionContext = regionCanvas.getContext('2d');
  regionCanvas.width = canvas.width;
  regionCanvas.height = canvas.height;
  regionCanvas.className = 'pixel-region-overlay';
  map.insertBefore(regionCanvas, mapTooltip);
  map.dataset.detectedPoles = String(labelToPole.size);
  map.dataset.detectedPoleIds = [...labelToPole.values()].sort((a, b) => a - b).join(',');

  let paintedPole = 0;
  let tooltipPole = 0;
  let countAnimation = 0;

  const animateTooltipValues = () => {
    const animationId = ++countAnimation;
    const cells = [...mapTooltip.querySelectorAll('[data-value]')];
    const duration = 750;
    const startedAt = performance.now();

    const update = (now) => {
      if (animationId !== countAnimation) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      cells.forEach((cell) => {
        const finalValue = Number(cell.dataset.value);
        cell.textContent = valueFormatter.format(Math.round(finalValue * eased));
      });
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const paintRegion = (pole) => {
    if (pole === paintedPole) return;
    paintedPole = pole;
    regionContext.clearRect(0, 0, regionCanvas.width, regionCanvas.height);
    if (!pole) return;
    const color = poleColors[pole];
    const layer = regionContext.createImageData(regionCanvas.width, regionCanvas.height);
    for (let index = 0; index < regions.length; index += 1) {
      if (regions[index] !== pole) continue;
      const pixel = index * 4;
      layer.data[pixel] = color[0];
      layer.data[pixel + 1] = color[1];
      layer.data[pixel + 2] = color[2];
      layer.data[pixel + 3] = color[3];
    }
    regionContext.putImageData(layer, 0, 0);
  };

  map.classList.add('pointer-ready');
  map.addEventListener('pointermove', (event) => {
    const rect = mapImage.getBoundingClientRect();
    const containScale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
    const renderedWidth = canvas.width * containScale;
    const renderedHeight = canvas.height * containScale;
    const offsetX = (rect.width - renderedWidth) / 2;
    const offsetY = (rect.height - renderedHeight) / 2;
    const x = Math.floor((event.clientX - rect.left - offsetX) / containScale);
    const y = Math.floor((event.clientY - rect.top - offsetY) / containScale);
    const pole = x >= 0 && y >= 0 && x < canvas.width && y < canvas.height
      ? regions[y * canvas.width + x]
      : 0;
    paintRegion(pole);
    if (!pole) {
      tooltipPole = 0;
      countAnimation += 1;
      mapTooltip.classList.remove('visible');
      return;
    }

    if (pole !== tooltipPole) {
      tooltipPole = pole;
      const factor = poleFactors[pole];
      const rows = classRows.map(([name, baseValue]) => {
        const finalValue = Math.round(baseValue * factor / 500) * 500;
        return `<tr><th>${name}</th><td data-value="${finalValue}">0,00</td></tr>`;
      }).join('');
      mapTooltip.innerHTML = `<b>Polo ${pole}</b><strong>Classes e valores da terra</strong><small>Referência abr./2026</small><div class="tooltip-table-wrap"><table><thead><tr><th>Classe</th><th>Valor/ha</th></tr></thead><tbody>${rows}</tbody></table></div><p class="tooltip-disclaimer">Valores meramente demonstrativos. Não representam referências reais de mercado.</p>`;
      animateTooltipValues();
    }

    mapTooltip.classList.add('visible');

    if (window.innerWidth > 800) {
      const viewportMargin = 16;
      const panelWidth = Math.min(390, Math.max(180, rect.left - viewportMargin));
      mapTooltip.style.width = `${panelWidth}px`;
      mapTooltip.style.left = `${rect.left - panelWidth}px`;

      const tooltipHalfHeight = mapTooltip.offsetHeight / 2;
      const imageCenter = rect.top + rect.height / 2;
      const minimumCenter = viewportMargin + tooltipHalfHeight;
      const maximumCenter = window.innerHeight - viewportMargin - tooltipHalfHeight;
      mapTooltip.style.top = `${Math.max(minimumCenter, Math.min(maximumCenter, imageCenter))}px`;
    } else {
      mapTooltip.style.removeProperty('width');
      mapTooltip.style.removeProperty('left');
      mapTooltip.style.removeProperty('top');
    }
  });

  map.addEventListener('pointerleave', () => {
    paintRegion(0);
    tooltipPole = 0;
    countAnimation += 1;
    mapTooltip.classList.remove('visible');
  });

  window.addEventListener('resize', () => {
    paintRegion(0);
    tooltipPole = 0;
    countAnimation += 1;
    mapTooltip.classList.remove('visible');
    mapTooltip.style.removeProperty('width');
    mapTooltip.style.removeProperty('left');
    mapTooltip.style.removeProperty('top');
  }, { passive: true });
}

async function preparePixelMap() {
  if (!map || !mapImage || !mapTooltip || !mapImage.naturalWidth) return;
  if (map.classList.contains('boundaries-only')) {
    await prepareVectorBoundaries();
    return;
  }
  if (map.classList.contains('has-red-boundaries')) {
    const boundaryImage = new Image();
    const boundaryReady = new Promise((resolve, reject) => {
      boundaryImage.addEventListener('load', resolve, { once: true });
      boundaryImage.addEventListener('error', reject, { once: true });
    });
    boundaryImage.src = '/assets/analises/maps/mt-boundaries.webp';
    await boundaryReady;
    prepareRedBoundaryMap(boundaryImage);
    return;
  }
  const maskImage = new Image();
  const maskReady = new Promise((resolve, reject) => {
    maskImage.addEventListener('load', resolve, { once: true });
    maskImage.addEventListener('error', reject, { once: true });
  });
  maskImage.src = '/assets/analises/maps/precoterra-mask.png';
  await maskReady;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  canvas.width = maskImage.naturalWidth;
  canvas.height = maskImage.naturalHeight;
  context.imageSmoothingEnabled = false;
  context.drawImage(maskImage, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const regions = new Uint8Array(canvas.width * canvas.height);
  for (let index = 0; index < regions.length; index += 1) {
    const pixel = index * 4;
    regions[index] = pixels[pixel + 3] > 127 ? Math.round(pixels[pixel] / 20) : 0;
  }

  // A numeração impressa no mapa cria pequenos vazios na máscara. Esses
  // vazios devem continuar pertencendo ao polo ao redor, inclusive no hover.
  const visited = new Uint8Array(regions.length);
  const queue = new Int32Array(regions.length);
  const maxNumberHoleArea = 12000;
  for (let start = 0; start < regions.length; start += 1) {
    if (regions[start] || visited[start]) continue;

    let head = 0;
    let tail = 0;
    let surroundingPole = 0;
    let hasMultiplePoles = false;
    let touchesCanvasEdge = false;
    visited[start] = 1;
    queue[tail++] = start;

    while (head < tail) {
      const index = queue[head++];
      const x = index % canvas.width;
      const y = Math.floor(index / canvas.width);
      if (x === 0 || y === 0 || x === canvas.width - 1 || y === canvas.height - 1) {
        touchesCanvasEdge = true;
      }

      const neighbors = [
        x > 0 ? index - 1 : -1,
        x < canvas.width - 1 ? index + 1 : -1,
        y > 0 ? index - canvas.width : -1,
        y < canvas.height - 1 ? index + canvas.width : -1,
      ];

      for (const neighbor of neighbors) {
        if (neighbor < 0) continue;
        const pole = regions[neighbor];
        if (pole) {
          if (!surroundingPole) surroundingPole = pole;
          else if (pole !== surroundingPole) hasMultiplePoles = true;
          continue;
        }
        if (visited[neighbor]) continue;
        visited[neighbor] = 1;
        queue[tail++] = neighbor;
      }
    }

    if (touchesCanvasEdge || hasMultiplePoles || !surroundingPole || tail > maxNumberHoleArea) continue;
    for (let index = 0; index < tail; index += 1) regions[queue[index]] = surroundingPole;
  }

  // O rótulo 4 toca visualmente a faixa estreita que segue até o limite do
  // polo. Preenchemos apenas lacunas que tenham o próprio polo 4 dos dois
  // lados; assim a faixa fica contínua sem atravessar nenhuma divisa.
  const poleFourBounds = {
    left: Math.round(canvas.width * 0.6),
    right: Math.round(canvas.width * 0.69),
    top: Math.round(canvas.height * 0.54),
    bottom: Math.round(canvas.height * 0.68),
  };
  const maxPoleFourGap = Math.round(canvas.width * 0.04);
  for (let pass = 0; pass < 2; pass += 1) {
    for (let y = poleFourBounds.top; y <= poleFourBounds.bottom; y += 1) {
      let x = poleFourBounds.left;
      while (x <= poleFourBounds.right) {
        if (regions[y * canvas.width + x]) { x += 1; continue; }
        const start = x;
        while (x <= poleFourBounds.right && !regions[y * canvas.width + x]) x += 1;
        const end = x - 1;
        const leftPole = start > poleFourBounds.left ? regions[y * canvas.width + start - 1] : 0;
        const rightPole = x <= poleFourBounds.right ? regions[y * canvas.width + x] : 0;
        if (leftPole !== 4 || rightPole !== 4 || end - start + 1 > maxPoleFourGap) continue;
        for (let fillX = start; fillX <= end; fillX += 1) regions[y * canvas.width + fillX] = 4;
      }
    }

    for (let x = poleFourBounds.left; x <= poleFourBounds.right; x += 1) {
      let y = poleFourBounds.top;
      while (y <= poleFourBounds.bottom) {
        if (regions[y * canvas.width + x]) { y += 1; continue; }
        const start = y;
        while (y <= poleFourBounds.bottom && !regions[y * canvas.width + x]) y += 1;
        const end = y - 1;
        const topPole = start > poleFourBounds.top ? regions[(start - 1) * canvas.width + x] : 0;
        const bottomPole = y <= poleFourBounds.bottom ? regions[y * canvas.width + x] : 0;
        if (topPole !== 4 || bottomPole !== 4 || end - start + 1 > maxPoleFourGap) continue;
        for (let fillY = start; fillY <= end; fillY += 1) regions[fillY * canvas.width + x] = 4;
      }
    }
  }

  // Completa a faixa interna sob a numeração até a ponta inferior do polo 4.
  // O formato afunilado acompanha a geometria local sem alcançar os vizinhos.
  const poleFourPatch = {
    centerX: Math.round(canvas.width * 0.64),
    top: Math.round(canvas.height * 0.588),
    bottom: Math.round(canvas.height * 0.66),
    wideRadius: Math.round(canvas.width * 0.018),
    tipRadius: Math.round(canvas.width * 0.005),
  };
  for (let y = poleFourPatch.top; y <= poleFourPatch.bottom; y += 1) {
    const progress = (y - poleFourPatch.top) / (poleFourPatch.bottom - poleFourPatch.top);
    const taper = Math.max(0, (progress - 0.55) / 0.45);
    const radius = Math.round(poleFourPatch.wideRadius + (poleFourPatch.tipRadius - poleFourPatch.wideRadius) * taper);
    for (let x = poleFourPatch.centerX - radius; x <= poleFourPatch.centerX + radius; x += 1) {
      const index = y * canvas.width + x;
      if (!regions[index]) regions[index] = 4;
    }
  }

  const regionCanvas = document.createElement('canvas');
  const regionContext = regionCanvas.getContext('2d');
  regionCanvas.width = canvas.width;
  regionCanvas.height = canvas.height;
  regionCanvas.className = 'pixel-region-overlay';
  map.insertBefore(regionCanvas, mapTooltip);
  let paintedPole = 0;
  let tooltipPole = 0;
  let countAnimation = 0;

  const animateTooltipValues = () => {
    const animationId = ++countAnimation;
    const cells = [...mapTooltip.querySelectorAll('[data-value]')];
    const duration = 750;
    const startedAt = performance.now();
    const update = (now) => {
      if (animationId !== countAnimation) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      cells.forEach((cell) => {
        const finalValue = Number(cell.dataset.value);
        cell.textContent = valueFormatter.format(Math.round(finalValue * eased));
      });
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const paintRegion = (pole) => {
    if (pole === paintedPole) return;
    paintedPole = pole;
    regionContext.clearRect(0, 0, regionCanvas.width, regionCanvas.height);
    if (!pole) return;
    const color = poleColors[pole];
    const layer = regionContext.createImageData(regionCanvas.width, regionCanvas.height);
    for (let index = 0; index < regions.length; index += 1) {
      if (regions[index] !== pole) continue;
      const pixel = index * 4;
      layer.data[pixel] = color[0];
      layer.data[pixel + 1] = color[1];
      layer.data[pixel + 2] = color[2];
      layer.data[pixel + 3] = color[3];
    }
    regionContext.putImageData(layer, 0, 0);
  };

  map.classList.add('pointer-ready');
  map.addEventListener('pointermove', (event) => {
    const rect = mapImage.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / rect.width * canvas.width);
    const y = Math.floor((event.clientY - rect.top) / rect.height * canvas.height);
    const pole = x >= 0 && y >= 0 && x < canvas.width && y < canvas.height ? regions[y * canvas.width + x] : 0;
    paintRegion(pole);
    if (!pole) { mapTooltip.classList.remove('visible'); return; }
    if (pole !== tooltipPole) {
      tooltipPole = pole;
      const factor = poleFactors[pole];
      const rows = classRows.map(([name, baseValue]) => {
        const finalValue = Math.round(baseValue * factor / 500) * 500;
        return `<tr><th>${name}</th><td data-value="${finalValue}">0,00</td></tr>`;
      }).join('');
      mapTooltip.innerHTML = `<b>Polo ${pole}</b><strong>Classes e valores da terra</strong><div class="tooltip-table-wrap"><table><thead><tr><th>Classe</th><th>Valor/ha</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      mapTooltip.classList.remove('no-data');
      animateTooltipValues();
    }
    mapTooltip.style.left = `${event.clientX - rect.left}px`;
    mapTooltip.style.top = `${event.clientY - rect.top}px`;
    mapTooltip.classList.add('visible');
  });
  map.addEventListener('pointerleave', () => {
    paintRegion(0);
    tooltipPole = 0;
    countAnimation += 1;
    mapTooltip.classList.remove('visible');
  });
}

if (map && mapImage) {
  const initializeMap = () => {
    if (map.classList.contains('poles-disabled')) return;
    if (mapImage.complete) preparePixelMap();
    else mapImage.addEventListener('load', preparePixelMap, { once: true });
  };

  if ('IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      initializeMap();
    }, { rootMargin: '500px 0px' });
    mapObserver.observe(map);
  } else {
    initializeMap();
  }
}
