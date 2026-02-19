import { Box, Card, CardContent, Checkbox, FormControlLabel, Grid, Stack, Typography, alpha } from '@mui/material';
import { Campaign as CampaignIcon, CheckCircle as CheckedIcon, RadioButtonUnchecked as UncheckedIcon } from '@mui/icons-material';

import { SETUP_TEMPLATES } from '../guides/templates';

type Props = {
  isStepCompleted: (stepId: string) => boolean;
  onToggleStep: (stepId: string, completed: boolean) => void;
  isSaving?: boolean;
  t: any;
  theme: any;
};

const SetupGuidesTab = ({ isStepCompleted, onToggleStep, isSaving, t, theme }: Props) => {
  const ACTION_VERBS = [
    'open', 'click', 'choose', 'select', 'set', 'use', 'add', 'remove', 'keep', 'apply',
    'create', 'define', 'configure', 'align', 'confirm', 'verify', 'validate', 'check',
    'run', 'upload', 'write', 'append', 'review', 'exclude', 'mark', 'connect'
  ];

  const splitByCommaOutsideParens = (input: string) => {
    const parts: string[] = [];
    let current = '';
    let depth = 0;

    for (const ch of input) {
      if (ch === '(') depth += 1;
      if (ch === ')') depth = Math.max(0, depth - 1);

      if (ch === ',' && depth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }

    if (current.trim()) parts.push(current.trim());

    return parts.filter(Boolean);
  };

  const startsWithActionVerb = (text: string) => {
    const firstWord = text.trim().toLowerCase().split(/\s+/)[0];

    return ACTION_VERBS.includes(firstWord);
  };

  const deriveChecklistFromDescription = (title: string, description: string) => {
    const normalized = (description || '').trim();

    if (!normalized) return [] as string[];

    const sentenceParts = normalized
      .split('.')
      .map(part => part.trim())
      .filter(Boolean);

    if (sentenceParts.length > 1) {
      return sentenceParts.map(item => item.endsWith('.') ? item : `${item}.`);
    }

    // Fallback for single long sentence: split by transition words.
    const thenParts = normalized
      .split(/\bthen\b/i)
      .map(part => part.trim())
      .filter(Boolean);

    if (thenParts.length > 1) {
      return thenParts.map((item) => item.endsWith('.') ? item : `${item}.`);
    }

    // If still a long sentence, split by commas only when each segment looks like an action.
    const commaParts = splitByCommaOutsideParens(normalized);

    if (commaParts.length > 1 && commaParts.every(startsWithActionVerb)) {
      return commaParts.map((item) => item.endsWith('.') ? item : `${item}.`);
    }

    const single = normalized.endsWith('.') ? normalized : `${normalized}.`;

    return [
      `Open the relevant settings for "${title}".`,
      single,
      'Save and verify this step before moving to the next one.'
    ];
  };

  const ensureStartToFinishChecklist = (title: string, items: string[]) => {
    const steps = [...items].map(step => step.trim()).filter(Boolean);
    const hasStart = steps.length > 0 && /^(open|go to|navigate|in\b)/i.test(steps[0]);
    const hasFinish = steps.length > 0 && /(save|publish|verify|confirm|re-run|recheck|re-check)/i.test(steps[steps.length - 1]);

    if (!hasStart) {
      steps.unshift(`Open "${title}" settings in the platform.`);
    }

    if (!hasFinish) {
      steps.push('Save and verify this step before moving to the next one.');
    }

    return steps;
  };

  return (
    <Grid container spacing={6} sx={{ '@media print': { display: 'block' } }}>
      {SETUP_TEMPLATES.map((guide) => (
        <Grid size={{ xs: 12, md: 6 }} key={guide.id} sx={{ '@media print': { mb: 8, breakInside: 'avoid' } }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 6 }}>
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: guide.platform === 'google' ? alpha('#4285F4', 0.1) : alpha('#1877F2', 0.1),
                  color: guide.platform === 'google' ? '#4285F4' : '#1877F2'
                }}>
                  <CampaignIcon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                  {guide.platform === 'google' ? t('googleSetup') : t('metaSetup')}
                </Typography>
              </Stack>

              {guide.sections.map((section, sIdx) => (
                <Box key={sIdx} sx={{ mb: 4 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, mb: 2, display: 'block' }}>
                    {section.title}
                  </Typography>
                  <Stack spacing={2}>
                    {section.steps.map((step, stepIdx) => {
                      const checklistItems = Array.isArray(step.checklist) && step.checklist.length > 0
                        ? step.checklist
                        : deriveChecklistFromDescription(step.title, step.description);

                      const orderedChecklist = ensureStartToFinishChecklist(step.title, checklistItems);

                      return (
                      <Box
                        key={step.id}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isStepCompleted(step.id) ? alpha(theme.palette.success.main, 0.2) : 'divider',
                          bgcolor: isStepCompleted(step.id) ? alpha(theme.palette.success.main, 0.02) : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isStepCompleted(step.id)}
                              onChange={(e) => onToggleStep(step.id, e.target.checked)}
                              disabled={isSaving}
                              sx={{ '@media print': { display: 'none' } }}
                            />
                          }
                          label={
                            <Stack direction="row" spacing={3} alignItems="flex-start">
                              <Box sx={{
                                display: 'none',
                                mt: 1,
                                '@media print': { display: 'block' }
                              }}>
                                {isStepCompleted(step.id) ?
                                  <CheckedIcon color="success" sx={{ fontSize: 20 }} /> :
                                  <UncheckedIcon sx={{ fontSize: 20, color: '#ccc' }} />}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: isStepCompleted(step.id) ? 'success.main' : 'text.primary' }}>
                                  {guide.platform === 'google' ? `Step ${stepIdx + 1}: ${step.title}` : step.title}
                                </Typography>
                                <Stack spacing={0.5} sx={{ mt: 1 }}>
                                  {orderedChecklist.map((item, idx) => (
                                    <Typography key={idx} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      • {idx + 1}. {item}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Box>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { mt: -0.5 } }}
                        />
                      </Box>
                    );
                    })}
                  </Stack>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SetupGuidesTab;
