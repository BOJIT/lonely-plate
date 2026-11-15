type Point = { lat: number; lng: number };
type Padding = { top: number; right: number; bottom: number; left: number };

const TILE_SIZE = 512; // MapLibre's world size in pixels at zoom 0

// Web Mercator's vertical axis, in radians (spans -π..π across the world).
const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const mercatorLat = (y: number) => ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;

/**
 * Computes the initial `center` and `zoom` that frame every point inside a viewport,
 * leaving `padding` pixels free on each side (e.g. for a floating panel).
 * This is done up front so it can be passed straight to <Map>, with no camera animation on load.
 */
export function fitView(
	points: Point[],
	viewport: { width: number; height: number },
	padding: Padding,
	maxZoom = 5
): { center: [number, number]; zoom: number } {
	const lngs = points.map((p) => p.lng);
	const ys = points.map((p) => mercatorY(p.lat));
	const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];
	const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];

	const usableWidth = Math.max(1, viewport.width - padding.left - padding.right);
	const usableHeight = Math.max(1, viewport.height - padding.top - padding.bottom);

	const lngSpan = maxLng - minLng;
	const ySpan = maxY - minY;
	const zoomForWidth =
		lngSpan > 0 ? Math.log2((usableWidth / TILE_SIZE) * (360 / lngSpan)) : Infinity;
	const zoomForHeight =
		ySpan > 0 ? Math.log2((usableHeight / TILE_SIZE) * ((2 * Math.PI) / ySpan)) : Infinity;
	const zoom = Math.min(Math.max(Math.min(zoomForWidth, zoomForHeight), 0), maxZoom);

	// Shift the camera so the bounding box sits in the middle of the padded area, not the whole screen.
	const worldPx = TILE_SIZE * 2 ** zoom;
	const shiftX = (padding.left - padding.right) / 2;
	const shiftY = (padding.top - padding.bottom) / 2;
	const lng = (minLng + maxLng) / 2 - (shiftX / worldPx) * 360;
	const y = (minY + maxY) / 2 + (shiftY / worldPx) * 2 * Math.PI;

	return { center: [lng, mercatorLat(y)], zoom };
}
