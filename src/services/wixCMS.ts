import { items } from '@wix/data';
import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { getWixImageUrl } from '@/lib/utils';

export function generateSlug(name: string): string {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface LocationInferenceInput {
  name?: string;
  address1?: string;
  address2?: string;
  content?: string;
  religion?: string;
  latitude?: string | number;
  longitude?: string | number;
  state?: string;
  district?: string;
  town?: string;
}

export function inferStateAndDistrict(t: LocationInferenceInput) {
  let state = t.state || "";
  let district = t.district || "";
  let town = t.town || "";

  // Normalize state name if present
  if (state) {
    state = state.trim();
    const cleanLower = state.toLowerCase().replace(/[^a-z]/g, "");
    if (cleanLower === "uttarpradesh") {
      state = "Uttar Pradesh";
    } else if (cleanLower === "westbengal") {
      state = "West Bengal";
    } else if (cleanLower === "andhrapradesh") {
      state = "Andhra Pradesh";
    } else if (cleanLower === "madhyapradesh") {
      state = "Madhya Pradesh";
    } else if (cleanLower === "himachalpradesh") {
      state = "Himachal Pradesh";
    } else if (cleanLower === "jammuandkashmir" || cleanLower === "jammukashmir") {
      state = "Jammu & Kashmir";
    } else if (cleanLower === "tamilnadu") {
      state = "Tamil Nadu";
    } else if (cleanLower === "arunachalpradesh") {
      state = "Arunachal Pradesh";
    }
    if (state.endsWith(".")) {
      state = state.substring(0, state.length - 1);
    }
    return { state, district, town };
  }

  const name = (t.name || "").toLowerCase();
  const addr1 = (t.address1 || "").toLowerCase();
  const addr2 = (t.address2 || "").toLowerCase();
  const content = (t.content || "").toLowerCase();
  const fullText = `${name} ${addr1} ${addr2} ${content}`;

  const lat = Number(t.latitude);
  const lng = Number(t.longitude);

  // 1. Varanasi / Uttar Pradesh
  if (
    (lat >= 25.0 && lat <= 25.6 && lng >= 82.8 && lng <= 83.3) ||
    fullText.includes("varanasi") ||
    fullText.includes("kashi") ||
    fullText.includes("sarnath") ||
    fullText.includes("uttar pradesh") ||
    fullText.includes("ayodhya") ||
    fullText.includes("vrindavan") ||
    fullText.includes("mathura")
  ) {
    state = "Uttar Pradesh";
    if (fullText.includes("varanasi") || fullText.includes("kashi") || fullText.includes("sarnath")) {
      district = "Varanasi";
    } else if (fullText.includes("ayodhya")) {
      district = "Ayodhya";
    } else if (fullText.includes("vrindavan") || fullText.includes("mathura")) {
      district = "Mathura";
    }
  }
  // 2. Uttarakhand
  else if (
    (lat >= 28.8 && lat <= 31.5 && lng >= 77.8 && lng <= 81.2) ||
    fullText.includes("uttarakhand") ||
    fullText.includes("almora") ||
    fullText.includes("badrinath") ||
    fullText.includes("kedarnath") ||
    fullText.includes("nanakmatta") ||
    fullText.includes("hemkund") ||
    fullText.includes("haridwar") ||
    fullText.includes("rishikesh") ||
    fullText.includes("gangotri") ||
    fullText.includes("yamunotri")
  ) {
    state = "Uttarakhand";
    if (fullText.includes("almora")) district = "Almora";
    else if (fullText.includes("badrinath")) district = "Chamoli";
    else if (fullText.includes("kedarnath")) district = "Rudraprayag";
  }
  // 3. West Bengal
  else if (
    (lat >= 21.5 && lat <= 27.5 && lng >= 85.5 && lng <= 89.9) ||
    fullText.includes("west bengal") ||
    fullText.includes("kolkata") ||
    fullText.includes("birbhum") ||
    fullText.includes("kalighat") ||
    fullText.includes("dakshineswar") ||
    fullText.includes("darjeeling")
  ) {
    state = "West Bengal";
    if (fullText.includes("kolkata") || fullText.includes("kalighat")) district = "Kolkata";
    else if (fullText.includes("birbhum") || fullText.includes("bakreswar")) district = "Birbhum";
  }
  // 4. Andhra Pradesh / Telangana
  else if (
    (lat >= 12.6 && lat <= 19.2 && lng >= 76.7 && lng <= 84.8) || 
    fullText.includes("andhra") || fullText.includes("telangana") ||
    fullText.includes("tirupati") || fullText.includes("godavari") || 
    fullText.includes("lepakshi") || fullText.includes("vijayawada") || 
    fullText.includes("chittoor") || fullText.includes("kadapa") || 
    fullText.includes("amaravati") || fullText.includes("visakhapatnam")
  ) {
    if (fullText.includes("telangana") || fullText.includes("hyderabad") || fullText.includes("warangal")) {
      state = "Telangana";
    } else {
      state = "Andhra Pradesh";
    }
    if (fullText.includes("tirupati") || fullText.includes("chittoor")) district = "Chittoor";
  }
  // 5. Tamil Nadu
  else if (
    (lat >= 8.0 && lat <= 13.5 && lng >= 76.2 && lng <= 80.4) ||
    fullText.includes("tamil nadu") ||
    fullText.includes("madurai") ||
    fullText.includes("thanjavur") ||
    fullText.includes("rameswaram") ||
    fullText.includes("kanchipuram") ||
    fullText.includes("coimbatore") ||
    fullText.includes("chidambaram")
  ) {
    state = "Tamil Nadu";
    if (fullText.includes("madurai")) district = "Madurai";
  }
  // 6. Karnataka
  else if (
    (lat >= 11.5 && lat <= 18.5 && lng >= 74.0 && lng <= 78.5) ||
    fullText.includes("karnataka") ||
    fullText.includes("hampi") ||
    fullText.includes("udupi") ||
    fullText.includes("gokarna") ||
    fullText.includes("mysore") ||
    fullText.includes("bengaluru")
  ) {
    state = "Karnataka";
  }
  // 7. Kerala
  else if (
    (lat >= 8.2 && lat <= 12.8 && lng >= 74.8 && lng <= 77.5) ||
    fullText.includes("kerala") ||
    fullText.includes("sabarimala") ||
    fullText.includes("guruvayur")
  ) {
    state = "Kerala";
  }
  // 8. Gujarat
  else if (
    (lat >= 20.0 && lat <= 24.8 && lng >= 68.0 && lng <= 74.5) ||
    fullText.includes("gujarat") ||
    fullText.includes("dwarka") ||
    fullText.includes("somnath") ||
    fullText.includes("ahmedabad")
  ) {
    state = "Gujarat";
  }
  // 9. Maharashtra
  else if (
    (lat >= 15.5 && lat <= 22.1 && lng >= 72.5 && lng <= 80.9) ||
    fullText.includes("maharashtra") ||
    fullText.includes("shirdi") ||
    fullText.includes("mumbai") ||
    fullText.includes("siddhivinayak") ||
    fullText.includes("pune")
  ) {
    state = "Maharashtra";
  }
  // 10. Odisha
  else if (
    (lat >= 17.8 && lat <= 22.5 && lng >= 81.3 && lng <= 87.5) ||
    fullText.includes("odisha") ||
    fullText.includes("orissa") ||
    fullText.includes("puri") ||
    fullText.includes("konark") ||
    fullText.includes("bhubaneswar")
  ) {
    state = "Odisha";
  }
  // 11. Bihar
  else if (
    (lat >= 24.3 && lat <= 27.5 && lng >= 83.3 && lng <= 88.3) ||
    fullText.includes("bihar") ||
    fullText.includes("patna") ||
    fullText.includes("gaya") ||
    fullText.includes("arrah")
  ) {
    state = "Bihar";
  }
  // 12. Jammu & Kashmir / Ladakh
  else if (
    (lat >= 32.2 && lat <= 36.0 && lng >= 73.0 && lng <= 80.5) ||
    fullText.includes("jammu") ||
    fullText.includes("kashmir") ||
    fullText.includes("katra") ||
    fullText.includes("vaishno devi") ||
    fullText.includes("leh") ||
    fullText.includes("ladakh") ||
    fullText.includes("monastery") ||
    fullText.includes("gompa")
  ) {
    state = "Jammu & Kashmir";
  }
  // 13. Himachal Pradesh
  else if (
    (lat >= 30.0 && lat <= 33.2 && lng >= 75.5 && lng <= 79.0) ||
    fullText.includes("himachal") ||
    fullText.includes("shimla") ||
    fullText.includes("manali") ||
    fullText.includes("dharamshala") ||
    fullText.includes("kangra") ||
    fullText.includes("mandi") ||
    fullText.includes("kullu")
  ) {
    state = "Himachal Pradesh";
  }
  // 14. Madhya Pradesh
  else if (
    (lat >= 21.0 && lat <= 26.9 && lng >= 74.0 && lng <= 82.8) ||
    fullText.includes("madhya pradesh") ||
    fullText.includes("bhopal") ||
    fullText.includes("ujjain") ||
    fullText.includes("khajuraho") ||
    fullText.includes("gwalior") ||
    fullText.includes("indore")
  ) {
    state = "Madhya Pradesh";
  }
  // 15. Punjab
  else if (
    (lat >= 29.5 && lat <= 32.5 && lng >= 73.7 && lng <= 77.0) ||
    fullText.includes("punjab") ||
    fullText.includes("amritsar") ||
    fullText.includes("ludhiana") ||
    fullText.includes("patiala")
  ) {
    state = "Punjab";
  }
  // 16. Rajasthan
  else if (
    (lat >= 23.3 && lat <= 30.2 && lng >= 69.5 && lng <= 78.3) ||
    fullText.includes("rajasthan") ||
    fullText.includes("jaipur") ||
    fullText.includes("udaipur") ||
    fullText.includes("jodhpur") ||
    fullText.includes("pushkar")
  ) {
    state = "Rajasthan";
  }
  // 17. Meghalaya
  else if (fullText.includes("meghalaya") || fullText.includes("shillong") || fullText.includes("jaintia") || fullText.includes("nartiang")) {
    state = "Meghalaya";
  }

  // Fallbacks if we can find state in text
  if (!state) {
    const statesOfIndia = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
      "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
      "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
      "Uttarakhand", "West Bengal"
    ];
    for (const s of statesOfIndia) {
      if (fullText.includes(s.toLowerCase())) {
        state = s;
        break;
      }
    }
  }

  return { state, district, town };
}

