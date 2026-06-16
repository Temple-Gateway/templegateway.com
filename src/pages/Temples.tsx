import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCMSTemples } from "@/hooks/useWixCMS";
import TempleMap from "@/components/TempleMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Filter, X, Sparkles, Compass } from "lucide-react";
import SEO from "@/components/SEO";

// Helper to extract clean tags/categories based on temple details
export const getTempleCategories = (temple: any): string[] => {
  const categories: string[] = [];
  const textToSearch = `${temple.name || ""} ${temple.famousFor || ""} ${temple.content || ""} ${temple.religion || ""}`.toLowerCase();
  
  if (textToSearch.includes("jyotirlinga")) {
    categories.push("Jyotirlinga");
  }
  if (textToSearch.includes("shakti peetha") || textToSearch.includes("shakti peeth") || textToSearch.includes("shakti pitha")) {
    categories.push("Shakti Peetha");
  }
  if (textToSearch.includes("char dham")) {
    categories.push("Char Dham");
  }
  if (textToSearch.includes("unesco")) {
    categories.push("UNESCO Site");
  }
  if (textToSearch.includes("monastery") || textToSearch.includes("stupa")) {
    categories.push("Monastery/Stupa");
  }
  if (textToSearch.includes("gurdwara") || textToSearch.includes("gurudwara")) {
    categories.push("Gurdwara");
  }
  if (textToSearch.includes("ancient") || textToSearch.includes("heritage")) {
    categories.push("Ancient Temple/Heritage");
  }
  if (textToSearch.includes("architectur") || textToSearch.includes("marvel") || textToSearch.includes("sculpt") || textToSearch.includes("carv")) {
    categories.push("Architectural Marvel");
  }
  if (textToSearch.includes("pilgrimag") || textToSearch.includes("pilgrim") || textToSearch.includes("sacred") || textToSearch.includes("holy")) {
    categories.push("Pilgrimage Center");
  }
  
  if (categories.length === 0) {
    categories.push("Other Temple");
  }
  
  return categories;
};

