import { prisma } from '@platform/db';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

export const generateMonthlyPlan = async (businessId: string, options: {
  month: number;
  year: number;
  industry: string;
  platforms: string[];
  frequency: 'low' | 'medium' | 'high';
  businessType?: string;
}) => {
  const { month, year, industry, frequency } = options;

  // 1. Get seasonal events for this month/year
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const events = await prisma.seasonalEvent.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // 3. Get Brand DNA for adaptation
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: { dna: true }
  });

  // 4. Generate the 30-day plan using AI
  try {
    const aiContext = {
      brandDNA: business?.dna || {},
      seasonalEvents: events.map(e => ({ name: e.name, date: e.date, description: e.description })),
      requestedPlatforms: options.platforms
    };

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/studio/plan`, {
      topic: `${monthNames[month - 1]} ${year} ${industry} Content Strategy`,
      businessType: industry,
      context: aiContext
    });

    // The AI service wraps the response in a success response object
    // Extract the actual data which contains the days array
    const planData = aiResponse.data?.data || aiResponse.data;

    if (planData?.days && Array.isArray(planData.days)) {
      // Filter days based on frequency
      const interval = frequency === 'high' ? 1 : frequency === 'medium' ? 2 : 3;
      const requestedPlatforms = options.platforms || ['Instagram', 'Facebook'];

      const filteredDays = planData.days.filter((d: any) => d.day % interval === 0).map((d: any) => {
        // Normalize platform(s) to array
        let dayPlatforms: string[] = [];

        if (d.platform && typeof d.platform === 'string') {
          dayPlatforms = [d.platform];
        } else if (d.platforms && Array.isArray(d.platforms) && d.platforms.length > 0) {
          dayPlatforms = d.platforms;
        } else {
          // If AI didn't specify, default to the first requested platform or all
          dayPlatforms = requestedPlatforms.length > 0 ? [requestedPlatforms[0]] : ['Instagram'];
        }

        return {
          ...d,
          platforms: dayPlatforms,
          suggestedCopy: d.suggestedCopy || d.caption || d.contentIdea, // Ensure we have something to show
        };
      });

      return await (prisma as any).monthlyPlannerPlan.upsert({
        where: { businessId_month_year: { businessId, month, year } },
        update: { industry, config: options as any, days: filteredDays, status: 'generated' },
        create: { businessId, month, year, industry, config: options as any, days: filteredDays, status: 'generated' }
      });
    } else {
      console.error('Invalid AI response structure:', JSON.stringify(aiResponse.data, null, 2));
      throw new Error('AI returned an invalid response format');
    }
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('AI is not working. Please try again later.');
  }
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const getPlan = async (businessId: string, month: number, year: number) => {
  return (prisma as any).monthlyPlannerPlan.findUnique({
    where: {
      businessId_month_year: {
        businessId,
        month,
        year
      }
    }
  });
};

export const convertPlanToDrafts = async (planId: string, locationId?: string) => {
  const plan = await (prisma as any).monthlyPlannerPlan.findUnique({
    where: { id: planId }
  });

  if (!plan) throw new Error('Plan not found');

  const days = plan.days as any[];
  const createdPosts = [];

  for (const day of days) {
    const scheduledAt = new Date(plan.year, plan.month - 1, day.day, 10, 0); // Default to 10 AM

    const post = await prisma.scheduledPost.create({
      data: {
        businessId: plan.businessId,
        locationId,
        platforms: day.platforms,
        content: JSON.stringify({
          text: day.suggestedCopy || day.contentIdea,
          contentType: day.contentType,
          seasonalHook: day.seasonalHook,
          idea: day.contentIdea
        }),
        scheduledAt,
        status: 'draft',
      }
    });
    createdPosts.push(post);
  }

  await (prisma as any).monthlyPlannerPlan.update({
    where: { id: planId },
    data: { status: 'converted' }
  });

  return createdPosts;
};

export const listTemplates = async (industry?: string) => {
  return (prisma as any).contentTemplate.findMany({
    where: industry ? { industry } : undefined
  });
};

export const listSeasonalEvents = async (month?: number, year?: number) => {
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return (prisma as any).seasonalEvent.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
  return (prisma as any).seasonalEvent.findMany();
};

export const createTemplate = async (data: any) => {
  return (prisma as any).contentTemplate.create({ data });
};

export const updateTemplate = async (id: string, data: any) => {
  return (prisma as any).contentTemplate.update({
    where: { id },
    data
  });
};

export const deleteTemplate = async (id: string) => {
  return (prisma as any).contentTemplate.delete({
    where: { id }
  });
};

export const createSeasonalEvent = async (data: any) => {
  if (data.date) {
    data.date = new Date(data.date);
  }
  return (prisma as any).seasonalEvent.create({ data });
};

export const updateSeasonalEvent = async (id: string, data: any) => {
  if (data.date) {
    data.date = new Date(data.date);
  }
  return (prisma as any).seasonalEvent.update({
    where: { id },
    data
  });
};

export const deleteSeasonalEvent = async (id: string) => {
  return (prisma as any).seasonalEvent.delete({
    where: { id }
  });
};
