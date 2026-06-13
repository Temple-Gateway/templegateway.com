/**
 * Alternative: Use a backend proxy instead of direct Wix API calls
 * 
 * If you set up a backend proxy (see backend-proxy-example.js),
 * update your hooks to use these functions instead.
 */

const PROXY_BASE_URL = import.meta.env.DEV ? (import.meta.env.VITE_PROXY_URL || '') : '';

/**
 * Fetch all temples from backend proxy
 */
export async function fetchTemplesFromProxy() {
  try {
    console.log(`🔄 Fetching temples from proxy: ${PROXY_BASE_URL}/api/temples`);
    const response = await fetch(`${PROXY_BASE_URL}/api/temples`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch temples'}`);
    }
    const data = await response.json();
    console.log(`✅ Received ${data.length} temples from proxy`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching temples from proxy:', error);
    throw error;
  }
}

/**
 * Fetch a single temple by ID/Slug from backend proxy
 */
export async function fetchTempleByIdFromProxy(idOrSlug: string | number) {
  try {
    console.log(`🔄 Fetching temple ${idOrSlug} from proxy: ${PROXY_BASE_URL}/api/temples/${idOrSlug}`);
    const response = await fetch(`${PROXY_BASE_URL}/api/temples/${idOrSlug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch temple'}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching temple ${idOrSlug} from proxy:`, error);
    throw error;
  }
}

/**
 * Fetch all tours from backend proxy
 */
export async function fetchToursFromProxy() {
  try {
    console.log(`🔄 Fetching tours from proxy: ${PROXY_BASE_URL}/api/tours`);
    const response = await fetch(`${PROXY_BASE_URL}/api/tours`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch tours'}`);
    }
    const data = await response.json();
    console.log(`✅ Received ${data.length} tours from proxy`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching tours from proxy:', error);
    throw error;
  }
}

/**
 * Fetch a single tour by ID/Slug from backend proxy
 */
export async function fetchTourByIdFromProxy(idOrSlug: string | number) {
  try {
    console.log(`🔄 Fetching tour ${idOrSlug} from proxy: ${PROXY_BASE_URL}/api/tours/${idOrSlug}`);
    const response = await fetch(`${PROXY_BASE_URL}/api/tours/${idOrSlug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch tour'}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching tour ${idOrSlug} from proxy:`, error);
    throw error;
  }
}
