import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";

export const Footer: React.FC = () => (
  <footer className="py-2 px-6 bg-background-primary-default">
    <div className="max-w-screen-xl mx-auto flex flex-col items-start space-y-6">
      {/* Social Icons */}
      <div className="flex space-x-1">
        <Link
          href="https://www.instagram.com/munay.intimates"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faInstagram}
            className="w-8 h-8 p-[2px] text-icon-primary-default hover:text-gray-900 cursor-pointer"
          />
        </Link>
        <Link
          href="https://www.facebook.com/profile.php?id=100076144491601"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faFacebook}
            className="w-8 h-8 p-[2px] text-icon-primary-default hover:text-gray-900 cursor-pointer"
          />
        </Link>
        <Link
          href="https://wa.me/5493813638914"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon
            icon={faWhatsapp}
            className="w-8 h-8 p-[2px] text-icon-primary-default hover:text-gray-900 cursor-pointer"
          />
        </Link>
      </div>

      {/* Links */}
      <div className="flex flex-col items-start space-y-2">
        <Link
          href="/terminos"
          className="body-02-regular text-text-secondary-default underline hover:underline"
        >
          Términos &amp; Condiciones
        </Link>
        <Link
          href="/politica"
          className="body-02-regular text-text-secondary-default underline hover:underline"
        >
          Política de privacidad &amp; Cookies
        </Link>
      </div>

      {/* Copyright */}
      <p className="body-03-regular text-text-secondary-default">
        Argentina © 2025 Todos los derechos reservados
      </p>
    </div>
  </footer>
);
