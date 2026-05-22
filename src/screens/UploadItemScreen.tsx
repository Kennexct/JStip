import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Camera, 
  ArrowLeft, 
  Check, 
  ChevronRight, 
  DollarSign, 
  Package, 
  Info,
  X,
  Save,
  Share2,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '../lib/supabase';

export function UploadItemScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [publishPrice, setPublishPrice] = useState('');
  const [settings, setSettings] = useState<any>({
    code: 'SGD',
    symbol: 'S$',
    manualRate: 13500,
    realtimeRate: 13050,
    updatedAt: new Date().toISOString()
  });
  const [showShareBanner, setShowShareBanner] = useState(false);
  const [bannerColor, setBannerColor] = useState('bg-white');

  const bannerColors = [
    { name: 'White', class: 'bg-white', text: 'text-slate-900', border: 'border-slate-200' },
    { name: 'Blue', class: 'bg-blue-600', text: 'text-white', border: 'border-blue-400' },
    { name: 'Purple', class: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-400' },
    { name: 'Black', class: 'bg-slate-900', text: 'text-white', border: 'border-slate-700' },
    { name: 'Pink', class: 'bg-rose-500', text: 'text-white', border: 'border-rose-300' },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const loadedSettings = await db.getSettings();
        if (loadedSettings && loadedSettings.currency) {
          setSettings(loadedSettings.currency);
        }

        if (isEdit) {
          const items = await db.getItems();
          const item = items.find((i: any) => i.id === id);
          if (item) {
            setImage(item.image);
            setName(item.name);
            setPrice(item.cost.toString());
            setPublishPrice(item.price.toString());
          }
        }
      } catch (e) {
        console.error('Failed to load edit/settings data:', e);
      }
    }
    loadData();
  }, [id, isEdit]);

  const basePriceIdr = Number(price) * settings.manualRate;
  const margin = Number(publishPrice) - basePriceIdr;
  const marginPercentage = basePriceIdr > 0 ? (margin / basePriceIdr) * 100 : 0;

  const handleCapture = () => {
    setImage('https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop');
    toast.success('Photo captured!');
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !publishPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const itemToSave = {
      id: id || 'item_' + Date.now(),
      name: name.trim(),
      price: Number(publishPrice),
      cost: Number(price),
      currency: settings.code,
      image: image || '',
      status: 'active'
    };

    try {
      await db.saveItem(itemToSave);
      toast.success(isEdit ? 'Changes saved!' : 'Item listed successfully!', {
        description: isEdit ? 'Your product catalog has been updated.' : 'Your item is now visible to matched customers.',
      });
      navigate(-1);
    } catch (e) {
      toast.error('Failed to save item. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b h-16 flex items-center px-4 gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold">{isEdit ? 'Edit Product' : 'List New Item'}</h2>
      </header>

      <div className="p-6 space-y-8">
        {/* Photo Upload Section */}
        <section className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Photo Reference</label>
          {image ? (
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl group">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => setShowShareBanner(true)}
                  className="h-10 w-10 rounded-full bg-primary/80 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110"
                  title="Generate Share Banner"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setImage(null)}
                  className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center transition-transform hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {showShareBanner && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 gap-6"
                >
                  <div className={`${bannerColors.find(c => c.class === bannerColor)?.class || 'bg-white'} rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl relative transition-colors duration-300`}>
                    <div className="relative aspect-square">
                      <img src={image} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12">
                        <div className="space-y-1 text-left">
                          <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Available for Request</p>
                          <h3 className="text-white text-2xl font-black leading-tight uppercase italic">{name || "Your Item"}</h3>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 bg-primary text-white font-black px-4 py-2 rounded-2xl shadow-xl rotate-3">
                        Rp {publishPrice ? Number(publishPrice).toLocaleString() : "0"}
                      </div>
                    </div>
                    <div className={`p-5 ${bannerColors.find(c => c.class === bannerColor)?.text || 'text-slate-900'} flex items-center justify-between`}>
                       <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full border ${bannerColors.find(c => c.class === bannerColor)?.border || 'border-slate-200'} flex items-center justify-center text-xs font-black uppercase italic`}>JF</div>
                          <div className="space-y-0.5">
                            <span className="block text-[10px] font-black uppercase tracking-wider opacity-60">Fulfill via</span>
                            <span className="block text-sm font-black uppercase italic tracking-tighter">JStip Platform</span>
                          </div>
                       </div>
                       <ImageIcon className="h-5 w-5 opacity-30" />
                    </div>
                    <button 
                      onClick={() => setShowShareBanner(false)}
                      className="absolute top-2 left-2 h-8 w-8 rounded-full bg-black/20 text-white/50 hover:bg-black/40 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Color Selector */}
                  <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex gap-2 border border-white/10">
                    {bannerColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setBannerColor(color.class)}
                        className={`h-8 w-8 rounded-xl ${color.class} border-2 transition-transform hover:scale-110 ${bannerColor === color.class ? 'border-primary ring-2 ring-primary/20' : 'border-white/20'}`}
                        title={color.name}
                      />
                    ))}
                  </div>

                  <div className="w-full max-w-sm px-4">
                    <Button variant="secondary" className="w-full h-14 rounded-2xl gap-2 font-black italic text-sm shadow-xl" onClick={() => {
                      toast.success('Banner ready to share!');
                      setShowShareBanner(false);
                    }}>
                      <Save className="h-5 w-5" /> DOWNLOAD FOR STORY
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <button 
              onClick={handleCapture}
              className="w-full aspect-square border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 bg-muted/20 hover:bg-muted/40 transition-colors group"
            >
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Camera className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">Update Product Photo</p>
                <p className="text-xs text-muted-foreground mt-1">Tap to open camera</p>
              </div>
            </button>
          )}
        </section>

        {/* Pricing Information */}
        <section className="space-y-4">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pricing & Currency</label>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-none">Rate: 1 {settings.code} = Rp {settings.manualRate.toLocaleString()}</Badge>
          </div>
          
          <Card className="border-none bg-muted/30 overflow-hidden">
            <CardContent className="p-5 space-y-6">
              {/* Foreign Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Cost Price ({settings.code})</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">{settings.symbol}</div>
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    className="h-14 pl-10 rounded-2xl bg-background border-none text-lg font-bold"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                {basePriceIdr > 0 && (
                  <p className="text-[10px] font-medium text-muted-foreground px-1 uppercase">
                    = Rp {basePriceIdr.toLocaleString()} (Cost Base)
                  </p>
                )}
              </div>

              {/* Publish Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase px-1">Publish Price (IDR)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">Rp</div>
                  <Input 
                    type="number"
                    placeholder="Selling Price to Customer" 
                    className="h-14 pl-10 rounded-2xl bg-background border-2 border-primary/20 text-lg font-bold text-primary focus:border-primary"
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Margin Card */}
              {Number(publishPrice) > 0 && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${margin > 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className="space-y-0.5">
                    <p className={`text-[10px] font-bold uppercase ${margin > 0 ? 'text-green-700' : 'text-red-700'}`}>
                      Expected Gross Margin
                    </p>
                    <p className={`text-xl font-black ${margin > 0 ? 'text-green-900' : 'text-red-900'}`}>
                      Rp {margin.toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${margin > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {marginPercentage > 0 ? '+' : ''}{marginPercentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Product Details */}
        <section className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Product Details</label>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase px-1">Product Name</label>
              <Input 
                placeholder="What are you selling?" 
                className="h-12 rounded-xl bg-muted/30 border-none px-4"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </section>

        <Button 
          className="w-full h-14 rounded-2xl font-bold text-lg gap-3 shadow-xl shadow-primary/20"
          onClick={handleSave}
          disabled={!image || !price || !name}
        >
          {isEdit ? <Save className="h-6 w-6" /> : <Check className="h-6 w-6" />}
          {isEdit ? 'Save Changes' : 'List For Sale'}
        </Button>
      </div>
    </div>
  );
}
