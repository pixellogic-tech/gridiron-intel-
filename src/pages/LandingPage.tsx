
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, Users, Video, BrainCircuit, PlayCircle, Menu, X, LayoutDashboard, Search, Check, AlertTriangle, CreditCard, Mail, ArrowRight, Lock } from 'lucide-react';

const LandingPage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    
    // Purchase Modal State
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');

    const openVideoModal = (videoId: string) => {
        setCurrentVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
        setIsVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
        setCurrentVideoUrl('');
    };

    const openPurchaseModal = (plan: string, price: string) => {
        setSelectedPlan(plan);
        setSelectedPrice(price);
        setIsPurchaseModalOpen(true);
    };

    const Nav = () => (
        <nav className="fixed top-0 w-full bg-slate-950/90 backdrop-blur-lg z-50 border-b border-slate-800">
            {/* Demo Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white text-xs font-bold py-2 px-4 text-center border-b border-indigo-700/50">
                <span className="inline-flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-400"/>
                    PUBLIC PREVIEW VERSION | Early Access Pricing Ends Soon
                </span>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">🏈 Gridiron Intel</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-slate-300 hover:text-brand-accent transition">Features</a>
                        <a href="#pricing" className="text-slate-300 hover:text-brand-accent transition">Pricing</a>
                        <a href="#highlights" className="text-slate-300 hover:text-brand-accent transition">Highlights</a>
                        <Link to="/login" className="text-slate-300 hover:text-brand-accent transition">Login</Link>
                        <a href="#pricing" className="bg-brand-primary hover:bg-brand-dark px-5 py-2 rounded-lg font-semibold transition text-white">
                            Get Started
                        </a>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                        </button>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden bg-slate-900/90 py-4">
                    <a href="#features" className="block text-center text-slate-300 hover:text-brand-accent transition py-2">Features</a>
                    <a href="#pricing" className="block text-center text-slate-300 hover:text-brand-accent transition py-2">Pricing</a>
                    <a href="#highlights" className="block text-center text-slate-300 hover:text-brand-accent transition py-2">Highlights</a>
                    <Link to="/login" className="block text-center text-slate-300 hover:text-brand-accent transition py-2">Login</Link>
                    <div className="mt-2 px-4">
                    <a href="#pricing" className="block w-full text-center bg-brand-primary hover:bg-brand-dark px-5 py-2 rounded-lg font-semibold transition text-white">
                        Get Started
                    </a>
                    </div>
                </div>
            )}
        </nav>
    );

    const Hero = () => (
        <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden pt-24">
             <div className="absolute inset-0 bg-slate-950 bg-grid-slate-900/[0.4]"></div>
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-slate-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
             <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/20 rounded-full filter blur-3xl opacity-50 animate-[float_8s_ease-in-out_infinite]"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/20 rounded-full filter blur-3xl opacity-50 animate-[float_8s_ease-in-out_infinite_4s]"></div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="inline-block bg-brand-accent/10 border border-brand-accent px-4 py-2 rounded-full mb-6">
                    <span className="text-brand-accent font-semibold text-sm uppercase tracking-wider">The Future of Coaching is Here</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    The Ultimate Football Intelligence Platform
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Leverage AI-powered film analysis, predictive insights, and seamless team management to dominate the competition. Save time, win games.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                     <a href="#pricing" className="w-full sm:w-auto bg-brand-primary hover:bg-brand-dark text-white px-8 py-4 rounded-lg font-bold transition text-lg shadow-lg shadow-brand-primary/25">
                        Unlock Team Access
                    </a>
                    <Link to="/dashboard" className="w-full sm:w-auto border border-slate-700 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-bold transition text-lg flex items-center justify-center gap-2">
                        View Live Demo <ArrowRight size={18}/>
                    </Link>
                </div>
                <p className="mt-6 text-sm text-slate-500">
                    * Full application currently in Beta. Early access pricing available below.
                </p>
            </div>
        </section>
    );

    const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 hover:border-brand-primary transition-all duration-300 group">
            <div className="mb-4 inline-block p-3 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition">
                <Icon className="w-7 h-7 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );

    const Features = () => (
        <section id="features" className="py-24 bg-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">The Coach's AI Advantage</h2>
                    <p className="text-lg text-slate-400">Everything you need to out-prepare and out-perform.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard icon={BrainCircuit} title="AI Film Analysis" description="Automatically tag formations, plays, and player performance from your game film in minutes, not hours." />
                    <FeatureCard icon={LayoutDashboard} title="Team Performance Dashboards" description="Track key team metrics, visualize trends, and identify areas for improvement with comprehensive, easy-to-read dashboards." />
                    <FeatureCard icon={Target} title="Real-Time Opponent Insights" description="Uncover opponent tendencies and get AI-powered play suggestions based on down, distance, and situation." />
                    <FeatureCard icon={Users} title="Personalized Player Portals" description="Centralize communication, assignments, and film review with secure logins for your entire team." />
                    <FeatureCard icon={Search} title="Scouting & Recruitment Analytics" description="Leverage AI to identify potential recruits, analyze their strengths, and build a stronger program for the future." />
                    <FeatureCard icon={Video} title="Auto-Generated Highlights" description="Create professional recruiting reels for any player with one click, ready to be shared with college scouts." />
                </div>
            </div>
        </section>
    );
    
    const HighlightCard = ({ title, teams, videoId, week, onPlay }: { title: string, teams: string, videoId: string, week: string, onPlay: (id: string) => void }) => (
        <div onClick={() => onPlay(videoId)} className="group rounded-xl overflow-hidden relative cursor-pointer border border-slate-800 hover:border-brand-primary transition-all duration-300 aspect-video">
            <img 
                src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
                <PlayCircle className="w-20 h-20 text-white/80 group-hover:text-white transition-all duration-300 transform group-hover:scale-110" />
            </div>
            <div className="absolute top-0 left-0 p-4">
                 <span className="bg-brand-accent/80 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">{week}</span>
            </div>
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-xl font-bold text-white leading-tight">{teams}</h3>
                <p className="text-sm text-slate-300">{title}</p>
            </div>
        </div>
    );

    const Highlights = () => (
         <section id="highlights" className="py-24 bg-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Friday Night Lights: Arkansas</h2>
                    <p className="text-lg text-slate-400">Catch up on the latest action from across the state.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <HighlightCard 
                        title="Week 8 Thriller" 
                        teams="Bentonville vs. Fayetteville" 
                        videoId="Sc-m_N20_44"
                        week="WEEK 8"
                        onPlay={openVideoModal}
                    />
                    <HighlightCard 
                        title="State Title Upset" 
                        teams="Pulaski Academy vs. Greenwood" 
                        videoId="rX7-pY31_yY"
                        week="STATE FINAL"
                        onPlay={openVideoModal}
                    />
                    <HighlightCard 
                        title="Defensive Masterclass" 
                        teams="Bryant vs. Cabot" 
                        videoId="3-Tq2-K8T7k"
                        week="WEEK 10"
                        onPlay={openVideoModal}
                    />
                </div>
                 <div className="text-center mt-12">
                    <Link to="/login" className="text-brand-accent font-semibold hover:underline">
                        ... and more highlights available for logged-in users.
                    </Link>
                </div>
            </div>
        </section>
    );

    const UnlockSection = () => {
        const PricingCard = ({ plan, price, description, features, popular }: { plan: string, price: string, description: string, features: string[], popular?: boolean }) => (
            <div className={`flex flex-col bg-slate-900/50 p-8 rounded-xl border-2 ${popular ? 'border-brand-primary' : 'border-slate-800'} transition-transform duration-300 ${popular ? 'transform md:scale-105 shadow-xl shadow-brand-primary/10' : 'hover:scale-105'}`}>
                {popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary px-4 py-1 rounded-full text-sm font-semibold text-white">Most Popular</span>}
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{plan}</h3>
                    <p className="text-4xl font-bold mb-1">{price}</p>
                    <div className="inline-block bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded mb-3 uppercase tracking-wider">Early Sign-On Bonus</div>
                    <p className="text-slate-400 text-sm">{description}</p>
                </div>
                <ul className="mt-8 space-y-4 flex-grow">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                            <span className="text-slate-300">{feature}</span>
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={() => openPurchaseModal(plan, price)}
                    className={`block w-full text-center mt-8 px-8 py-3 rounded-lg font-bold transition text-lg ${popular ? 'bg-brand-primary hover:bg-brand-dark text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                    Choose {plan}
                </button>
            </div>
        );

        return (
            <section id="pricing" className="py-24 bg-slate-950 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Fair Pricing for Every Program</h2>
                        <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                            Choose the plan that fits your team's budget and ambitions. All plans are billed annually for your entire program.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                        <PricingCard
                            plan="Starter"
                            price="$149"
                            description="For smaller programs getting started with analytics."
                            features={[
                                "Limited AI Film Analysis (2 games/month)",
                                "Team Roster Management",
                                "Core Performance Dashboards",
                                "Basic Player Portals",
                                "Limited Playbook (50 plays)"
                            ]}
                        />
                        <PricingCard
                            plan="Pro"
                            price="$299"
                            description="The complete toolkit to dominate your season."
                            features={[
                                "Everything in Starter, plus:",
                                "Unlimited AI Film Analysis",
                                "AI-Generated Practice Plans",
                                "Advanced Opponent Scouting",
                                "Full Player Portal Access",
                                "Unlimited Playbook"
                            ]}
                            popular
                        />
                        <PricingCard
                            plan="Elite"
                            price="$499"
                            description="The ultimate package for top-tier programs."
                            features={[
                                "Everything in Pro, plus:",
                                "Live In-Game Play Predictor",
                                "Scouting & Recruitment Analytics",
                                "Auto-Generated Highlight Reels",
                                "Priority On-Site & Email Support"
                            ]}
                        />
                    </div>
                     <div className="text-center mt-16">
                        <p className="text-slate-400">Need a custom solution for your district or college? <button onClick={() => openPurchaseModal("Custom Enterprise", "Custom Quote")} className="text-brand-accent font-semibold hover:underline">Contact Sales</button></p>
                    </div>
                </div>
            </section>
        );
    };
    
    const PurchaseModal = () => {
        const [formData, setFormData] = useState({
            name: '',
            email: '',
            team: '',
            phone: '',
            message: ''
        });
        
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        };

        const handleFormSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            
            // Construct Mailto Link
            const subject = `Gridiron Intel Application: ${selectedPlan} Plan`;
            const body = `
New Application for Gridiron Intel

Selected Plan: ${selectedPlan} (${selectedPrice})

--- COACH INFO ---
Name: ${formData.name}
Team/School: ${formData.team}
Email: ${formData.email}
Phone: ${formData.phone}

--- MESSAGE/NOTES ---
${formData.message}

---------------------------
I understand this is a pre-release application.
            `;
            
            const mailtoLink = `mailto:gridiron-intel2025@protonmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Open Mail Client
            window.location.href = mailtoLink;
            
            alert("Opening your email client... Please hit 'Send' to submit your application to our team.");
        };

        if (!isPurchaseModalOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-800/50 rounded-t-2xl">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Lock className="text-brand-primary" size={24}/> Secure Early Access
                            </h2>
                            <p className="text-slate-400 mt-1">Applying for: <span className="text-brand-accent font-bold">{selectedPlan} Plan</span></p>
                        </div>
                        <button onClick={() => setIsPurchaseModalOpen(false)} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-6">
                        {/* Info Alert */}
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6">
                            <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-1">
                                <AlertTriangle size={16} /> Limited Time Offer
                            </h3>
                            <p className="text-sm text-slate-300">
                                The full application is in final beta. Early subscribers lock in the <strong>{selectedPrice}/mo</strong> price for life. Prices will increase upon public v2.0 release.
                            </p>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Coach Name</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-brand-primary outline-none text-white" placeholder="John Doe"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone Number</label>
                                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-brand-primary outline-none text-white" placeholder="(555) 123-4567"/>
                                </div>
                             </div>
                             
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">School / Team Name</label>
                                <input required type="text" name="team" value={formData.team} onChange={handleInputChange} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-brand-primary outline-none text-white" placeholder="West High School"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-brand-primary outline-none text-white" placeholder="coach@school.edu"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Questions / Notes</label>
                                <textarea name="message" value={formData.message} onChange={handleInputChange} rows={2} className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-brand-primary outline-none text-white resize-none" placeholder="Any specific requirements?"/>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-800 mt-4">
                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2"><CreditCard size={18}/> Payment Information</h4>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-sm text-slate-400">
                                    <p className="mb-2">
                                        To secure this early-bird pricing, please submit your application below.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 text-slate-500 text-xs">
                                        <li>We will review your application within <strong>24-48 hours</strong>.</li>
                                        <li>Approved programs will receive a secure invoice via email.</li>
                                        <li>Access credentials will be issued immediately upon payment.</li>
                                    </ul>
                                </div>
                            </div>

                             <button type="submit" className="w-full py-4 bg-brand-primary hover:bg-brand-dark text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-primary/20 transition flex items-center justify-center gap-2 mt-4">
                                <Mail size={20} /> Submit Application
                            </button>
                            <p className="text-xs text-center text-slate-500 mt-2">By clicking submit, you agree to receive account related emails.</p>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const VideoModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean, onClose: () => void, videoUrl: string }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-in-out]" onClick={onClose}>
                <div className="relative w-full max-w-4xl aspect-video p-4" onClick={e => e.stopPropagation()}>
                     <button onClick={onClose} className="absolute -top-2 -right-2 bg-white text-black p-2 rounded-full z-10 hover:bg-slate-300 transition">
                        <X size={24} />
                    </button>
                    <iframe
                        className="w-full h-full rounded-lg shadow-2xl border border-slate-700"
                        src={videoUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        );
    };


    const Footer = () => (
        <footer className="bg-slate-900/50 py-12 text-white border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
                <p>© 2025 Gridiron Intel. The Future of Football is Here.</p>
                 <p className="text-sm mt-2">Contact: (501) 438-9206 | gridiron-intel2025@protonmail.com</p>
                 <p className="text-sm mt-2"><Link to="/admin/login" className="hover:text-brand-accent">Admin Login</Link></p>
            </div>
        </footer>
    );

    return (
        <div className="bg-slate-950">
            <Nav />
            <main>
                <Hero />
                <Features />
                <UnlockSection />
                <Highlights />
            </main>
            <Footer />
            <VideoModal isOpen={isVideoModalOpen} onClose={closeVideoModal} videoUrl={currentVideoUrl} />
            <PurchaseModal />
        </div>
    );
};

export default LandingPage;
