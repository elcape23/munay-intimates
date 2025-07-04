"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  HeartIcon as HeartIconOutline,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useUiStore } from "@/store/ui-store";
import { useNavigationStore } from "@/store/navigation-store";
import { Button } from "@/components/ui/button";

const SEASONS = [
  { label: "INVIERNO", slug: "invierno" },
  { label: "VERANO", slug: "verano" },
  {
    label: "PRIMAVERA",
    slug: "primavera",
    className: "heading-01-regular text-text-secondary-default",
  },
];

export function SideMenu() {
  /* estados globales */
  const { isMenuOpen, closeMenu, openSearch } = useUiStore();
  const { menuItems } = useNavigationStore();

  /* tabs */
  const [tab, setTab] = useState<"categories" | "new" | "collections">(
    "categories"
  );

  /* separar ítems según section */
  const categories = menuItems;
  const newProducts = menuItems.filter((i) => i.section === "new");
  const collections = menuItems.filter((i) => i.section === "collections");

  /* helper para renderizar la lista */
  const renderList = (items: typeof menuItems) => (
    <ul className="space-y-3 mt-6">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.url}
            onClick={closeMenu}
            className={`flex items-topline uppercase body-01-regular tracking-wide hover:text-brand-primary ${
              item.id === "special-prices"
                ? "text-text-danger-default"
                : "text-text-secondary-default"
            }`}
          >
            {item.title}
            {item.isNew && (
              <span
                className={`body-03-regular ml-[2px] ${
                  item.id === "special-prices" ? "text-text-danger-default" : ""
                }`}
              >
                NEW
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <Transition show={isMenuOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[60] lg:hidden"
        onClose={closeMenu}
      >
        {/* --- Overlay --- */}
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

        {/* --- Panel --- */}
        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <Dialog.Panel className="fixed inset-y-0 px-6 pb-[52px] left-0 w-[90%] max-w-full bg-background-primary-default flex flex-col h-full gap-10 z-[60]">
            {/* Header */}
            <div className="flex items-center justify-between py-3">
              <Link href="/" onClick={closeMenu} aria-label="Inicio">
                <img
                  src="/munay-wordmark.svg"
                  alt="Logo Munay"
                  className="h-[30px] w-auto"
                />
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  aria-label="Buscar"
                  onClick={() => {
                    closeMenu();
                    openSearch();
                  }}
                  className="hover:text-brand-primary"
                  variant="ghost"
                  size="icon"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </Button>
                <Button
                  aria-label="Cerrar menú"
                  onClick={closeMenu}
                  className="hover:text-brand-primary"
                  variant="ghost"
                  size="icon"
                >
                  <XMarkIcon className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="">
              {/* Tabs */}
              <div className="flex justify-between py-2 px-2 space-x-6">
                {(["categories", "new", "collections"] as const).map((t) => (
                  <Button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`pb-[0px] tracking-wide transition-colors ${
                      tab === t
                        ? "body-02-semibold text-text-primary-default border-b-[2px] border-border-primary-default"
                        : "body-02-regular text-text-secondary-default hover:text-brand-primary"
                    }`}
                    variant="ghost"
                    size="text"
                  >
                    {t === "categories"
                      ? "CATEGORIAS"
                      : t === "new"
                      ? "NEW"
                      : "COLECCIONES"}
                  </Button>
                ))}
              </div>

              {/* Listas */}

              <div className="flex-1 overflow-y-auto px-2 no-scrollbar">
                {tab === "categories" && (
                  <ul className="space-y-3 mt-6">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.url}
                          onClick={closeMenu}
                          className={`flex items-topline uppercase body-01-regular tracking-wide hover:text-brand-primary ${
                            item.id === "special-prices"
                              ? "text-text-danger-default"
                              : "text-text-secondary-default"
                          }`}
                        >
                          <span className="body-01-regular">{item.title}</span>
                          {item.isNew && (
                            <span
                              className={`body-03-regular ml-[2px] ${
                                item.id === "special-prices"
                                  ? "text-text-danger-default"
                                  : "text-text-secondary-default"
                              }`}
                            >
                              NEW
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "new" && renderList(newProducts)}
                {tab === "collections" && (
                  <ul className="space-y-3 mt-6">
                    {SEASONS.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/season/${s.slug}`}
                          onClick={closeMenu}
                          className="flex items-center justify-between uppercase text-secondary-default tracking-wide hover:text-brand-primary"
                        >
                          <span className="body-01-regular text-text-secondary-default">
                            {s.label}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto">
              <ul className="justify-around gap-10 text-text-primary-default body-02-regular">
                <li className="py-2">
                  <Link
                    className="flex items-center gap-1 body-02-semibold"
                    href="/account"
                    onClick={closeMenu}
                    aria-label="Perfil"
                  >
                    <UserCircleIcon className="h-5 w-5" /> PERFIL
                  </Link>
                </li>
                <li className="py-2">
                  <Link
                    className="flex items-center gap-1 body-02-semibold"
                    href="/favorites"
                    onClick={closeMenu}
                    aria-label="Favoritos"
                  >
                    <HeartIconOutline className="h-5 w-5" /> FAVORITOS
                  </Link>
                </li>
                <li className="py-2">
                  <Link
                    className="flex items-center gap-1 body-02-semibold"
                    href="/cart"
                    onClick={closeMenu}
                    aria-label="Carrito"
                  >
                    <ShoppingBagIcon className="h-5 w-5" /> CARRITO
                  </Link>
                </li>
              </ul>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