// Initialize Wix SDK
let wixClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Wix client with API key strategy
 * For headless CMS data access, use ApiKeyStrategy instead of OAuthStrategy
 * Note: API keys in frontend may cause CORS issues - consider using a backend proxy
 */
export function initializeWixClient(apiKey: string, siteId?: string) {
  if (!wixClient) {
    // Site ID is REQUIRED for Wix API to work (MetaSite not found error without it)
    // However, this causes CORS issues in browser - use backend proxy instead
    const authConfig: any = { apiKey };
    if (siteId) {
      authConfig.siteId = siteId;
    } else {
      console.warn('⚠️ Site ID not provided. API calls may fail with "MetaSite not found" error.');
      console.warn('💡 Solution: Use a backend proxy or provide VITE_WIX_SITE_ID in .env');
    }

    wixClient = createClient({
      modules: { items },
      auth: ApiKeyStrategy(authConfig),
    });
  }
  return wixClient;
}

/**
 * Get Wix client instance
 */
export function getWixClient() {
  if (!wixClient) {
    const apiKey = import.meta.env.VITE_WIX_API_KEY;
    const siteId = import.meta.env.VITE_WIX_SITE_ID;

    if (!apiKey) {
      throw new Error('Wix API Key is not configured. Please set VITE_WIX_API_KEY in your .env file');
    }

    if (!siteId) {
      throw new Error('Wix Site ID is not configured. Please set VITE_WIX_SITE_ID (GUID) in your .env file');
    }

    // Common misconfig: users paste their site URL instead of the metasite GUID
    if (siteId.startsWith('http://') || siteId.startsWith('https://')) {
      throw new Error(
        `VITE_WIX_SITE_ID must be a GUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx), not a URL. Received: ${siteId}`
      );
    }

    wixClient = initializeWixClient(apiKey, siteId);
  }
  return wixClient;
}

