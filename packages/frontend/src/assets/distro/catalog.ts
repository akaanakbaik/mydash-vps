import ubuntuLogo from './ubuntu.svg?url&no-inline';
import debianLogo from './debian.svg?url&no-inline';
import fedoraLogo from './fedora.svg?url&no-inline';
import archLinuxLogo from './arch-linux.svg?url&no-inline';
import kaliLinuxLogo from './kali-linux.svg?url&no-inline';
import linuxMintLogo from './linux-mint.svg?url&no-inline';
import openSuseLogo from './opensuse.svg?url&no-inline';

export type DistroAsset = {
  id: string;
  name: string;
  aliases: readonly string[];
  src: string;
  sourceUrl: string;
  licenseNote: string;
  shape: 'square' | 'wordmark';
};

export const distroAssets: readonly DistroAsset[] = [
  {
    id: 'arch-linux',
    name: 'Arch Linux',
    aliases: ['arch linux', 'archlinux'],
    src: archLinuxLogo,
    sourceUrl: 'https://www.svgrepo.com/download/341619/arch-linux.svg',
    licenseNote: 'SVGRepo lists this icon under GPL License.',
    shape: 'square',
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    aliases: ['ubuntu'],
    src: ubuntuLogo,
    sourceUrl: 'https://www.svgrepo.com/download/473819/ubuntu.svg',
    licenseNote: 'SVGRepo source page lists the icon under its open-license catalog terms; Ubuntu trademark applies.',
    shape: 'square',
  },
  {
    id: 'kali-linux',
    name: 'Kali Linux',
    aliases: ['kali linux', 'kalilinux', 'kali'],
    src: kaliLinuxLogo,
    sourceUrl: 'https://www.svgrepo.com/download/473687/kalilinux.svg',
    licenseNote: 'SVGRepo lists this icon under Logo License; Kali Linux trademark applies.',
    shape: 'square',
  },
  {
    id: 'debian',
    name: 'Debian',
    aliases: ['debian'],
    src: debianLogo,
    sourceUrl: 'https://www.svgrepo.com/download/473581/debian.svg',
    licenseNote: 'SVGRepo lists this icon under its open-license catalog terms; Debian trademark applies.',
    shape: 'square',
  },
  {
    id: 'fedora',
    name: 'Fedora',
    aliases: ['fedora'],
    src: fedoraLogo,
    sourceUrl: 'https://www.svgrepo.com/download/354990/fedora.svg',
    licenseNote: 'SVGRepo lists this icon under Apache License; Fedora trademark applies.',
    shape: 'square',
  },
  {
    id: 'linux-mint',
    name: 'Linux Mint',
    aliases: ['linux mint', 'linuxmint'],
    src: linuxMintLogo,
    sourceUrl: 'https://www.svgrepo.com/download/452055/linux-mint.svg',
    licenseNote: 'SVGRepo lists this icon under MIT License; Linux Mint trademark applies.',
    shape: 'square',
  },
  {
    id: 'opensuse',
    name: 'openSUSE',
    aliases: ['opensuse', 'open suse'],
    src: openSuseLogo,
    sourceUrl: 'https://www.svgrepo.com/download/306517/opensuse.svg',
    licenseNote: 'SVGRepo lists this icon under Logo License; openSUSE trademark applies.',
    shape: 'square',
  },
];

export function findDistroAsset(distro: string): DistroAsset | undefined {
  const normalized = distro.trim().toLowerCase();
  return distroAssets.find((asset) => asset.aliases.some((alias) => normalized.includes(alias)));
}
