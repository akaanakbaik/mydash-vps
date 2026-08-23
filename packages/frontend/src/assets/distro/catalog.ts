import ubuntuLogo from './ubuntu.svg';
import debianLogo from './debian.svg';
import fedoraLogo from './fedora.png';
import archLinuxLogo from './arch-linux.svg';
import linuxMintLogo from './linux-mint.svg';
import rockyLinuxLogo from './rocky-linux.svg';
import openSuseLogo from './opensuse.svg';

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
    id: 'ubuntu',
    name: 'Ubuntu',
    aliases: ['ubuntu'],
    src: ubuntuLogo,
    sourceUrl: 'https://assets.ubuntu.com/v1/ff6a9a38-ubuntu-logo-2022.svg',
    licenseNote: 'Official Ubuntu/Canonical brand asset; trademark applies.',
    shape: 'wordmark',
  },
  {
    id: 'debian',
    name: 'Debian',
    aliases: ['debian'],
    src: debianLogo,
    sourceUrl: 'https://www.debian.org/logos/openlogo.svg',
    licenseNote: 'Debian open use logo; LGPL v3 or later, or CC BY-SA 3.0 per Debian logo page.',
    shape: 'wordmark',
  },
  {
    id: 'fedora',
    name: 'Fedora',
    aliases: ['fedora'],
    src: fedoraLogo,
    sourceUrl: 'https://fedoraproject.org/w/uploads/2/2d/Logo_fedoralogo.png',
    licenseNote: 'Official Fedora Project logo asset; Fedora/Red Hat trademark guidelines apply.',
    shape: 'wordmark',
  },
  {
    id: 'arch-linux',
    name: 'Arch Linux',
    aliases: ['arch linux', 'archlinux'],
    src: archLinuxLogo,
    sourceUrl: 'https://archlinux.org/static/logos/archlinux-logo-dark-scalable.svg',
    licenseNote: 'Official Arch Linux artwork; Arch Linux trademark policy applies.',
    shape: 'wordmark',
  },
  {
    id: 'linux-mint',
    name: 'Linux Mint',
    aliases: ['linux mint', 'linuxmint'],
    src: linuxMintLogo,
    sourceUrl: 'https://raw.githubusercontent.com/linuxmint/brand-logo/master/ring.svg',
    licenseNote: 'Raw SVG from the official Linux Mint brand-logo repository.',
    shape: 'wordmark',
  },
  {
    id: 'rocky-linux',
    name: 'Rocky Linux',
    aliases: ['rocky linux', 'rockylinux'],
    src: rockyLinuxLogo,
    sourceUrl: 'https://raw.githubusercontent.com/rocky-linux/brand-kit/main/Logomark.svg',
    licenseNote: 'Official Rocky Linux Brand Kit asset; RESF trademark guide applies.',
    shape: 'square',
  },
  {
    id: 'opensuse',
    name: 'openSUSE',
    aliases: ['opensuse', 'open suse'],
    src: openSuseLogo,
    sourceUrl: 'https://raw.githubusercontent.com/openSUSE/artwork/master/logos/official/logo-color.svg',
    licenseNote: 'Official openSUSE artwork repository asset; openSUSE trademark guidance applies.',
    shape: 'wordmark',
  },
];

export function findDistroAsset(distro: string): DistroAsset | undefined {
  const normalized = distro.trim().toLowerCase();
  return distroAssets.find((asset) => asset.aliases.some((alias) => normalized.includes(alias)));
}