/**
 * Collection names in Wix CMS
 * These should match your collection IDs in Wix CMS
 */
export const COLLECTIONS = {
  TEMPLES: 'TempleandToursDB', // Your Wix CMS collection ID
  TOURS: 'PilgrimagePackagesDB', // Your Wix CMS collection ID (note: spaces are preserved)
} as const;

/**
 * Example: Query data items from a collection
 * const dataItemsList = await myWixClient.items.query('PilgrimagePackagesDB').find();
 * console.log('My Data Items:');
 * console.log('Total: ', dataItemsList.items.length);
 * console.log(dataItemsList.items
 *   .map((item) => item.data._id)
 *   .join('\n')
 * );
 */

/**
 * Fetch all temples from Wix CMS
 */
export async function fetchTemples() {
  try {
    // Browsers can't call Wix APIs with ApiKeyStrategy due to CORS.
    // Use the local proxy when enabled.
    if (import.meta.env.VITE_USE_PROXY === 'true') {
      console.log('🔄 Using proxy to fetch temples...');
      const { fetchTemplesFromProxy } = await import('./wixCMSProxy');
      return await fetchTemplesFromProxy();
    }

    console.log('⚠️ Direct Wix API call (may fail due to CORS)...');
    const client = getWixClient();
    let allItems: any[] = [];
    let skipCount = 0;
    const limitCount = 1000;

    while (true) {
      const result = await client.items.query(COLLECTIONS.TEMPLES).limit(limitCount).skip(skipCount).find();
      allItems.push(...result.items);
      
      if (result.items.length < limitCount) {
        break;
      }
      skipCount += limitCount;
    }

    console.log('Temples Data Items:');
    console.log('Total: ', allItems.length);

    return allItems.map((item: any) => {
      // Extract field values from Wix data item structure
      // Wix returns data in item.data object
      const fields = item.data || {};
      const inferred = inferStateAndDistrict({
        name: fields.name,
        address1: fields.address1,
        address2: fields.address2,
        content: fields.content,
        religion: fields.religion,
        latitude: fields.latitude,
        longitude: fields.longitude,
        state: fields.state,
        district: fields.district,
        town: fields.town
      });

      return {
        id: item._id || item.data?._id || Date.now(),
        name: fields.name || '',
        religion: fields.religion || '',
        deity: fields.deity || '',
        deityName: fields.deityName || '',
        otherDeity: fields.otherDeity || '',
        famousFor: fields.famousFor || '',
        district: inferred.district || fields.district || '',
        state: inferred.state || fields.state || '',
        latitude: parseFloat(fields.latitude) || 0,
        longitude: parseFloat(fields.longitude) || 0,
        content: fields.content || '',
        openTime: fields.open_time || '',
        belief: fields.belief || '',
        address1: fields.address1 || '',
        address2: fields.address2 || '',
        town: inferred.town || fields.town || '',
        country: fields.country || '',
        pincode: fields.pincode || '',
        slug: fields.slug || generateSlug(fields.name || ''),
        imageUrl: getWixImageUrl(fields.image_fld) || getWixImageUrl(fields.image) || fields.imageUrl || fields.mainImage?.[0]?.url || '',
        galleryImages: fields.galleryImages || fields.gallery?.map((img: any) => img.url || img) || [],
        videoUrl: fields.videoUrl || '',
      };
    });
  } catch (error) {
    console.error('Error fetching temples from Wix CMS:', error);
    throw error;
  }
}

