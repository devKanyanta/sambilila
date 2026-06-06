import { prisma } from '../lib/db'

const PLANS_SEED = [
  {
    name: 'Free',
    slug: 'free',
    priceUSD: 0,
    period: 'month',
    features: [
      'Create up to 3 quizzes per week',
      'Create up to 50 flashcards total',
      'Max 10 questions per quiz',
    ],
    limits: {
      maxQuizzesPerWeek: 3,
      maxFlashcardsTotal: 50,
      maxQuestionsPerQuiz: 10,
      priorityProcessing: false,
      progressTracking: false,
    },
  },
  {
    name: 'Weekly',
    slug: 'weekly',
    priceUSD: 0.99,
    period: 'week',
    features: [
      'Create unlimited quizzes',
      'Create up to 500 flashcards total',
      'Max 50 questions per quiz',
      'Access full quiz history',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: 500,
      maxQuestionsPerQuiz: 50,
      priorityProcessing: false,
      progressTracking: true,
    },
  },
  {
    name: 'Monthly',
    slug: 'monthly',
    priceUSD: 3.99,
    period: 'month',
    features: [
      'Create unlimited quizzes',
      'Create up to unlimited flashcards',
      'Progress tracking',
      'Performance stats',
      'Priority processing',
    ],
    limits: {
      maxQuizzesPerWeek: null,
      maxFlashcardsTotal: null,
      maxQuestionsPerQuiz: null,
      priorityProcessing: true,
      progressTracking: true,
    },
  },
]

async function main() {
  console.log('Seeding billing plans...')

  for (const plan of PLANS_SEED) {
    await prisma.billingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        priceUSD: plan.priceUSD,
        period: plan.period,
        features: plan.features,
        limits: plan.limits,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        priceUSD: plan.priceUSD,
        period: plan.period,
        features: plan.features,
        limits: plan.limits,
      },
    })
    console.log(`  ✓ ${plan.name}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
