import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { Menu, X } from "lucide-react"; // Import icons for mobile menu
import path from "path";

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [openDialog, setOpenDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log(user);
  }, []);

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
        {
          headers: {
            Authorization: `Bearer ${tokenInfo.access_token}`,
            Accept: "application/json",
          },
        }
      )
      .then((resp) => {
        console.log(resp.data);
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => GetUserProfile(tokenResponse),
    onError: (error) => console.log(error),
  });

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Create Itinery", path: "/create-trip" },
    { name: "Translate", path: "/scan-text" },
    { name: "Travel Guide", path: "/guide" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 py-2 shadow-md bg-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img className="w-16 h-auto" src="/logo.png" alt="Logo" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-x-3">
          {user ? (
            <>
              <a href="/my-trip" className="hidden sm:block">
                <Button variant="outline" className="rounded-full text-sm py-1 px-3">
                  My Trips
                </Button>
              </a>
              <Popover>
                <PopoverTrigger>
                  <img className="h-8 w-8 rounded-full" src={user?.picture} alt="Profile" />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="py-2">
                    <a href="/my-trip" className="block sm:hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Trips
                    </a>
                    <Button
                      onClick={() => {
                        googleLogout();
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="w-full text-sm rounded-lg p-2 mt-1"
                    >
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(true)} className="text-sm py-1 px-3">
              Sign in
            </Button>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden ml-2">
            <Button
              variant="ghost"
              className="p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 bg-white shadow-md z-50 mt-2 px-4 py-2">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-gray-700 hover:text-blue-600 py-2 text-sm font-medium transition-colors border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}

      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center">
                <img src="/logo.png" alt="Logo" className="w-20 mb-4" />
                <span>Sign in with Google Authentication securely</span>
                <Button onClick={login} className="w-full mt-5">
                  Sign in with Google
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;