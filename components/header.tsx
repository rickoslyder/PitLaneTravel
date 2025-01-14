/*
<ai_context>
This client component provides the header for the app.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs"
import { Menu, Rocket, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ThemeSwitcher } from "./utilities/theme-switcher"
import PitLaneTravelLogo from "@/logos/PitLaneTravelLogo"
import router from "next/router"

const navLinks = [
  { href: "/races", label: "Races" },
  { href: "/flights", label: "Flights" },
  { href: "/packages", label: "Packages" },
  // { href: "/meetups", label: "Meetups" },
  // { href: "/experiences", label: "Experiences" },
  { href: "/about", label: "About Us" }
]

const signedInLinks = [
  { href: "/trips", label: "My Trips" }
  // { href: "/bookings", label: "My Bookings" },
  // { href: "/wishlist", label: "Wishlist" }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors ${
        isScrolled
          ? "bg-background/80 shadow-sm backdrop-blur-sm"
          : "bg-background"
      }`}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between p-2 sm:p-4">
        <div className="flex items-center space-x-2 hover:cursor-pointer hover:opacity-80">
          <Link href="/" className="text-xl font-bold">
            <PitLaneTravelLogo
              className="h-[32px] max-h-[40px] sm:h-[4vh]"
              onClick={() => router.push("/")}
            />
          </Link>
        </div>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 space-x-1 font-semibold lg:flex lg:space-x-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-2 py-1 text-sm hover:opacity-80 lg:px-3 lg:text-base"
            >
              {link.label}
            </Link>
          ))}

          <SignedIn>
            {signedInLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-full px-2 py-1 text-sm hover:opacity-80 lg:px-3 lg:text-base"
              >
                {link.label}
              </Link>
            ))}
          </SignedIn>
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <ThemeSwitcher />

          <SignedOut>
            <div className="hidden lg:block">
              <SignInButton>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm lg:text-base"
                >
                  Login
                </Button>
              </SignInButton>
            </div>

            <SignUpButton>
              <Button
                className="whitespace-nowrap bg-blue-500 text-sm hover:bg-blue-600 lg:text-base"
                size="sm"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>

          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="p-1 sm:p-2"
            >
              {isMenuOpen ? (
                <X className="size-5 sm:size-6" />
              ) : (
                <Menu className="size-5 sm:size-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <nav className="bg-background/95 fixed inset-0 top-[57px] backdrop-blur-sm md:hidden">
          <ul className="mx-auto max-w-screen-2xl space-y-4 p-6">
            <li>
              <Link
                href="/"
                className="hover:text-primary/80 block text-lg font-medium"
                onClick={toggleMenu}
              >
                Home
              </Link>
            </li>
            {navLinks.map(link => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-primary/80 block text-lg font-medium"
                  onClick={toggleMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <SignedIn>
              {signedInLinks.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-primary/80 block text-lg font-medium"
                    onClick={toggleMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </SignedIn>
            <SignedOut>
              <li className="pt-4 sm:hidden">
                <SignInButton>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </SignInButton>
              </li>
            </SignedOut>
          </ul>
        </nav>
      )}
    </header>
  )
}
