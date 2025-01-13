import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground px-4 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-lg font-semibold">PitLane Travel</h3>
          <p>Your ultimate F1 travel companion</p>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Circuits
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-primary">
              <Facebook />
            </a>
            <a href="#" className="hover:text-primary">
              <Twitter />
            </a>
            <a href="#" className="hover:text-primary">
              <Instagram />
            </a>
            <a href="#" className="hover:text-primary">
              <Youtube />
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p>&copy; 2023 PitLane Travel. All rights reserved.</p>
      </div>
    </footer>
  )
}
