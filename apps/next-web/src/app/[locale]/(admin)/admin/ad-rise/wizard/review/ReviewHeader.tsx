import { Box, Button, Typography } from '@mui/material';
import { FileDownload as DownloadIcon, Print as PrintIcon, RateReview as ReviewIcon, Share as ShareIcon } from '@mui/icons-material';

type Props = {
  title: string;
  readOnly: boolean;
  canShare: boolean;
  onShare: () => void;
  onExport: () => void;
  onPrint: () => void;
  shareLabel: string;
  exportLabel: string;
  printLabel: string;
};

const ReviewHeader = ({
  title,
  readOnly,
  canShare,
  onShare,
  onExport,
  onPrint,
  shareLabel,
  exportLabel,
  printLabel
}: Props) => {
  return (
    <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ReviewIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          {title}
        </Typography>
      </Box>

      <Box className="hide-on-print" sx={{ display: 'flex', gap: 2 }}>
        {!readOnly && (
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={onShare}
            disabled={!canShare}
          >
            {shareLabel}
          </Button>
        )}

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExport}
        >
          {exportLabel}
        </Button>

        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={onPrint}
        >
          {printLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewHeader;