/**
 * Fetch a single temple by ID or slug
 */
export async function fetchTempleById(idOrSlug: string | number) {
  try {
    // Browsers can't call Wix APIs with ApiKeyStrategy due to CORS.
    // Use the local proxy when enabled.
    if (import.meta.env.VITE_USE_PROXY === 'true') {
      console.log(`🔄 Using proxy to fetch temple: ${idOrSlug}...`);
      const { fetchTempleByIdFromProxy } = await import('./wixCMSProxy');
      return await fetchTempleByIdFromProxy(idOrSlug);
    }

    const client = getWixClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(idOrSlug));
    const isNumeric = !isNaN(Number(idOrSlug));
    const isId = isUUID || isNumeric;

    // Query with filter to find specific item
    const dataItemsList = await client.items
      .query(COLLECTIONS.TEMPLES)
      .eq(isId ? '_id' : 'slug', String(idOrSlug))
      .find();

    if (dataItemsList.items.length === 0) {
      return null;
    }

    const item = dataItemsList.items[0];
    const fields = item.data || {};
    const inferred = inferStateAndDistrict({
      name: fields.name,
      address1: fields.address1,
      address2: fields.address2,
      content: fields.content,
      religion: fields.religion,
      latitude: fields.latitude,
      longitude: fields.longitude,
      state: fields.state,
      district: fields.district,
      town: fields.town
    });

    return {
      id: item._id || item.data?._id || Date.now(),
      name: fields.name || '',
      religion: fields.religion || '',
      deity: fields.deity || '',
      deityName: fields.deityName || '',
      otherDeity: fields.otherDeity || '',
      famousFor: fields.famousFor || '',
      district: inferred.district || fields.district || '',
      state: inferred.state || fields.state || '',
      latitude: parseFloat(fields.latitude) || 0,
      longitude: parseFloat(fields.longitude) || 0,
      content: fields.content || '',
      openTime: fields.open_time || '',
      belief: fields.belief || '',
      address1: fields.address1 || '',
      address2: fields.address2 || '',
      town: inferred.town || fields.town || '',
      country: fields.country || '',
      pincode: fields.pincode || '',
      slug: fields.slug || generateSlug(fields.name || ''),
      imageUrl: getWixImageUrl(fields.image_fld) || getWixImageUrl(fields.image) || fields.imageUrl || fields.mainImage?.[0]?.url || '',
      galleryImages: fields.galleryImages || fields.gallery?.map((img: any) => img.url || img) || [],
      videoUrl: fields.videoUrl || '',
    };
  } catch (error) {
    console.error('Error fetching temple from Wix CMS:', error);
    throw error;
  }
}

