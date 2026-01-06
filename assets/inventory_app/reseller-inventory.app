import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  Plus, 
  Trash2, 
  Download, 
  Clock,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Image as ImageIcon,
  Tag,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
  Legend 
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'reseller-cmd-center';

const PLATFORMS = ['eBay', 'Depop', 'Marketplace', 'Poshmark', 'Mercari', 'Other'];
const CATEGORIES = ['Clothing', 'Housewares', 'Electronics', 'Toys', 'Collectibles', 'Other'];

export default function App() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [showExtraFields, setShowExtraFields] = useState(false);

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemPlatform, setNewItemPlatform] = useState('eBay');
  const [newItemCategory, setNewItemCategory] = useState('Clothing');
  const [newItemPhoto, setNewItemPhoto] = useState('');

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const inventoryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inventory');
    const q = query(inventoryRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(items.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemCost || !user) return;

    const inventoryRef = collection(db, 'artifacts', appId, 'users', user.uid, 'inventory');
    await addDoc(inventoryRef, {
      name: newItemName,
      cost: parseFloat(newItemCost),
      platform: newItemPlatform,
      category: newItemCategory,
      photoUrl: newItemPhoto,
      status: '📸 To-Do',
      listPrice: 0,
      soldPrice: 0,
      fees: 0,
      createdAt: Date.now()
    });

    // Reset Form
    setNewItemName('');
    setNewItemCost('');
    setNewItemPhoto('');
    setShowExtraFields(false);
  };

  const updateItem = async (itemId, updates) => {
    if (!user) return;
    const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', itemId);
    await setDoc(itemRef, updates, { merge: true });
  };

  const deleteItem = async (itemId) => {
    if (!user) return;
    const itemRef = doc(db, 'artifacts', appId, 'users', user.uid, 'inventory', itemId);
    await deleteDoc(itemRef);
  };

  const exportCSV = () => {
    const headers = ["Name", "Status", "Category", "Platform", "Cost", "List Price", "Sold Price", "Fees", "Profit", "Date Acquired", "Photo URL"];
    const rows = inventory.map(item => [
      `"${item.name}"`,
      item.status,
      item.category,
      item.platform,
      item.cost,
      item.listPrice || 0,
      item.soldPrice || 0,
      item.fees || 0,
      item.soldPrice ? (item.soldPrice - item.fees - item.cost).toFixed(2) : 0,
      new Date(item.createdAt).toLocaleDateString(),
      `"${item.photoUrl || ''}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reseller_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = useMemo(() => {
    return inventory.reduce((acc, item) => {
      if (item.status === '💰 Sold') {
        const profit = item.soldPrice - item.fees - item.cost;
        acc.totalProfit += profit;
      } else {
        acc.cashTrapped += item.cost;
      }
      return acc;
    }, { totalProfit: 0, cashTrapped: 0 });
  }, [inventory]);

  const chartData = {
    labels: ['Cash Trapped', 'Realized Profit'],
    datasets: [
      {
        data: [stats.cashTrapped, stats.totalProfit],
        backgroundColor: ['#f43f5e', '#10b981'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-200 rounded-full"></div>
          <p className="text-slate-400 font-medium">Syncing with cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Reseller CMD</h1>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        
        {view === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Summary Dashboard */}
            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Net Profit</span>
                </div>
                <p className="text-2xl font-black text-slate-900">${stats.totalProfit.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-rose-500 mb-1">
                  <Package className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Invested</span>
                </div>
                <p className="text-2xl font-black text-slate-900">${stats.cashTrapped.toFixed(2)}</p>
              </div>
            </section>

            {/* Efficiency Chart */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
              <div className="w-24 h-24">
                <Doughnut data={chartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-slate-800 text-sm">Capital Health</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stats.totalProfit > stats.cashTrapped 
                    ? "Excellent! You are playing with house money." 
                    : "Focus on selling existing stock to free up capital."}
                </p>
              </div>
            </section>

            {/* Action: Add Item */}
            <section className="bg-indigo-600 p-6 rounded-3xl shadow-xl text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Quick Log
              </h3>
              <form onSubmit={addItem} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Item name (e.g. Vintage Nike Jacket)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all text-sm"
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3.5 text-white/50">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="Cost Basis"
                      value={newItemCost}
                      onChange={(e) => setNewItemCost(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition-all text-sm"
                    />
                  </div>
                  <button type="submit" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-md text-sm">
                    Log
                  </button>
                </div>

                {/* Extra Fields Toggle */}
                <button 
                  type="button"
                  onClick={() => setShowExtraFields(!showExtraFields)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors mt-2"
                >
                  {showExtraFields ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showExtraFields ? 'Hide Details' : 'Add Platform & Category'}
                </button>

                {showExtraFields && (
                  <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/60 ml-1 uppercase">Platform</label>
                        <select 
                          value={newItemPlatform}
                          onChange={(e) => setNewItemPlatform(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none text-xs"
                        >
                          {PLATFORMS.map(p => <option key={p} value={p} className="text-slate-800">{p}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/60 ml-1 uppercase">Category</label>
                        <select 
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none text-xs"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c} className="text-slate-800">{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/60 ml-1 uppercase">Photo URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="https://..."
                        value={newItemPhoto}
                        onChange={(e) => setNewItemPhoto(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 outline-none text-xs"
                      />
                    </div>
                  </div>
                )}
              </form>
            </section>
          </div>
        )}

        {view === 'list' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-slate-700">Full Inventory</h3>
              <div className="flex gap-2">
                 <button onClick={exportCSV} className="text-indigo-600 bg-white border border-indigo-100 p-2 rounded-lg shadow-sm">
                   <Download className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {inventory.length === 0 && (
              <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-3xl">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No items found.</p>
              </div>
            )}

            {inventory.map(item => (
              <div key={item.id} className={`bg-white p-4 rounded-3xl border transition-all ${item.status === '💰 Sold' ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200 shadow-sm'}`}>
                <div className="flex gap-4">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <button onClick={() => deleteItem(item.id)} className="text-slate-300 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        item.status === '💰 Sold' ? 'bg-emerald-100 text-emerald-700' : 
                        item.status === '⏳ Listed' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1 uppercase">
                        <Share2 className="w-2.5 h-2.5" /> {item.platform || 'General'}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1 uppercase">
                        <Tag className="w-2.5 h-2.5" /> {item.category || 'Misc'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                  {item.status === '📸 To-Do' && (
                    <button 
                      onClick={() => {
                        const lp = prompt("List price?", item.cost * 3);
                        if (lp) updateItem(item.id, { status: '⏳ Listed', listPrice: parseFloat(lp) });
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-xl"
                    >
                      MARK AS LISTED <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  {item.status === '⏳ Listed' && (
                    <button 
                      onClick={() => {
                        const sp = prompt("Final sale price?", item.listPrice);
                        if (sp) {
                          const sold = parseFloat(sp);
                          updateItem(item.id, { 
                            status: '💰 Sold', 
                            soldPrice: sold,
                            fees: sold * 0.13 + 0.30 // eBay standard estimation
                          });
                        }
                      }}
                      className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white text-[10px] font-black rounded-xl shadow-md"
                    >
                      LOG SALE <DollarSign className="w-3 h-3" />
                    </button>
                  )}

                  {item.status === '💰 Sold' && (
                    <div className="col-span-2 flex justify-between items-center px-4 py-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                      <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Net Profit</span>
                      <span className="text-sm font-black text-emerald-600">
                        +${(item.soldPrice - item.fees - item.cost).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {view === 'settings' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4">Export Data</h3>
               <p className="text-xs text-slate-500 mb-6">Download your entire inventory as a CSV file compatible with Excel or Google Sheets for platform imports.</p>
               <button 
                onClick={exportCSV}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
               >
                 <Download className="w-5 h-5" /> Download Inventory CSV
               </button>
             </div>

             <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
               <h3 className="font-bold mb-4 flex items-center gap-2">
                 <Settings className="w-5 h-5 text-indigo-400" /> App Info
               </h3>
               <div className="space-y-4 text-xs text-slate-400">
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                   <span>User ID</span>
                   <span className="font-mono text-indigo-400">{user?.uid.substring(0, 12)}...</span>
                 </div>
                 <div className="flex justify-between border-b border-slate-800 pb-2">
                   <span>Storage</span>
                   <span>Firebase Cloud</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Platform</span>
                   <span>v1.2 "Ready-to-List"</span>
                 </div>
               </div>
             </div>
          </section>
        )}

      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 h-20 px-6 flex justify-around items-center z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => setView('list')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'list' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <Package className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Inventory</span>
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`flex flex-col items-center gap-1.5 transition-all ${view === 'settings' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
        >
          <Settings className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Settings</span>
        </button>
      </nav>
    </div>
  );
}