const Temples = () => {
  const { temples } = useCMSTemples(); // ✅ Only Wix CMS

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeity, setSelectedDeity] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemple, setSelectedTemple] = useState<any | null>(null);

  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter options from Wix data
  const deities = useMemo(() => {
    const deitySet = new Set<string>();
    temples.forEach((t: any) => {
      if (t.deity) {
        t.deity.split(",").forEach((d: string) => {
          const cleaned = d.trim();
          if (cleaned) {
            const lowerCleaned = cleaned.toLowerCase();
            if (lowerCleaned !== "god" && lowerCleaned !== "others" && lowerCleaned !== "other") {
              const formatted = cleaned
                .split(/\s+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
              deitySet.add(formatted);
            }
          }
        });
      }
    });
    return Array.from(deitySet).sort();
  }, [temples]);

  const states = useMemo(
    () => [...new Set(temples.map((t: any) => t.state).filter(Boolean))].sort(),
    [temples]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    temples.forEach((t: any) => {
      getTempleCategories(t).forEach(c => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [temples]);

  const filteredTemples = useMemo(() => {
    return temples.filter((temple: any) => {
      const matchesSearch =
        !searchQuery ||
        temple.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.famousFor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.town?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        temple.deity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTempleCategories(temple).some((cat: string) => cat.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDeity =
        selectedDeity === "all" ||
        (temple.deity &&
          temple.deity
            .split(",")
            .map((d: string) => d.trim().toLowerCase())
            .includes(selectedDeity.toLowerCase()));

      const matchesState =
        selectedState === "all" || temple.state === selectedState;

      const matchesCategory =
        selectedCategory === "all" ||
        getTempleCategories(temple).includes(selectedCategory);

      return matchesSearch && matchesDeity && matchesState && matchesCategory;
    });
  }, [temples, searchQuery, selectedDeity, selectedState, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDeity("all");
    setSelectedState("all");
    setSelectedCategory("all");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedDeity !== "all" ||
    selectedState !== "all" ||
    selectedCategory !== "all";

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDeity !== "all") count++;
    if (selectedState !== "all") count++;
    if (selectedCategory !== "all") count++;
    return count;
  }, [selectedDeity, selectedState, selectedCategory]);

  return (
    <Layout>
      <SEO 
        title="Sacred Temples Directory" 
        description="Explore Temple Gateway's directory of Indian Hindu temples. Search and filter through interactive maps to discover heritage sites by state, deity, or spiritual significance."
      />
      {/* Hero Section */}
      <section className="relative h-[350px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#f5f1eb' }}>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <span className="text-secondary font-body text-sm uppercase tracking-widest">
              Temples
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Explore Sacred <span style={{ color: '#c34b22' }}>Temples</span>
            </h1>
            <div className="section-divider" />
            <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover temples across India with detailed information and interactive maps.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 pt-4">
        <div className="container mx-auto px-4">

          {/* Search and Filters Card */}
          <div className="bg-card rounded-2xl p-6 mb-8 shadow-sm border border-border/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search temples by name, location, or significance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-10 h-12 text-base rounded-lg border-muted-foreground/20 bg-transparent transition-all focus-visible:ring-1 focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <Button
                variant={activeFiltersCount > 0 ? "default" : "outline"}
                className={`h-12 px-6 rounded-lg border-muted-foreground/20 flex items-center gap-2 transition-all duration-300 ${
                  activeFiltersCount > 0 
                    ? "bg-primary text-primary-foreground border-transparent shadow-sm" 
                    : "hover:bg-accent"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} /> 
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs font-bold bg-white text-primary rounded-full shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Filters Toggled Section */}
            <div className={`mt-6 ${!showFilters ? "hidden" : ""}`}>
              <hr className="mb-6 border-muted-foreground/10" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-saffron" /> Deity
                  </Label>
                  <Select value={selectedDeity} onValueChange={setSelectedDeity}>
                    <SelectTrigger className="h-12 rounded-lg border-muted-foreground/20 bg-transparent">
                      <SelectValue placeholder="All Deities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Deities</SelectItem>
                      {deities.map((d: string) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> State
                  </Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-12 rounded-lg border-muted-foreground/20 bg-transparent">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((s: string) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Compass size={14} className="text-secondary" /> Significance
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 rounded-lg border-muted-foreground/20 bg-transparent">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((c: string) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary & Clear Button */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* <p className="text-muted-foreground font-body text-sm md:text-base">
              Found <span className="font-semibold text-foreground bg-primary/10 px-2.5 py-0.5 rounded text-sm">{filteredTemples.length}</span> sacred temples matching your search.
            </p> */}
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="h-9 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive self-start sm:self-auto rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <X size={14} /> Clear all filters
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">

            {/* Temple List */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide lg:col-span-7">
              {filteredTemples.length === 0 ? (
                <div className="bg-muted/30 border border-muted-foreground/10 rounded-2xl p-12 text-center">
                  <Compass size={48} className="mx-auto text-muted-foreground/40 mb-4 animate-pulse" />
                  <h3 className="font-bold text-lg text-foreground mb-1">No temples found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Try adjusting your keyword search or changing the filter selections.
                  </p>
                </div>
              ) : (
                filteredTemples.map((temple: any) => (
                  <div
                    key={temple.id}
                    className={`bg-card p-6 rounded-2xl shadow-sm border cursor-pointer flex flex-col relative transition-all duration-300 ease-in-out hover:shadow-md ${selectedTemple?.id === temple.id
                      ? "border-saffron border-2 shadow-md rounded-[1.5rem]"
                      : "border-saffron/20 hover:border-saffron/50 hover:rounded-[2rem]"
                      }`}
                    onClick={() => setSelectedTemple(temple)}
                  >
                    <div className="pr-12">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {temple.deity && (
                          <span className="text-[10px] font-bold text-saffron bg-saffron/10 tracking-widest uppercase px-2 py-1 rounded">
                            {temple.deity}
                          </span>
                        )}
                        {temple.state && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted tracking-widest px-2 py-1 rounded">
                            {temple.state}
                          </span>
                        )}
                        {getTempleCategories(temple).slice(0, 2).map((cat: string) => (
                          <span key={cat} className="text-[10px] font-medium text-primary bg-primary/5 tracking-widest px-2 py-1 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-bold text-lg text-foreground mb-1 leading-tight">{temple.name}</h3>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                        <MapPin size={14} className="text-primary" />
                        <span>{[temple.district, temple.state].filter(Boolean).join(", ")}</span>
                      </div>

                      {temple.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {temple.content}
                        </p>
                      )}

                      {/* View Details always visible natively */}
                      <Link
                        to={`/temple/${temple.slug}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="inline-flex items-center text-primary font-body text-sm hover:underline font-medium">
                          View details →
                        </span>
                      </Link>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Map */}
            <div className="h-[70vh] lg:col-span-5 relative z-0">
              <TempleMap
                temples={filteredTemples}
                selectedTemple={selectedTemple}
                onTempleSelect={setSelectedTemple}
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Temples;