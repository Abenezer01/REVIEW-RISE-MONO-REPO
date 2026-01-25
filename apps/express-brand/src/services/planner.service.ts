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
  const { month, year, industry, platforms, frequency } = options;

  // 1. Get templates for this industry
  const templates = await prisma.contentTemplate.findMany({
    where: { industry }
  });

  if (templates.length === 0) {
    throw new Error(`No templates found for industry: ${industry}`);
  }

  // 2. Get seasonal events for this month/year
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

  // 4. Generate the 30-day plan
  const daysInMonth = endDate.getDate();
  const planDays = [];
  
  // Determine posting frequency (e.g., high = daily, medium = every 2 days, low = twice a week)
  const interval = frequency === 'high' ? 1 : frequency === 'medium' ? 2 : 3;

  for (let day = 1; day <= daysInMonth; day++) {
    if (day % interval === 0) {
      // Find if there's an event for this day
      const dayDate = new Date(year, month - 1, day);
      const dayEvent = events.find((e: any) => e.date.toDateString() === dayDate.toDateString());

      // Pick a template randomly
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Adapt copy using AI if possible
      let suggestedCopy = template.content;
      if (business) {
        try {
          const context = {
            businessName: business.name,
            industry: industry,
            audience: (business as any).dna?.audience,
            voice: (business as any).dna?.voice,
            mission: (business as any).dna?.mission,
            seasonalHook: dayEvent ? dayEvent.name : undefined,
            seasonalDescription: dayEvent ? dayEvent.description : undefined,
          };

          const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/adapt-content`, {
            template: template.content,
            context
          });

          if (response.data?.adaptedText) {
            suggestedCopy = response.data.adaptedText;
          }
        } catch (error) {
          console.error('Failed to adapt content with AI:', error);
          // Fallback to template content
        }
      }

      planDays.push({
        day,
        contentIdea: template.title,
        contentType: template.contentType,
        platforms: platforms,
        seasonalHook: dayEvent ? dayEvent.name : undefined,
        templateId: template.id,
        suggestedCopy,
      });
    }
  }

  // 5. Save or update the plan
  const plan = await (prisma as any).monthlyPlannerPlan.upsert({
    where: {
      businessId_month_year: {
        businessId,
        month,
        year
      }
    },
    update: {
      industry,
      config: options as any,
      days: planDays as any,
      status: 'generated'
    },
    create: {
      businessId,
      month,
      year,
      industry,
      config: options as any,
      days: planDays as any,
      status: 'generated'
    }
  });

  return plan;
};

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
