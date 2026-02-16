import { z } from 'zod';
import {
    CampaignInput,
    CampaignInputSchema,
    CampaignPlan,
    CampaignPlanSchema,
    CampaignNode,
    ChannelDistribution
} from './schema/campaign-plan';
import { calculateChannelAllocations } from './engine/channel-selector';
import { VERTICAL_PROFILES } from './config/vertical-profiles';
import { generateAwarenessLayer, generateConsiderationLayer, generateConversionLayer } from './engine/funnel-generator';

/**
 * Generates a deterministic, full-funnel campaign strategy based on business constraints.
 * 
 * @param input - The basic business parameters (Vertical, Objective, Budget)
 * @returns A validated CampaignPlan object containing channel mix, budget allocation, and execution steps.
 * @throws {ZodError} If the input validation fails.
 * 
 * @example
 * const plan = generateCampaignPlan({
 *   vertical: 'SaaS',
 *   objective: 'Leads',
 *   budget: 5000
 * });
 */
// Export the engine
export * from './engine/strategy-engine';

/**
 * Generates a deterministic, full-funnel campaign strategy based on business constraints.
 * 
 * @param input - The basic business parameters (Vertical, Objective, Budget)
 * @returns A validated CampaignPlan object containing channel mix, budget allocation, and execution steps.
 * @throws {ZodError} If the input validation fails.
 * 
 * @example
 * const plan = generateCampaignPlan({
 *   vertical: 'SaaS',
 *   objective: 'Leads',
 *   budget: 5000
 * });
 */
export const generateCampaignPlan = (input: CampaignInput): CampaignPlan => {
    const { strategyEngine } = require('./engine/strategy-engine');
    const { CampaignInputSchema } = require('./schema/campaign-plan');

    // Validate Input
    const validatedInput = CampaignInputSchema.parse(input);

    return strategyEngine.generatePlan(validatedInput);
};

// Export types and config
export * from './schema/campaign-plan';
export * from './config/vertical-profiles';

// v4 Exports
export * from './engine/blueprint-engine-v4';
import { blueprintEngineV4 } from './engine/blueprint-engine-v4';

export const generateBlueprintV4 = async (input: CampaignInput): Promise<CampaignPlan> => {
    // Validate Input
    const validatedInput = CampaignInputSchema.parse(input);
    return await blueprintEngineV4.generateBlueprint(validatedInput);
};

// Meta Engine Exports
export * from './meta-engine/meta-blueprint-engine';
export * from './schema/meta-plan';
