# Distro and OS Icon Assets

The seven files in this directory are downloaded raw from the SVGRepo download URLs below. They are not AI-generated, redrawn, recolored, cropped, combined, or rasterized by MyDash. The interface only places each original SVG file inside a neutral presentation frame.

| ID | Local file | SVGRepo preview | Raw download | License shown on source page |
| --- | --- | --- | --- | --- |
| Arch Linux | `arch-linux.svg` | [Preview](https://www.svgrepo.com/svg/341619/arch-linux) | [Download](https://www.svgrepo.com/download/341619/arch-linux.svg) | GPL License |
| Ubuntu | `ubuntu.svg` | [Preview](https://www.svgrepo.com/svg/473819/ubuntu) | [Download](https://www.svgrepo.com/download/473819/ubuntu.svg) | SVGRepo open-license catalog terms; Ubuntu trademark applies |
| Kali Linux | `kali-linux.svg` | [Preview](https://www.svgrepo.com/svg/473687/kalilinux) | [Download](https://www.svgrepo.com/download/473687/kalilinux.svg) | Logo License |
| Debian | `debian.svg` | [Preview](https://www.svgrepo.com/svg/473581/debian) | [Download](https://www.svgrepo.com/download/473581/debian.svg) | SVGRepo open-license catalog terms; Debian trademark applies |
| Fedora | `fedora.svg` | [Preview](https://www.svgrepo.com/svg/354990/fedora) | [Download](https://www.svgrepo.com/download/354990/fedora.svg) | Apache License |
| Linux Mint | `linux-mint.svg` | [Preview](https://www.svgrepo.com/svg/452055/linux-mint) | [Download](https://www.svgrepo.com/download/452055/linux-mint.svg) | MIT License |
| openSUSE | `opensuse.svg` | [Preview](https://www.svgrepo.com/svg/306517/opensuse) | [Download](https://www.svgrepo.com/download/306517/opensuse.svg) | Logo License |

## Detection behavior

`catalog.ts` matches the detected OS/distro text case-insensitively against conservative aliases. Ubuntu, Debian, Fedora, Arch Linux, Kali Linux, Linux Mint, and openSUSE select their corresponding original icon. Unknown operating systems do not receive a fabricated distro logo; the UI displays a neutral device symbol and preserves the detected text.

## Attribution and trademark notice

SVGRepo hosts open-license vectors, but individual names and marks remain the property of their respective projects. The dashboard uses the icons only to identify the detected operating system and does not imply endorsement by any distro project.
