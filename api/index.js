import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { items } from "@wix/data";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ---------------- LOAD ENV ----------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "..", ".env") });

const WIX_API_KEY =
  process.env.WIX_API_KEY || process.env.VITE_WIX_API_KEY;
const WIX_SITE_ID =
  process.env.WIX_SITE_ID || process.env.VITE_WIX_SITE_ID;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

// ---------------- ROOT ROUTE ----------------
app.get("/", (req, res) => {
  res.send("Backend server is running correctly.");
});

// ---------------- WIX CLIENT ----------------

function getWixClient() {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    throw new Error("Missing Wix credentials in .env");
  }

  return createClient({
    modules: { items },
    auth: ApiKeyStrategy({
      apiKey: WIX_API_KEY,
      siteId: WIX_SITE_ID,
    }),
  });
}

// ---------------- WIX IMAGE EXTRACTOR ----------------
function getWixImageUrl(wixUrl) {
  if (!wixUrl) return "";
  if (typeof wixUrl !== "string") return "";
  if (wixUrl.startsWith("http")) return wixUrl;
  if (wixUrl.startsWith("wix:image://v1/")) {
    const parts = wixUrl.split("/");
    if (parts.length >= 4) {
      const uri = parts[3];
      return `https://static.wixstatic.com/media/${uri}`;
    }
  }
  return wixUrl;
}

