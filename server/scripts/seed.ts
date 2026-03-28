import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { prisma } from '../src/db/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

type SeedThought = {
  text: string;
  sentAt: string;
};

type SeedMessage = {
  text: string;
  sentAt: string;
  thoughts: SeedThought[];
};

type SeedConversation = {
  title: string;
  startDate: string;
  messages: SeedMessage[];
};

const conversations: SeedConversation[] = [
  {
    title: 'Customer Onboarding Feedback Review',
    startDate: '2026-03-28T09:00:00-07:00',
    messages: [
      {
        text: 'What part of onboarding created the most uncertainty for new customers?',
        sentAt: '2026-03-28T09:05:00-07:00',
        thoughts: [
          {
            text: 'The account verification step felt like a dead end because there was no progress indicator after submission.',
            sentAt: '2026-03-28T09:07:00-07:00'
          },
          {
            text: 'People understood what to do, but they were unsure whether approval would take minutes or days.',
            sentAt: '2026-03-28T09:09:00-07:00'
          },
          {
            text: 'The setup checklist helped, but the listed order did not match the actual screens users saw.',
            sentAt: '2026-03-28T09:11:00-07:00'
          }
        ]
      },
      {
        text: 'Which improvement would most reduce time-to-value in the first session?',
        sentAt: '2026-03-28T09:14:00-07:00',
        thoughts: [
          {
            text: 'A guided first-run walkthrough would eliminate the need to search documentation before seeing results.',
            sentAt: '2026-03-28T09:16:00-07:00'
          },
          {
            text: 'Preloading a realistic demo project would help users understand what a successful setup looks like.',
            sentAt: '2026-03-28T09:18:00-07:00'
          },
          {
            text: 'Clarifying the difference between workspace setup and feature activation would remove avoidable confusion.',
            sentAt: '2026-03-28T09:20:00-07:00'
          }
        ]
      }
    ]
  },
  {
    title: 'Q2 Product Messaging Research',
    startDate: '2026-03-28T11:00:00-07:00',
    messages: [
      {
        text: 'What does the homepage headline make you expect the product will do for you?',
        sentAt: '2026-03-28T11:04:00-07:00',
        thoughts: [
          {
            text: 'It sounds like an analytics product first, not a workflow product that helps teams execute.',
            sentAt: '2026-03-28T11:06:00-07:00'
          },
          {
            text: 'The promise feels ambitious, but I still cannot tell who the product is for within a few seconds.',
            sentAt: '2026-03-28T11:08:00-07:00'
          },
          {
            text: 'The copy implies automation, while the screenshots suggest a setup-heavy product experience.',
            sentAt: '2026-03-28T11:10:00-07:00'
          }
        ]
      },
      {
        text: 'Which phrase feels least credible or most overused?',
        sentAt: '2026-03-28T11:13:00-07:00',
        thoughts: [
          {
            text: '“All-in-one platform” is too broad and does not help me picture the actual product value.',
            sentAt: '2026-03-28T11:15:00-07:00'
          },
          {
            text: '“Enterprise-ready” reads like filler unless it is backed by concrete security or governance details.',
            sentAt: '2026-03-28T11:17:00-07:00'
          }
        ]
      },
      {
        text: 'What supporting detail would make the messaging more believable?',
        sentAt: '2026-03-28T11:21:00-07:00',
        thoughts: [
          {
            text: 'A short before-and-after example would make the business outcome much easier to trust.',
            sentAt: '2026-03-28T11:23:00-07:00'
          },
          {
            text: 'A concrete statement about implementation time would reduce skepticism immediately.',
            sentAt: '2026-03-28T11:25:00-07:00'
          }
        ]
      }
    ]
  },
  {
    title: 'Engineering Retrospective: Release Process',
    startDate: '2026-03-28T14:00:00-07:00',
    messages: [
      {
        text: 'What slowed down the last release more than expected?',
        sentAt: '2026-03-28T14:03:00-07:00',
        thoughts: [
          {
            text: 'QA cycles stretched because acceptance criteria changed after implementation had already started.',
            sentAt: '2026-03-28T14:05:00-07:00'
          },
          {
            text: 'We lost time waiting for environment parity issues to be diagnosed across staging and production.',
            sentAt: '2026-03-28T14:07:00-07:00'
          },
          {
            text: 'Release notes were assembled too late, which forced last-minute coordination across teams.',
            sentAt: '2026-03-28T14:09:00-07:00'
          }
        ]
      },
      {
        text: 'What is the single highest-leverage fix for the next release?',
        sentAt: '2026-03-28T14:12:00-07:00',
        thoughts: [
          {
            text: 'Lock acceptance criteria before development starts and treat any changes as explicit scope adjustments.',
            sentAt: '2026-03-28T14:14:00-07:00'
          },
          {
            text: 'Automate the smoke test sequence so regressions are caught before handoff to QA.',
            sentAt: '2026-03-28T14:16:00-07:00'
          },
          {
            text: 'Create a release readiness checklist owned jointly by engineering and product.',
            sentAt: '2026-03-28T14:18:00-07:00'
          }
        ]
      }
    ]
  },
  {
    title: 'Town Hall Follow-Up Priorities',
    startDate: '2026-03-28T16:00:00-07:00',
    messages: [
      {
        text: 'Which topic from the town hall deserves a deeper follow-up session?',
        sentAt: '2026-03-28T16:04:00-07:00',
        thoughts: [
          {
            text: 'Roadmap prioritization needs more context because several teams still do not know how tradeoffs are made.',
            sentAt: '2026-03-28T16:06:00-07:00'
          },
          {
            text: 'Career progression deserves a dedicated session because the high-level answers raised more questions than they resolved.',
            sentAt: '2026-03-28T16:08:00-07:00'
          }
        ]
      },
      {
        text: 'What communication format would make follow-up most effective?',
        sentAt: '2026-03-28T16:11:00-07:00',
        thoughts: [
          {
            text: 'A short written summary before the session would let people arrive with sharper questions.',
            sentAt: '2026-03-28T16:13:00-07:00'
          },
          {
            text: 'A live Q&A with pre-submitted questions would balance transparency with better time management.',
            sentAt: '2026-03-28T16:15:00-07:00'
          },
          {
            text: 'Posting explicit decisions and owners afterward would make the meeting feel more actionable.',
            sentAt: '2026-03-28T16:17:00-07:00'
          }
        ]
      }
    ]
  }
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const conversation of conversations) {
    const existing = await prisma.conversation.findFirst({
      where: { title: conversation.title },
      select: { id: true }
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.conversation.create({
      data: {
        title: conversation.title,
        startDate: new Date(conversation.startDate),
        messages: {
          create: conversation.messages.map((message) => ({
            text: message.text,
            sentAt: new Date(message.sentAt),
            thoughts: {
              create: message.thoughts.map((thought) => ({
                text: thought.text,
                sentAt: new Date(thought.sentAt)
              }))
            }
          }))
        }
      }
    });

    created += 1;
  }

  console.log(`Seed complete. Created ${created} conversation(s), skipped ${skipped} existing conversation(s).`);
}

main()
  .catch((error) => {
    console.error('Seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
