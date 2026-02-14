import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
  alpha
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionIcon,
} from '@mui/icons-material';

import { DIAGNOSTIC_STEPS, TROUBLESHOOTING_FLOWS } from '../guides/troubleshooting';
import { generateTroubleshootingAdvice, getCustomTroubleshootingAdvice, saveCustomTroubleshootingAdvice } from '@/app/actions/adrise';

type Props = {
  t: any;
  theme: any;
  sessionId: string;
  sessionContext?: any;
};

const TroubleshootingTab = ({ t, theme, sessionId, sessionContext }: Props) => {
  const [diagStepId, setDiagStepId] = useState<string>('q-start');
  const [diagResultId, setDiagResultId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [aiAdvice, setAiAdvice] = useState<{ summary: string; causes: string[]; actions: string[] } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiSectionTitle = 'AI next best actions';
  const aiLoadingLabel = 'Generating AI troubleshooting advice...';
  const causesLabel = 'Likely causes';
  const actionsLabel = 'Recommended actions';
  const retryLabel = 'Retry';
  const customTitle = 'Describe your own issue';
  const customSubtitle = 'Type your problem in plain words and get AI next best actions.';
  const customInputPlaceholder = 'Example: We launched 3 days ago. CPC is high and conversions are very low on Meta in Addis Ababa.';
  const generateCustomLabel = 'Generate AI actions';
  const customEmptyError = 'Please describe the issue before generating.';
  const customSavedTitle = 'Saved custom analyses';
  const [customIssue, setCustomIssue] = useState('');
  const [customAdvice, setCustomAdvice] = useState<{ issue: string; summary: string; causes: string[]; actions: string[]; createdAt?: string } | null>(null);
  const [customHistory, setCustomHistory] = useState<Array<{ id: string; issue: string; summary: string; causes: string[]; actions: string[]; createdAt: string }>>([]);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isCustomLoading, setIsCustomLoading] = useState(false);

  const handleDiagOption = (nextId: string, type: 'question' | 'result') => {
    setHistory(prev => [...prev, diagStepId]);

    if (type === 'question') {
      setDiagStepId(nextId);
    } else {
      setDiagResultId(nextId);
    }
  };

  const handleDiagBack = () => {
    if (diagResultId) {
      setDiagResultId(null);

      return;
    }

    if (history.length > 0) {
      const prev = history[history.length - 1];

      setHistory(prevHistory => prevHistory.slice(0, -1));
      setDiagStepId(prev);
    }
  };

  const resetDiag = () => {
    setDiagStepId('q-start');
    setDiagResultId(null);
    setHistory([]);
    setAiAdvice(null);
    setAiError(null);
  };

  const currentDiagStep = useMemo(() => DIAGNOSTIC_STEPS.find(s => s.id === diagStepId), [diagStepId]);
  const currentDiagResult = useMemo(() => TROUBLESHOOTING_FLOWS.find(r => r.id === diagResultId), [diagResultId]);

  const loadAiAdvice = async (result: any) => {
    if (!result) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await generateTroubleshootingAdvice({
        issue: result.issue,
        suggestion: result.suggestion,
        staticSteps: result.steps,
        context: sessionContext || {}
      });

      const payload = (response.data as any)?.data ?? response.data;

      if (response.success && payload?.summary && Array.isArray(payload?.actions)) {
        setAiAdvice(payload);
      } else {
        setAiAdvice(null);
        setAiError('AI advice is unavailable right now.');
      }
    } catch (error) {
      console.error('AI troubleshooting advice failed:', error);
      setAiAdvice(null);
      setAiError('AI advice is unavailable right now.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (!diagResultId || !currentDiagResult) {
      setAiAdvice(null);
      setAiError(null);
      setIsAiLoading(false);

      return;
    }

    loadAiAdvice(currentDiagResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagResultId, currentDiagResult?.id]);

  useEffect(() => {
    const loadCustomHistory = async () => {
      const response = await getCustomTroubleshootingAdvice(sessionId);

      if (response.success && Array.isArray(response.data)) {
        setCustomHistory(response.data);

        if (response.data.length > 0) {
          const latest = response.data[0];

          setCustomAdvice({
            issue: latest.issue,
            summary: latest.summary,
            causes: latest.causes || [],
            actions: latest.actions || [],
            createdAt: latest.createdAt
          });
        }
      }
    };

    loadCustomHistory();
  }, [sessionId]);

  const handleGenerateCustomAdvice = async () => {
    const issue = customIssue.trim();

    if (!issue) {
      setCustomError(customEmptyError);

      return;
    }

    setIsCustomLoading(true);
    setCustomError(null);

    try {
      const response = await generateTroubleshootingAdvice({
        issue,
        suggestion: '',
        staticSteps: [],
        context: sessionContext || {}
      });

      const payload = (response.data as any)?.data ?? response.data;

      if (!response.success || !payload?.summary || !Array.isArray(payload?.actions)) {
        throw new Error('Invalid AI troubleshooting payload');
      }

      const nextAdvice = {
        issue,
        summary: payload.summary,
        causes: Array.isArray(payload.causes) ? payload.causes : [],
        actions: payload.actions,
        createdAt: new Date().toISOString()
      };

      setCustomAdvice(nextAdvice);

      const saved = await saveCustomTroubleshootingAdvice(sessionId, {
        issue,
        summary: nextAdvice.summary,
        causes: nextAdvice.causes,
        actions: nextAdvice.actions
      });

      if (saved.success) {
        const refreshed = await getCustomTroubleshootingAdvice(sessionId);

        if (refreshed.success && Array.isArray(refreshed.data)) {
          setCustomHistory(refreshed.data);
        }
      }
    } catch (error) {
      console.error('Custom AI troubleshooting advice failed:', error);
      setCustomAdvice(null);
      setCustomError('AI advice is unavailable right now.');
    } finally {
      setIsCustomLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ '@media print': { display: 'none' } }}>
        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 4, bgcolor: alpha(theme.palette.info.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {customTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {customSubtitle}
            </Typography>
          </Box>
          <CardContent sx={{ p: 6 }}>
            <TextField
              multiline
              minRows={4}
              value={customIssue}
              onChange={(event) => setCustomIssue(event.target.value)}
              placeholder={customInputPlaceholder}
              fullWidth
            />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleGenerateCustomAdvice} disabled={isCustomLoading}>
                {generateCustomLabel}
              </Button>
            </Stack>

            <Box sx={{ mt: 4 }}>
              {isCustomLoading ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    {aiLoadingLabel}
                  </Typography>
                </Stack>
              ) : customAdvice ? (
                <Stack spacing={2}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {customAdvice.issue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{customAdvice.summary}</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{causesLabel}</Typography>
                  <Stack spacing={1}>
                    {customAdvice.causes.map((cause, idx) => (
                      <Typography key={idx} variant="body2">{idx + 1}. {cause}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{actionsLabel}</Typography>
                  <Stack spacing={1}>
                    {customAdvice.actions.map((action, idx) => (
                      <Typography key={idx} variant="body2">{idx + 1}. {action}</Typography>
                    ))}
                  </Stack>
                </Stack>
              ) : customError ? (
                <Alert severity="info">{customError}</Alert>
              ) : null}
            </Box>

            {customHistory.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, display: 'block' }}>
                  {customSavedTitle}
                </Typography>
                <Stack spacing={1}>
                  {customHistory.slice(0, 3).map((entry) => (
                    <Button
                      key={entry.id}
                      variant="text"
                      sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                      onClick={() => setCustomAdvice({
                        issue: entry.issue,
                        summary: entry.summary,
                        causes: entry.causes || [],
                        actions: entry.actions || [],
                        createdAt: entry.createdAt
                      })}
                    >
                      {entry.issue}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>

        {(diagResultId || history.length > 0) && (
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={handleDiagBack}
            sx={{ mb: 4, fontWeight: 600 }}
          >
            {diagResultId ? t('backToQuestion') : t('previousQuestion')}
          </Button>
        )}

        {!diagResultId && currentDiagStep && (
          <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            <Box sx={{ p: 4, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <QuestionIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('diagnosticTitle')}</Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{currentDiagStep.question}</Typography>
              {currentDiagStep.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
                  {currentDiagStep.description}
                </Typography>
              )}

              <Stack spacing={2}>
                {currentDiagStep.options.map((opt, idx) => (
                  <Box key={idx}
                    onClick={() => handleDiagOption(opt.nextId, opt.type)}
                    sx={{
                      p: 4,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                        transform: 'translateX(8px)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{opt.label}</Typography>
                    <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)', color: 'text.secondary' }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {diagResultId && currentDiagResult && (
          <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'error.main', overflow: 'hidden' }}>
            <Box sx={{ p: 4, bgcolor: alpha(theme.palette.error.main, 0.05), borderBottom: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1) }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <ErrorIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>{t('diagnosticResult')} {currentDiagResult.issue}</Typography>
              </Stack>
            </Box>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {t('recommendation')}: {currentDiagResult.suggestion}
              </Typography>

              <Divider sx={{ mb: 4 }} />

              <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 3, display: 'block' }}>
                {t('requiredActions')}
              </Typography>

              <Stack spacing={2.5}>
                {currentDiagResult.steps.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      mt: 0.5,
                      minWidth: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800
                    }}>
                      {idx + 1}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{step}</Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 4 }} />

              <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', mb: 2, display: 'block' }}>
                {aiSectionTitle}
              </Typography>

              {isAiLoading ? (
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    {aiLoadingLabel}
                  </Typography>
                </Stack>
              ) : aiAdvice ? (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">{aiAdvice.summary}</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{causesLabel}</Typography>
                  <Stack spacing={1}>
                    {aiAdvice.causes.map((cause, idx) => (
                      <Typography key={idx} variant="body2">{idx + 1}. {cause}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>{actionsLabel}</Typography>
                  <Stack spacing={1}>
                    {aiAdvice.actions.map((action, idx) => (
                      <Typography key={idx} variant="body2">{idx + 1}. {action}</Typography>
                    ))}
                  </Stack>
                </Stack>
              ) : (
                <Alert
                  severity="info"
                  action={
                    <Button size="small" onClick={() => currentDiagResult && loadAiAdvice(currentDiagResult)}>
                      {retryLabel}
                    </Button>
                  }
                >
                  {aiError || 'AI advice is unavailable right now.'}
                </Alert>
              )}

              <Button
                variant="outlined"
                onClick={resetDiag}
                fullWidth
                sx={{ mt: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {t('startNew')}
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      <Box sx={{ display: 'none', '@media print': { display: 'block' } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          {t('troubleshooting')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {t('diagnosticTitle')}
        </Typography>

        <Card sx={{ mb: 4, border: '1px solid #ddd', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
              {t('diagnosticTitle')}
            </Typography>
            <Stack spacing={1}>
              {DIAGNOSTIC_STEPS.map((step) => (
                <Box key={step.id}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{step.question}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.options.map(opt => opt.label).join(' / ')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          {TROUBLESHOOTING_FLOWS.map((flow) => (
            <Card key={flow.id} sx={{ border: '1px solid #ddd', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{flow.issue}</Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'error.main', fontWeight: 700 }}>
                  {flow.suggestion}
                </Typography>
                <Stack spacing={1}>
                  {flow.steps.map((step, idx) => (
                    <Typography key={idx} variant="body2">{idx + 1}. {step}</Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default TroubleshootingTab;