// ---------------- SLUG GENERATOR ----------------
function generateSlug(name) {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------- STATE & DISTRICT INFERENCE HELPER ----------------

function inferStateAndDistrict(t) {
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

// ---------------- SAFE FIELD EXTRACTOR ----------------

function extractFields(item) {
  return item.data && Object.keys(item.data).length > 0
    ? item.data
    : item;
}

// ---------------- ITINERARY PARSER ----------------

function parseItineraryString(itineraryStr) {
  if (!itineraryStr || typeof itineraryStr !== "string") return [];

  // Split by "Day X" pattern
  const days = itineraryStr.split(/Day\s+(\d+)/i).filter(Boolean);
  const result = [];

  for (let i = 0; i < days.length; i += 2) {
    const dayNum = parseInt(days[i]);
    const content = days[i + 1] || "";
    
    // Attempt to split title and description by the first sentence or newline
    const firstFullStop = content.indexOf('.');
    let title = "";
    let description = "";

    if (firstFullStop !== -1) {
      title = content.substring(0, firstFullStop).trim();
      description = content.substring(firstFullStop + 1).trim();
    } else {
      title = content.trim();
      description = content.trim();
    }

    result.push({
      day: dayNum,
      title: title || `Day ${dayNum}`,
      description: description,
      temples: [], // We can't easily extract this from raw text without NLP
      cities: []
    });
  }

  return result;
}

function mapTourItem(item) {
  const f = extractFields(item);
  
  // 🪵 DIAGNOSTIC: Log what we found
  console.log(`\n📦 Mapping Tour: ${f.name || f.title || f.Name || f.Title || item._id}`);
  console.log(`   Keys present: ${Object.keys(f).slice(0, 10).join(", ")}...`);

  // Robust field selectors
  const itenaryData = f.itenary || f.itinerary || f.Itinerary || f.Itenary || f.itenary_fld;
  const placesData = f.placesCovered || f.places_covered || f.PlacesCovered || f.placesCovered_fld;
  const durationData = f.duration || f.Duration || f.duration_fld;
  const templesData = f.templesCovered || f.temples_covered || f.templesCovered_fld;
  const templeCountData = f.templeCount || f.templesCount || f.templeCount_fld;
  const imageData = f.image || f.image_fld || f.Image || f.Image_fld;
  const inclusionsData = f.inclusionsAndExclusions || f.inclusions_and_exclusions || f.inclusionsAndExclusions_fld;

  const parsedItinerary = parseItineraryString(itenaryData);

  const places = typeof placesData === "string"
    ? placesData.split(",").map((p) => p.trim())
    : (Array.isArray(placesData) ? placesData : []);

  const cities = (Array.isArray(f.citiesCovered) && f.citiesCovered.length > 0)
    ? f.citiesCovered 
    : (f.citiesCovered ? f.citiesCovered.split(',').filter(Boolean) : places);

  const inclusions = (Array.isArray(f.inclusions) && f.inclusions.length > 0)
    ? f.inclusions
    : (inclusionsData ? inclusionsData.split('\n').filter(Boolean).map(i => i.trim()) : []);

  const highlights = (Array.isArray(f.highlights) && f.highlights.length > 0)
    ? f.highlights
    : (f.description ? [f.description.substring(0, 100).trim() + "..."] : []);

  const durationMatch = (durationData || "").match(/(\d+)\s*Days?\s*\/\s*(\d+)\s*Nights?/i);
  const days = durationMatch ? parseInt(durationMatch[1]) : (parseInt(f.days) || 0);
  const nights = durationMatch ? parseInt(durationMatch[2]) : (parseInt(f.nights) || 0);

  const name = f.name || f.title || f.Name || f.Title || "";
  const slug = f.slug || generateSlug(name);

  console.log(`   Result: ${days} Days, ${cities.length} Cities, ${parsedItinerary.length} Itinerary steps`);

  return {
    id: item._id,
    name,
    imageUrl: getWixImageUrl(imageData),
    duration: durationData || "",
    days,
    nights,
    groupSize: f.groupSize || "2-10 People",
    rating: parseFloat(f.rating) || 4.5,
    state: f.state || "",
    zone: f.zone || "",
    description: f.description || "",
    longDescription: f.longDescription || f.description || "",
    placesCovered: places,
    citiesCovered: cities,
    templesCovered: Number(templesData) || 0,
    templesCount: parseInt(templeCountData || templesData) || 0,
    highlights,
    inclusions,
    inclusionsAndExclusions: inclusionsData || "",
    itinerary: parsedItinerary,
    slug
  };
}

// =====================================================
// ================= TEMPLES API =======================
// =====================================================

app.get("/api/temples", async (req, res) => {
  try {
    const client = getWixClient();

    let allItems = [];
    let skipCount = 0;
    const limitCount = 1000;

    while (true) {
      const result = await client.items
        .query("TempleandToursDB")
        .limit(limitCount)
        .skip(skipCount)
        .find();

      allItems.push(...result.items);

      if (result.items.length < limitCount) {
        break;
      }
      skipCount += limitCount;
    }

    const temples = allItems.map((item) => {
      const f = extractFields(item);
      const inferred = inferStateAndDistrict({
        name: f.name,
        address1: f.address1,
        address2: f.address2,
        content: f.content,
        religion: f.religion,
        latitude: f.latitude,
        longitude: f.longitude,
        state: f.state,
        district: f.district,
        town: f.town
      });

      return {
        id: item._id,
        name: f.name ?? "",
        deity: f.deity ?? "",
        deityName: f.deity_name_in_temple ?? "",
        otherDeity: f.other_deity ?? "",
        famousFor: f.famous_for ?? "",
        openTime: f.open_time ?? "",
        belief: f.belief ?? "",
        address1: f.address1 ?? "",
        address2: f.address2 ?? "",
        town: inferred.town || f.town || "",
        district: inferred.district || f.district || "",
        state: inferred.state || f.state || "",
        country: f.country ?? "",
        pincode: f.pincode ?? "",
        latitude: Number(f.latitude) || 0,
        longitude: Number(f.longitude) || 0,
        content: f.content ?? "",
        // Media fields
        imageUrl: getWixImageUrl(f.image_fld), // 🔥 UPDATED TO MATCH WIX FIELD ID "image_fld"
        slug: f.slug || generateSlug(f.name),
      };
    });

    res.json(temples);
  } catch (error) {
    console.error("Temples Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/temples/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const client = getWixClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(idOrSlug));
    const isNumeric = !isNaN(Number(idOrSlug));
    const isId = isUUID || isNumeric;

    const result = await client.items
      .query("TempleandToursDB")
      .eq(isId ? "_id" : "slug", String(idOrSlug))
      .find();

    if (result.items.length === 0) {
      return res.status(404).json({ error: "Temple not found" });
    }

    const item = result.items[0];
    const f = extractFields(item);
    const inferred = inferStateAndDistrict({
      name: f.name,
      address1: f.address1,
      address2: f.address2,
      content: f.content,
      religion: f.religion,
      latitude: f.latitude,
      longitude: f.longitude,
      state: f.state,
      district: f.district,
      town: f.town
    });

    res.json({
      id: item._id,
      name: f.name ?? "",
      deity: f.deity ?? "",
      deityName: f.deity_name_in_temple ?? "",
      otherDeity: f.other_deity ?? "",
      famousFor: f.famous_for ?? "",
      openTime: f.open_time ?? "",
      belief: f.belief ?? "",
      address1: f.address1 ?? "",
      address2: f.address2 ?? "",
      town: inferred.town || f.town || "",
      district: inferred.district || f.district || "",
      state: inferred.state || f.state || "",
      country: f.country ?? "",
      pincode: f.pincode ?? "",
      latitude: Number(f.latitude) || 0,
      longitude: Number(f.longitude) || 0,
      content: f.content ?? "",
      imageUrl: getWixImageUrl(f.image_fld),
      slug: f.slug || generateSlug(f.name),
    });
  } catch (error) {
    console.error("Temple Detail Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ================= TOURS API =========================
// =====================================================

app.get("/api/tours", async (req, res) => {
  try {
    const client = getWixClient();

    let allItems = [];
    let skipCount = 0;
    const limitCount = 1000;

    while (true) {
      const result = await client.items
        .query("PilgrimagePackagesDB")
        .limit(limitCount)
        .skip(skipCount)
        .find();

      allItems.push(...result.items);

      if (result.items.length < limitCount) {
        break;
      }
      skipCount += limitCount;
    }

    const tours = allItems.map(mapTourItem);
    res.json(tours);
  } catch (error) {
    console.error("Tours Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/tours/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const client = getWixClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(idOrSlug));
    const isNumeric = !isNaN(Number(idOrSlug));
    const isId = isUUID || isNumeric;

    const result = await client.items
      .query("PilgrimagePackagesDB")
      .eq(isId ? "_id" : "slug", String(idOrSlug))
      .find();

    if (result.items.length === 0) {
      return res.status(404).json({ error: "Tour not found" });
    }

    const item = result.items[0];
    res.json(mapTourItem(item));
  } catch (error) {
    console.error("Tour Detail Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- SITEMAP & ROBOTS ----------------

app.get("/api/sitemap.xml", async (req, res) => {
  try {
    const client = getWixClient();
    
    // Fetch temples
    let temples = [];
    try {
      let allItems = [];
      let skipCount = 0;
      const limitCount = 1000;
      while (true) {
        const result = await client.items
          .query("TempleandToursDB")
          .limit(limitCount)
          .skip(skipCount)
          .find();
        allItems.push(...result.items);
        if (result.items.length < limitCount) break;
        skipCount += limitCount;
      }
      temples = allItems.map(item => {
        const f = extractFields(item);
        return {
          slug: f.slug || generateSlug(f.name),
          updatedAt: item._updatedDate ?? item.metadata?.updatedDate ?? new Date().toISOString()
        };
      });
    } catch (e) {
      console.error("Sitemap: failed to fetch temples", e);
    }

    // Fetch tours
    let tours = [];
    try {
      let allItems = [];
      let skipCount = 0;
      const limitCount = 1000;
      while (true) {
        const result = await client.items
          .query("PilgrimagePackagesDB")
          .limit(limitCount)
          .skip(skipCount)
          .find();
        allItems.push(...result.items);
        if (result.items.length < limitCount) break;
        skipCount += limitCount;
      }
      tours = allItems.map(item => {
        const f = extractFields(item);
        const name = f.name || f.title || f.Name || f.Title || "";
        const slug = f.slug || generateSlug(name);
        return {
          slug,
          updatedAt: item._updatedDate ?? item.metadata?.updatedDate ?? new Date().toISOString()
        };
      });
    } catch (e) {
      console.error("Sitemap: failed to fetch tours", e);
    }

    // Build XML sitemap
    const baseUrl = "https://www.templegateway.com";
    const staticRoutes = [
      "",
      "/temples",
      "/pilgrimage",
      "/about",
      "/contact"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const today = new Date().toISOString().split("T")[0];
    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${route}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${route === "" ? "1.0" : "0.8"}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Temple dynamic pages
    temples.forEach(temple => {
      if (temple.slug) {
        const lastmod = new Date(temple.updatedAt).toISOString().split("T")[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/temple/${temple.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    // Tour dynamic pages
    tours.forEach(tour => {
      if (tour.slug) {
        const lastmod = new Date(tour.updatedAt).toISOString().split("T")[0];
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/tour/${tour.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

app.get("/api/robots.txt", (req, res) => {
  res.header("Content-Type", "text/plain");
  res.status(200).send(
    `User-agent: *\nDisallow:\n\nSitemap: https://www.templegateway.com/sitemap.xml`
  );
});

// ---------------- START SERVER ----------------

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`\n✅ Backend running at http://localhost:${PORT}`);
  });
}

export default app;