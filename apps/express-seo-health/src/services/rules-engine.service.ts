import { get } from 'lodash';
import { seoRules } from '../config/seo-rules';

// Helper to safely get nested values
const getValue = (data: any, path: string) => get(data, path);

export function evaluateRules(data: any) {
    const results: any[] = [];
    const categoryScores: any = {};
    let totalScore = 0;
    let totalMaxPoints = 0;

    seoRules.categories.forEach(category => {
        let categoryPoints = 0;
        
        // Calculate points per rule assuming equal weight distribution within category maxPoints
        // OR we can assign points based on pass/fail validation count
        // The user provided config has `maxPoints` for category.
        // We will distribute these points among the rules based on their severity or just equally?
        // User didn't specify per-rule points. Let's assume weighted by severity.
        
        const rules = category.rules;
        const totalWeight = rules.reduce((acc, rule) => {
            const severity = rule.severity as 'HIGH' | 'MEDIUM' | 'LOW';
            return acc + seoRules.meta.scoring.severityWeights[severity];
        }, 0);

        rules.forEach(rule => {
            const severity = rule.severity as 'HIGH' | 'MEDIUM' | 'LOW';
            const ruleWeight = seoRules.meta.scoring.severityWeights[severity];
            const maxRulePoints = (ruleWeight / totalWeight) * category.maxPoints;

            let status = 'PASS';
            let scoreMultiplier = 1.0;

            // Check thresholds first if available (they are more specific)
            if (rule.thresholds) {
                const passField = rule.thresholds.pass.field;
                const passVal = getValue(data, passField);
                const passConfig = rule.thresholds.pass;
                
                if (checkCondition(passVal, passConfig.operator, passConfig.value)) {
                    status = 'PASS';
                } else {
                    const warnConfig = rule.thresholds.warning;
                    if (warnConfig) {
                        const warnField = warnConfig.field;
                        const warnVal = getValue(data, warnField);
                        if (checkCondition(warnVal, warnConfig.operator, warnConfig.value)) {
                            status = 'WARNING';
                        } else {
                            status = 'FAIL';
                        }
                    } else {
                        status = 'FAIL';
                    }
                }
            } else if (rule.checks) {
                // If any check fails, the rule fails (AND logic implied for strictness, or maybe we check all?)
                // Usually "checks" implies prerequisites.
                const allPass = rule.checks.every(check => {
                    const val = getValue(data, check.field);
                    return checkCondition(val, check.operator, check.value);
                });
                status = allPass ? 'PASS' : 'FAIL';
            }

            scoreMultiplier = seoRules.meta.scoring.statusScores[status as 'PASS' | 'WARNING' | 'FAIL'];
            const pointsEarned = maxRulePoints * scoreMultiplier;
            categoryPoints += pointsEarned;

            if (status !== 'PASS') {
                results.push({
                    id: rule.id,
                    severity: rule.severity,
                    category: category.id,
                    status: status,
                    message: rule.message,
                    recommendation: rule.recommendation,
                    pointsLost: maxRulePoints - pointsEarned
                });
            }
        });

        categoryScores[category.id] = {
            score: Math.round(categoryPoints),
            maxScore: category.maxPoints,
            percentage: Math.round((categoryPoints / category.maxPoints) * 100),
            label: category.name
        };
        
        totalScore += categoryPoints;
        totalMaxPoints += category.maxPoints;
    });

    return {
        healthScore: Math.round((totalScore / totalMaxPoints) * 100),
        categoryScores,
        recommendations: results
    };
}

function checkCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
        case 'equals': return actual === expected;
        case 'gt': return actual > expected;
        case 'gte': return actual >= expected;
        case 'lt': return actual < expected;
        case 'lte': return actual <= expected;
        case 'between': return actual >= expected[0] && actual <= expected[1];
        case 'outside': return actual < expected[0] || actual > expected[1];
        default: return false;
    }
}