/**
 * Fetch all tours/pilgrimage packages from Wix CMS
 */
export async function fetchTours() {
  try {
    // Browsers can't call Wix APIs with ApiKeyStrategy due to CORS.
    // Use the local proxy when enabled.
    if (import.meta.env.VITE_USE_PROXY === 'true') {
      console.log('🔄 Using proxy to fetch tours...');
      const { fetchToursFromProxy } = await import('./wixCMSProxy');
      return await fetchToursFromProxy();
    }

    console.log('⚠️ Direct Wix API call (may fail due to CORS)...');
    const client = getWixClient();
    const collectionId = COLLECTIONS.TOURS;

    console.log('🔍 Fetching tours from Wix CMS...');
    console.log('📦 Collection ID:', collectionId);

    let allItems: any[] = [];
    let skipCount = 0;
    const limitCount = 1000;

    while (true) {
      const result = await client.items.query(collectionId).limit(limitCount).skip(skipCount).find();
      allItems.push(...result.items);
      
      if (result.items.length < limitCount) {
        break;
      }
      skipCount += limitCount;
    }

    console.log('✅ Pilgrimage Packages Data Items:');
    console.log('📊 Total: ', allItems.length);
    console.log('📋 Item IDs:', allItems
      .map((item) => item.data?._id || item._id)
      .join(', ')
    );
    console.log('📝 Item Names:', allItems
      .map((item) => item.data?.name || 'No name')
      .join(', ')
    );
    console.log('🔍 Full Response (Items Array):', allItems);

    return allItems.map((item: any) => {
      const fields = item.data || {};

      return {
        id: item._id || item.data?._id || Date.now(),
        name: fields.name || '',
        slug: fields.slug || generateSlug(fields.name || ''),
        duration: fields.duration || '',
        days: parseInt(fields.days) || 0,
        nights: parseInt(fields.nights) || 0,
        groupSize: fields.groupSize || '',
        rating: parseFloat(fields.rating) || 0,
        description: fields.description || '',
        longDescription: fields.longDescription || fields.description || '',
        templesCount: parseInt(fields.templeCount || fields.templesCount || 0) || 0,
        citiesCovered: Array.isArray(fields.citiesCovered) ? fields.citiesCovered : (fields.citiesCovered ? fields.citiesCovered.split(',').filter(Boolean) : []),
        highlights: Array.isArray(fields.highlights) ? fields.highlights : (fields.highlights ? fields.highlights.split('\n').filter(Boolean) : []),
        inclusions: Array.isArray(fields.inclusions) ? fields.inclusions : (fields.inclusions ? fields.inclusions.split('\n').filter(Boolean) : []),
        itinerary: Array.isArray(fields.itinerary) ? fields.itinerary.map((it: any) => ({
          day: parseInt(it.day) || 0,
          title: it.title || '',
          description: it.description || '',
          temples: Array.isArray(it.temples) ? it.temples : (it.temples ? it.temples.split(',').filter(Boolean) : []),
          cities: Array.isArray(it.cities) ? it.cities : (it.cities ? it.cities.split(',').filter(Boolean) : []),
        })) : [],
        imageUrl: getWixImageUrl(fields.image) || fields.imageUrl || fields.mainImage?.[0]?.url || '',
        galleryImages: fields.galleryImages || fields.gallery?.map((img: any) => img.url || img) || [],
        videoUrl: fields.videoUrl || '',
      };
    });
  } catch (error) {
    console.error('Error fetching tours from Wix CMS:', error);
    throw error;
  }
}

