import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
    MapPin,
    ArrowLeft,
    Info,
    Clock,
    BookOpen,
    Sunrise,
    Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useCMSTemple } from "@/hooks/useWixCMS";
import SEO from "@/components/SEO";

const TempleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { temple, isLoading } = useCMSTemple(id || "");

    useEffect(() => {
        if (temple && id === String(temple.id)) {
            // Redirect from UUID URL to Slug URL
            navigate(`/temple/${temple.slug}`, { replace: true });
        }
    }, [temple, id, navigate]);

    const fallbackTitle = id
        ? id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
        : "Temple Details";

    if (isLoading) {
        return (
            <Layout>
                <SEO 
                    title={fallbackTitle} 
                    description={`Discover the spiritual significance, history, and timings of ${fallbackTitle}.`} 
                    canonicalUrl={`https://www.templegateway.com/temple/${id}`}
                />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto" />
                        <h1 className="font-display text-2xl font-bold text-foreground">Loading shrine details...</h1>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!temple) {
        return (
            <Layout>
                <SEO 
                    title="Temple Not Found" 
                    description="The temple you're looking for doesn't exist." 
                    noindex={true}
                />
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="font-display text-4xl font-bold text-foreground">Temple Not Found</h1>
                        <p className="text-lg text-muted-foreground">The temple you're looking for doesn't exist.</p>
                        <Button asChild className="mt-4 shadow-sm">
                            <Link to="/temples">Back to Temples</Link>
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO 
                title={temple.name} 
                description={temple.famousFor || `Discover the spiritual significance, history, and timings of ${temple.name}.`} 
                ogImage={temple.imageUrl || undefined}
                canonicalUrl={`https://www.templegateway.com/temple/${temple.slug}`}
            />
            {/* Hero Section */}
            <section
                className={`relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-cover bg-center ${!temple.imageUrl ? 'bg-gradient-hero' : ''}`}
                style={temple.imageUrl ? { backgroundImage: `url(${temple.imageUrl})` } : {}}
            >
                {/* Overlay */}
                <div className={`absolute inset-0 ${temple.imageUrl ? 'bg-black/60 md:bg-black/50' : 'opacity-10'}`}>
                    {!temple.imageUrl && (
                        <>
                            <div className="absolute top-10 left-10 w-40 h-40 border border-primary-foreground/50 rounded-full" />
                            <div className="absolute bottom-10 right-10 w-60 h-60 border border-primary-foreground/50 rounded-full" />
                        </>
                    )}
                </div>

                <div className="container mx-auto px-4 relative z-10 text-white">
                    <Link
                        to="/temples"
                        className={`inline-flex items-center gap-2 mb-8 transition-colors ${temple.imageUrl ? 'text-white/80 hover:text-white drop-shadow-md' : 'text-primary-foreground/80 hover:text-primary-foreground'}`}
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium text-sm tracking-wide uppercase">Back to Temples</span>
                    </Link>

                    <div className="max-w-4xl">
                        <div className="flex flex-wrap gap-2 mb-5">
                            {temple.deity && (
                                <Badge className="bg-saffron text-saffron-foreground border-none px-3 py-1 shadow-sm">
                                    {temple.deity}
                                </Badge>
                            )}
                            {temple.state && (
                                <Badge className="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-md px-3 py-1">
                                    {temple.state}
                                </Badge>
                            )}
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
                            {temple.name}
                        </h1>

                        {temple.famousFor && (
                            <p className="font-body text-xl md:text-2xl text-white/95 mb-8 drop-shadow max-w-2xl leading-relaxed">
                                {temple.famousFor}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2.5 bg-black/40 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg">
                                <MapPin size={18} className="text-saffron-light" />
                                <span className="font-body font-medium text-white">
                                    {[temple.district, temple.state, temple.country].filter(Boolean).join(", ")}
                                </span>
                            </div>

                            {temple.openTime && (
                                <div className="flex items-center gap-2.5 bg-black/40 border border-white/10 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg">
                                    <Clock size={18} className="text-saffron-light" />
                                    <span className="font-body font-medium text-white text-sm">
                                        {temple.openTime}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="py-12 bg-background pb-24">
                <div className="container mx-auto px-4 lg:-mt-10 relative z-20">
                    <div className="grid lg:grid-cols-3 gap-8 items-start">

                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/50">
                                <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2.5 pb-4 border-b border-border/50">
                                    <Info className="text-saffron pb-1" size={26} /> About the Temple
                                </h2>
                                <div className="prose prose-lg dark:prose-invert max-w-none font-body text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                                    {temple.content || "Detailed description is currently unavailable for this temple."}
                                </div>
                            </div>

                            {temple.belief && (
                                <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border/50">
                                    <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2.5 pb-4 border-b border-border/50">
                                        <BookOpen className="text-saffron pb-1" size={26} /> Significance & Beliefs
                                    </h2>
                                    <p className="font-body text-lg text-muted-foreground leading-relaxed whitespace-pre-line text-justify">
                                        {temple.belief}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 lg:sticky lg:top-24">
                            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                                <h3 className="font-display text-xl font-bold text-foreground mb-6 pb-4 border-b border-border/50">Key Information</h3>
                                <div className="space-y-5">

                                    {(temple.deityName || temple.deity) && (
                                        <div className="flex items-start gap-3.5">
                                            <Sunrise className="w-5 h-5 text-saffron mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Main Deity</span>
                                                <span className="font-body font-medium text-foreground">{temple.deityName || temple.deity}</span>
                                            </div>
                                        </div>
                                    )}

                                    {temple.otherDeity && (
                                        <div className="flex items-start gap-3.5">
                                            <Sunrise className="w-5 h-5 text-saffron/60 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Other Deities</span>
                                                <span className="font-body text-foreground">{temple.otherDeity}</span>
                                            </div>
                                        </div>
                                    )}

                                    {temple.openTime && (
                                        <div className="flex items-start gap-3.5">
                                            <Clock className="w-5 h-5 text-saffron mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Timings</span>
                                                <span className="font-body text-foreground">{temple.openTime}</span>
                                            </div>
                                        </div>
                                    )}

                                    {(temple.address1 || temple.town || temple.district || temple.state) && (
                                        <div className="flex items-start gap-3.5">
                                            <Navigation className="w-5 h-5 text-saffron mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Address</span>
                                                <span className="font-body text-foreground block leading-snug">
                                                    {[temple.address1, temple.address2, temple.town, temple.district, temple.state, temple.pincode].filter(Boolean).join(", ")}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {temple.latitude && temple.longitude && (
                                        <div className="flex items-start gap-3.5 mt-2">
                                            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Coordinates</span>
                                                <span className="font-mono text-sm text-foreground">{temple.latitude.toFixed(4)}°N, {temple.longitude.toFixed(4)}°E</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-saffron/10 to-transparent p-6 rounded-2xl border border-saffron/20 text-center">
                                <h3 className="font-display text-xl font-bold text-foreground mb-2">Plan a Pilgrimage</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Book a complete package taking you through divine destinations including this glorious temple.</p>
                                <Button asChild size="lg" className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90 shadow-md">
                                    <Link to="/pilgrimage">Explore Packages</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default TempleDetail;

