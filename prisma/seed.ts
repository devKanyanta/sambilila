import { prisma } from '../lib/db'

const PLANS_SEED = [
  {
    name: 'Free',
    slug: 'free',
    priceUSD: 0,
    period: 'month',
    description: 'Best for students trying out the app',
    features: [
      'Create up to 3 quizzes per week',
      'Create up to 3 flashcards per week',
      'Max 10 questions per quiz',
    ],
    limits: {
      maxQuizzesPerWeek: 3,
      maxFlashcardsTotal: 3,
      maxQuestionsPerQuiz: 10,
      priorityProcessing: false,
      progressTracking: false,
    },
    highlighted: false,
  },
  {
    name: 'Weekly',
    slug: 'weekly',
    priceUSD: 0.99,
    period: 'week',
    description: 'Best for short term studying during exams',
    features: [
      'Create up to 15 quizzes per week',
      'Create up to 10 flashcards per week',
      'Max 50 questions per quiz',
      'Access full quiz history',
    ],
    limits: {
      maxQuizzesPerWeek: 15,
      maxFlashcardsTotal: 10,
      maxQuestionsPerQuiz: 50,
      priorityProcessing: false,
      progressTracking: true,
    },
    highlighted: true,
  },
  {
    name: 'Monthly',
    slug: 'monthly',
    priceUSD: 3.99,
    period: 'month',
    description: 'Best for committed students & exam preparation',
    features: [
      'Create up to 50 quizzes per week',
      'Create up to 30 flashcards per week',
      'Progress tracking',
      'Performance stats',
      'Priority processing',
    ],
    limits: {
      maxQuizzesPerWeek: 50,
      maxFlashcardsTotal: 30,
      maxQuestionsPerQuiz: null,
      priorityProcessing: true,
      progressTracking: true,
    },
    highlighted: false,
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
        description: plan.description,
        features: plan.features,
        limits: plan.limits,
        highlighted: plan.highlighted,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        priceUSD: plan.priceUSD,
        period: plan.period,
        description: plan.description,
        features: plan.features,
        limits: plan.limits,
        highlighted: plan.highlighted,
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
