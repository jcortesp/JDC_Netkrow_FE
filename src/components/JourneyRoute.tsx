import { Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function JourneyRoute({ steps }: { steps: string[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        py: 2,
        '&::-webkit-scrollbar': { height: 8 },
        '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: 4 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 'max-content' }}>
        {steps.map((step, idx) => (
          <Box key={`${step}-${idx}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                border: idx === 0 ? '2px solid #FB8C00' : '2px solid #00897B',
                bgcolor: idx === 0 ? '#FFF3E0' : '#E0F2F1',
                minWidth: { xs: 160, sm: 220, md: 260 },
                textAlign: 'center',
                fontWeight: idx === 0 ? 700 : 600,
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              }}
            >
              {step}
            </Box>
            {idx < steps.length - 1 && <ChevronRightIcon sx={{ color: '#00897B' }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
