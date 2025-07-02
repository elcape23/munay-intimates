"use client";

import { Fragment, useEffect, useState, FormEvent } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Navbar } from "@/components/common/nav-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RelatedProductsCarousel from "@/components/product/related-products-carousel";
import { useUiStore } from "@/store/ui-store";
import type { ShopifyProduct, FeaturedProduct } from "@/lib/shopify";

export function SearchModal() {
  const { isSearchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopifyProduct[]>([]);
  const [suggestions, setSuggestions] = useState<
    (ShopifyProduct | FeaturedProduct)[]
  >([]);

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
            <Navbar alwaysLight onNavigate={closeSearch} />
            <div className="pt-20 space-y-4">
              <div className="h-[30vh]">
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
              </div>
              {suggestions.length > 0 && (
                <div className="mx-6 items-start">
                  <RelatedProductsCarousel
                    products={suggestions}
                    size="small"
                  />
                </div>
              )}
              <div className="flex justify-center pt-6">
                <Button
                  onClick={closeSearch}
                  aria-label="Cerrar búsqueda"
                  variant="link"
                  size="text"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
