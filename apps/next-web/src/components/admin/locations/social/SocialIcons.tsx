import { Avatar } from '@mui/material';
import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Link as LinkIcon
} from '@mui/icons-material';

export const PlatformIcon = ({ platform, size = 40 }: { platform: string, size?: number }) => {
    const sx = { width: size, height: size };
    switch (platform.toLowerCase()) {
        case 'facebook': return <FacebookIcon sx={{ ...sx, color: '#1877F2' }} />;
        case 'instagram': return <InstagramIcon sx={{ ...sx, color: '#E4405F' }} />;
        case 'linkedin': return <LinkedInIcon sx={{ ...sx, color: '#0077b5' }} />;
        default: return <LinkIcon sx={{ ...sx, color: 'text.secondary' }} />;
    }
};

export const PlatformAvatar = ({ platform }: { platform: string }) => {
    let color = '#ccc';
    let Icon = LinkIcon;

    switch (platform.toLowerCase()) {
        case 'facebook': color = '#1877F2'; Icon = FacebookIcon; break;
        case 'instagram': color = '#E4405F'; Icon = InstagramIcon; break;
        case 'linkedin': color = '#0077b5'; Icon = LinkedInIcon; break;
    }

    return (
        <Avatar variant="rounded" sx={{ bgcolor: color, width: 48, height: 48 }}>
            <Icon sx={{ color: '#fff', fontSize: 28 }} />
        </Avatar>
    );
};
