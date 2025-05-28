import React, { useState, useEffect, useRef } from 'react';
import { FaCopy, FaPlus } from 'react-icons/fa';
import { PROMPT_TEMPLATES } from '../constants/promptTemplates';

function PromptTemplates({ onUseTemplate, selectedCategory, onCategoryChange }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const scrollContainerRef = useRef(null);

  // Get unique categories
  const categories = ['All', ...new Set(PROMPT_TEMPLATES.map(template => template.category))];

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'All' 
    ? PROMPT_TEMPLATES 
    : PROMPT_TEMPLATES.filter(template => template.category === selectedCategory);

  // Infinite scroll effect for mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || filteredTemplates.length === 0) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const cardWidth = 280 + 16; // card width + gap
      const setWidth = filteredTemplates.length * cardWidth;
      
      // If scrolled past the first set, reset to beginning of second set
      if (scrollLeft >= setWidth * 2) {
        container.scrollLeft = setWidth;
      }
      // If scrolled before the second set, jump to end of second set
      else if (scrollLeft <= 0) {
        container.scrollLeft = setWidth;
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    // Initialize scroll position to start of second set (middle)
    container.scrollLeft = filteredTemplates.length * (280 + 16);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [filteredTemplates]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredTemplates.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredTemplates.length) % filteredTemplates.length);
  };

  const handleUseTemplate = (template) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    });
  };

  const handleCardMouseEnter = (templateId) => {
    const timer = setTimeout(() => {
      setHoveredCard(templateId);
    }, 400);
    setHoverTimer(timer);
  };

  const handleCardMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
    setHoveredCard(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4 mb-1 font-body">
      {/* Mobile Category Filter */}
      <div className="block sm:hidden">
        <div className="w-full flex items-end justify-end mr-6">
          <label htmlFor="mobile-category-filter" className="text-xs font-bold text-light-secondary mr-2">
            Category:
          </label>
          <select
            id="mobile-category-filter"
            value={selectedCategory}
            onChange={(e) => {
              onCategoryChange(e.target.value);
              setCurrentSlide(0); // Reset to first slide when category changes
            }}
            className="bg-surface text-light text-xs p-2 min-w-[140px] rounded-xl mr-3"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="block sm:hidden flex-1">
        <div className="h-full flex flex-col">
          {filteredTemplates.length > 0 && (
            <div 
              className="flex-1 overflow-x-auto overflow-y-hidden" 
              ref={scrollContainerRef}
              style={{
                scrollBehavior: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="flex gap-4 py-4 pr-4 h-full infinite-scroll-content" style={{ width: `${filteredTemplates.length * 2 * 280}px` }}>
                {/* First set of templates */}
                {filteredTemplates.map((template) => (
                  <div key={`first-${template.id}`} className="w-72 flex-shrink-0 h-full">
                    <div className="bg-surface p-4 h-full flex flex-col rounded-xl border border-light shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-light text-sm mb-1">{template.title}</h4>
                          <span className="bg-secondary text-light-tertiary text-xs px-2 py-1 rounded-xl">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-light text-xs mb-3 line-clamp-3">
                        {template.description}
                      </p>
                      
                      <div className="bg-card border border-light rounded-xl p-3 mb-3 flex-1 max-h-screen overflow-y-auto">
                        <pre className="text-light text-xs whitespace-pre-wrap break-words">
                          {template.prompt.length > 150
                            ? `${template.prompt.substring(0, 150)}...` 
                            : template.prompt}
                        </pre>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <span key={tag} className="tag-new rounded-lg text-xs px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => copyToClipboard(template.prompt)}
                          className="w-full flex items-center justify-center btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaCopy className="mr-2" /> 
                          Copy
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="w-full flex items-center justify-center btn-accent rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaPlus className="mr-2" /> 
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Second set of templates for seamless loop */}
                {filteredTemplates.map((template) => (
                  <div key={`second-${template.id}`} className="w-72 flex-shrink-0 h-full">
                    <div className="bg-surface p-4 h-full flex flex-col rounded-xl border border-light shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-light text-sm mb-1">{template.title}</h4>
                          <span className="bg-secondary text-light-tertiary text-xs px-2 py-1 rounded-xl">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-light text-xs mb-3 line-clamp-3">
                        {template.description}
                      </p>
                      
                      <div className="bg-card border border-light rounded-xl p-3 mb-3 flex-1 flex-grow overflow-y-auto">
                        <pre className="text-light text-xs whitespace-pre-wrap break-words">
                          {template.prompt.length > 150
                            ? `${template.prompt.substring(0, 150)}...` 
                            : template.prompt}
                        </pre>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <span key={tag} className="tag-new rounded-lg text-xs px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => copyToClipboard(template.prompt)}
                          className="w-full flex items-center justify-center btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaCopy className="mr-2" /> 
                          Copy
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="w-full flex items-center justify-center btn-accent rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaPlus className="mr-2" /> 
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Third set of templates for extra buffer */}
                {filteredTemplates.map((template) => (
                  <div key={`third-${template.id}`} className="w-72 flex-shrink-0 h-full">
                    <div className="bg-surface p-4 h-full flex flex-col rounded-xl border border-light shadow-md">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-light text-sm mb-1">{template.title}</h4>
                          <span className="bg-secondary text-light-tertiary text-xs px-2 py-1 rounded-xl">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-light text-xs mb-3 line-clamp-3">
                        {template.description}
                      </p>
                      
                      <div className="bg-card border border-light rounded-xl p-3 mb-3 flex-1 overflow-y-auto">
                        <pre className="text-light text-xs whitespace-pre-wrap break-words">
                          {template.prompt.length > 150 
                            ? `${template.prompt.substring(0, 150)}...` 
                            : template.prompt}
                        </pre>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.tags.map(tag => (
                          <span key={tag} className="tag-new rounded-lg text-xs px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => copyToClipboard(template.prompt)}
                          className="w-full flex items-center justify-center btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaCopy className="mr-2" /> 
                          Copy
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="w-full flex items-center justify-center btn-accent rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                        >
                          <FaPlus className="mr-2" /> 
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden sm:block p-2 pt-8 flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className={`flip-card ${hoveredCard === template.id ? 'flipped' : ''}`}
              onMouseEnter={() => handleCardMouseEnter(template.id)}
              onMouseLeave={handleCardMouseLeave}
              style={{ minHeight: '400px'}}
            >
              <div className="flip-card-inner">
                {/* Front of card - Title only */}
                <div className="flip-card-front">
                  <div className="text-center">
                    <h4 className="font-bold text-light text-3xl mb-2 leading-tight">
                      {template.title}
                    </h4>
                    <div className="flex justify-center items-start mb-1">
                      <span className="tag-new rounded-lg text-xs px-2 py-0.5">
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Back of card - All details */}
                <div className="flip-card-back">
                  <div className="flex justify-center items-start mb-1">
                    <div className="flex-1">
                      <h4 className="font-bold text-light text-left text-base ml-1">{template.title}</h4>
                    </div>
                  </div>
                  
                  <p className="text-light text-xs text-left mb-3 p-1">
                    {template.description}
                  </p>
                  
                  <div 
                    className="bg-card border border-light rounded-xl p-3 mb-3 max-h-56 overflow-y-auto"
                    onWheel={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.scrollTop += e.deltaY;
                    }}
                  >
                    <pre className="text-light text-xs text-left whitespace-pre-wrap break-words">
                      {template.prompt}
                    </pre>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map(tag => (
                      <span key={tag} className="tag-new rounded-lg text-xs px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => copyToClipboard(template.prompt)}
                      className="w-full flex items-center justify-center btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <FaCopy className="mr-2" /> 
                      Copy
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full flex items-center justify-center btn-accent rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                    >
                      <FaPlus className="mr-2" /> 
                      Use
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="cartoon-surface p-8 text-center">
            <p className="cartoon-text">No templates found for the selected category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PromptTemplates; 