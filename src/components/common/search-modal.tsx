"use client";

import { Fragment, useEffect, useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import { Navbar } from "@/components/common/nav-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RelatedProductsCarousel from "@/components/product/related-products-carousel";
import { useUiStore } from "@/store/ui-store";
import type { ShopifyProduct, FeaturedProduct } from "@/lib/shopify";

export function SearchModal() {
  const { isSearchOpen, closeSearch, openMenu } = useUiStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [suggestions, setSuggestions] = useState<
    (ShopifyProduct | FeaturedProduct)[]
  >([]);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handler = setTimeout(async () => {
      try {
        if (!query) {
          const res = await fetch("/api/search");
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
          setResults([]);
          return;
        }
        if (query.length < 3) {
          setResults([]);
          return;
        }
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch {
        // ignore errors
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query, isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setShowInput(false);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (suggestions.length > 0) {
      const timer = setTimeout(() => setShowInput(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen, suggestions]);

  useEffect(() => {
    if (isSearchOpen) {
      setResults([]);
      setQuery("");
      (async () => {
        try {
          const res = await fetch("/api/search");
          const data = await res.json();
          setSuggestions(data.suggestions ?? []);
        } catch {
          // ignore errors
        }
      })();
    }
  }, [isSearchOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (query.length < 3) {
      setResults([]);
      setSuggestions([]);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results ?? []);
    if (data.suggestions) {
      setSuggestions(data.suggestions);
    }
  };

  return (
    <Transition show={isSearchOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[70]" onClose={closeSearch}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel className="fixed inset-0 w-screen bg-background-primary-default flex flex-col overflow-y-auto ">
            <Navbar
              alwaysLight
              searchMode
              onNavigate={() => {
                closeSearch();
                openMenu();
              }}
            />
            <div className="pt-20 space-y-4">
              <AnimatePresence>
                {showInput && (
                  <motion.div
                    key="searchInput"
                    className="h-[30vh]"
                    initial={{ opacity: 0, filter: "blur(8px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(8px)" }}
                    transition={{ duration: 0.5 }}
                  >
                    <form onSubmit={handleSubmit} className="flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Que estás buscando?"
                        value={query}
                        className="text-center mx-6"
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </form>
                    <div className="w-full space-y-2 text-center mt-2">
                      {results.map((p) => (
                        <a
                          key={p.id}
                          href={`/products/${p.handle}`}
                          onClick={closeSearch}
                          className="block py-1"
                        >
                          {p.title}
                        </a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mx-6 items-start pb-12"
                  >
                    <RelatedProductsCarousel
                      products={suggestions}
                      size="small"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
