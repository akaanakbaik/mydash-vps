# Distro and OS Logo Assets

The seven files in this directory are downloaded raw from upstream project sources. They are not AI-generated, redrawn, recolored, cropped, combined, or rasterized by MyDash. The interface only places each original file inside a neutral presentation frame.

| ID | Local file | Upstream source | Usage note |
| --- | --- | --- | --- |
| Ubuntu | `ubuntu.svg` | [Ubuntu brand asset](https://assets.ubuntu.com/v1/ff6a9a38-ubuntu-logo-2022.svg) | Ubuntu/Canonical trademark guidance applies. Brand page: [design.ubuntu.com/brand](https://design.ubuntu.com/brand). |
| Debian | `debian.svg` | [Debian open use logo](https://www.debian.org/logos/openlogo.svg) | Debian states the open use logo is available under LGPL v3 or later, or CC BY-SA 3.0; trademark terms also apply. |
| Fedora | `fedora.png` | [Fedora Project hosted logo](https://fedoraproject.org/w/uploads/2/2d/Logo_fedoralogo.png) | Fedora/Red Hat trademark and logo usage guidance applies. Reference: [Fedora Logo wiki](https://fedoraproject.org/wiki/Logo). |
| Arch Linux | `arch-linux.svg` | [Arch Linux scalable logo](https://archlinux.org/static/logos/archlinux-logo-dark-scalable.svg) | Official Arch artwork; Arch Linux trademark policy applies. Reference: [archlinux.org/art](https://archlinux.org/art/). |
| Linux Mint | `linux-mint.svg` | [Linux Mint brand repository file](https://raw.githubusercontent.com/linuxmint/brand-logo/master/ring.svg) | Raw SVG from the official `linuxmint/brand-logo` repository. |
| Rocky Linux | `rocky-linux.svg` | [Rocky Linux Brand Kit logomark](https://raw.githubusercontent.com/rocky-linux/brand-kit/main/Logomark.svg) | Official Brand Kit asset; RESF/Rocky Linux trademark guide applies. Reference: [Rocky branding](https://wiki.rockylinux.org/team/design/branding/). |
| openSUSE | `opensuse.svg` | [openSUSE official color logo](https://raw.githubusercontent.com/openSUSE/artwork/master/logos/official/logo-color.svg) | Official openSUSE artwork repository file; openSUSE trademark guidance applies. Reference: [openSUSE artwork logos](https://en.opensuse.org/openSUSE:Artwork_logos). |

## Detection behavior

`catalog.ts` matches the detected OS/distro text case-insensitively against conservative aliases. Ubuntu, Debian, Fedora, Arch Linux, Linux Mint, Rocky Linux, and openSUSE select their corresponding original asset. Unknown operating systems do not receive a fabricated distro logo; the UI displays a neutral device symbol and preserves the detected text.