/**
 * Fetch a single tour by ID or slug
 */
export async function fetchTourById(idOrSlug: string | number) {
  try {
    // Browsers can't call Wix APIs with ApiKeyStrategy due to CORS.
    // Use the local proxy when enabled.
    if (import.meta.env.VITE_USE_PROXY === 'true') {
      console.log(`🔄 Using proxy to fetch tour: ${idOrSlug}...`);
      const { fetchTourByIdFromProxy } = await import('./wixCMSProxy');
      return await fetchTourByIdFromProxy(idOrSlug);
    }

    const client = getWixClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(idOrSlug));
    const isNumeric = !isNaN(Number(idOrSlug));
    const isId = isUUID || isNumeric;

    // Query with filter to find specific item
    const dataItemsList = await client.items
      .query(COLLECTIONS.TOURS)
      .eq(isId ? '_id' : 'slug', String(idOrSlug))
      .find();

    if (dataItemsList.items.length === 0) {
      return null;
    }

    const item = dataItemsList.items[0];
    const fields = item.data || {};

    return {
      id: item._id || item.data?._id || Date.now(),
      name: fields.name || '',
      slug: fields.slug || generateSlug(fields.name || ''),
      duration: fields.duration || '',
      days: parseInt(fields.days) || 0,
      nights: parseInt(fields.nights) || 0,
      groupSize: fields.groupSize || '',
      rating: parseFloat(fields.rating) || 0,
      description: fields.description || '',
      longDescription: fields.longDescription || fields.description || '',
      templesCount: parseInt(fields.templeCount || fields.templesCount || 0) || 0,
      citiesCovered: Array.isArray(fields.citiesCovered) ? fields.citiesCovered : (fields.citiesCovered ? fields.citiesCovered.split(',').filter(Boolean) : []),
      highlights: Array.isArray(fields.highlights) ? fields.highlights : (fields.highlights ? fields.highlights.split('\n').filter(Boolean) : []),
      inclusions: Array.isArray(fields.inclusions) ? fields.inclusions : (fields.inclusions ? fields.inclusions.split('\n').filter(Boolean) : []),
      itinerary: Array.isArray(fields.itinerary) ? fields.itinerary.map((it: any) => ({
        day: parseInt(it.day) || 0,
        title: it.title || '',
        description: it.description || '',
        temples: Array.isArray(it.temples) ? it.temples : (it.temples ? it.temples.split(',').filter(Boolean) : []),
        cities: Array.isArray(it.cities) ? it.cities : (it.cities ? it.cities.split(',').filter(Boolean) : []),
      })) : [],
      imageUrl: getWixImageUrl(fields.image) || fields.imageUrl || fields.mainImage?.[0]?.url || '',
      galleryImages: fields.galleryImages || fields.gallery?.map((img: any) => img.url || img) || [],
      videoUrl: fields.videoUrl || '',
    };
  } catch (error) {
    console.error('Error fetching tour from Wix CMS:', error);
    throw error;
  }
}
