import React, { useState } from 'react';
import { 
  Bookmark, Link2, Film, Image as ImageIcon, Plus, 
  ExternalLink, Trash2, Pin, Tag, Search, Eye, Sparkles, Play
} from 'lucide-react';
import { SavedResource, ResourceType } from '../types';

interface ResourceVaultViewProps {
  resources: SavedResource[];
  onAddResource: (resource: Omit<SavedResource, 'id' | 'createdAt'>) => void;
  onUpdateResource: (id: string, updates: Partial<SavedResource>) => void;
  onDeleteResource: (id: string) => void;
}

export const ResourceVaultView: React.FC<ResourceVaultViewProps> = ({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'link' | 'video' | 'photo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<SavedResource | null>(null);

  // Form State
  const [type, setType] = useState<ResourceType>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [subject, setSubject] = useState('General');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('Study, Placement, Docs');

  const categories = ['All', 'System Design', 'Core Computer Science', 'Database Systems', 'Aptitude & Math', 'Code Snippets'];

  const filteredResources = resources.filter((res) => {
    const matchesFilter = activeFilter === 'all' || res.type === activeFilter;
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesQuery = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesCategory && matchesQuery;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const parsedTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    let defaultThumb = thumbnailUrl;
    if (!defaultThumb) {
      if (type === 'video') {
        defaultThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80';
      } else if (type === 'photo') {
        defaultThumb = url;
      } else {
        defaultThumb = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80';
      }
    }

    onAddResource({
      type,
      title,
      url,
      thumbnailUrl: defaultThumb,
      category,
      subject,
      description,
      tags: parsedTags,
      isPinned: false,
      videoDuration: type === 'video' ? '15:00' : undefined
    });

    setTitle('');
    setUrl('');
    setThumbnailUrl('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Saved Media & Resource Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Save web links, educational video lectures, and handwritten photo notes in one place.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Save New Resource</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Type Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>All ({resources.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('link')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'link'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Links ({resources.filter((r) => r.type === 'link').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'video'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos ({resources.filter((r) => r.type === 'video').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('photo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'photo'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos & Diagrams ({resources.filter((r) => r.type === 'photo').length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved resources..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pr-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all overflow-hidden"
          >
            {/* Thumbnail Preview Area */}
            <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={res.thumbnailUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80'}
                alt={res.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Type Badge */}
              <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-xs flex items-center gap-1 ${
                res.type === 'video' ? 'bg-rose-600' : res.type === 'photo' ? 'bg-emerald-600' : 'bg-sky-600'
              }`}>
                {res.type === 'video' && <Film className="w-3 h-3" />}
                {res.type === 'photo' && <ImageIcon className="w-3 h-3" />}
                {res.type === 'link' && <Link2 className="w-3 h-3" />}
                <span>{res.type}</span>
              </span>

              {/* Pin Button */}
              <button
                onClick={() => onUpdateResource(res.id, { isPinned: !res.isPinned })}
                className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-colors ${
                  res.isPinned ? 'bg-amber-500 text-white' : 'bg-slate-900/40 text-slate-200 hover:bg-slate-900/70'
                }`}
                title={res.isPinned ? 'Unpin resource' : 'Pin to top'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>

              {/* Video Play Overlay if Video */}
              {res.type === 'video' && (
                <button
                  onClick={() => setPreviewMedia(res)}
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/30 group-hover:bg-slate-950/50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </button>
              )}

              {/* Photo Zoom Overlay if Photo */}
              {res.type === 'photo' && (
                <button
                  onClick={() => setPreviewMedia(res)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/60 text-white hover:bg-slate-900 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Card Content Body */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  {res.category}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mt-0.5 leading-snug">
                  {res.title}
                </h3>
                {res.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {res.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => onDeleteResource(res.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete resource"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No resources found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or save a new web link, video lecture, or study diagram.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Add First Resource
          </button>
        </div>
      )}

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-600" />
              Save New Link, Video or Photo
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              {/* Select Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('link')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'link' ? 'bg-sky-50 dark:bg-sky-950 border-sky-500 text-sky-700 dark:text-sky-300' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Web Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('video')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'video' ? 'bg-rose-50 dark:bg-rose-950 border-rose-500 text-rose-700 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Video Lecture</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('photo')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      type === 'photo' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-600'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo / Diagram</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., System Design Microservices Architecture"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'photo' ? 'Upload Image File or Enter URL' : 'Resource Web URL'}
                </label>

                {/* Local File Upload Picker for Photos/Diagrams */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={type === 'photo' ? 'https://... or select image file below' : 'https://...'}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Upload Local Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                setUrl(result);
                                setThumbnailUrl(result);
                                setType('photo');
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">PNG, JPG, WEBP, SVG supported</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="System Design">System Design</option>
                    <option value="Core Computer Science">Core Computer Science</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Aptitude & Math">Aptitude & Math</option>
                    <option value="Code Snippets">Code Snippets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Thumbnail Preview URL</label>
                  <input
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Optional image URL"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description / Key Learnings</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts, takeaways or code snippets..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="OS, LeetCode, Placement"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Modal Viewer */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {previewMedia.type === 'video' ? <Film className="w-5 h-5 text-rose-500" /> : <ImageIcon className="w-5 h-5 text-emerald-500" />}
                {previewMedia.title}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              {previewMedia.type === 'video' ? (
                <iframe
                  src="https://www.youtube-nocookie.com/embed/gT8U7J182sU?autoplay=1"
                  title={previewMedia.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={previewMedia.url || previewMedia.thumbnailUrl}
                  alt={previewMedia.title}
                  className="max-h-full object-contain"
                />
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {previewMedia.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
