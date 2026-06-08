import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STELLAR_ADDRESSES = [
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPGQS4XYOFSWZXFBZB4KNCLDVZ",
  "GC3BBMM7FVGM6PZRQPWQSPLWJBAFPQGVYTMM7C5YIMFZM4MCQRJZFXY",
  "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
  "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
  "GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMEDSSKYCNVKKVH",
  "GBCEPCPIUZJN6SWRXZRQPQG4XCJMPFPKBVB5Z4BJXQUQIUWWXZPPCZGM",
  "GAXNS5E3B3LXHXJ7RPGR6DFCWPQ54U7RXKGE3QGJX4IEZL7EL7FXNDI",
];

async function main() {
  console.log("Seeding database...");

  // Create organizations
  const orgs = await Promise.all([
    prisma.organization.upsert({
      where: { slug: "trustflow-foundation" },
      create: {
        name: "TrustFlow Foundation",
        slug: "trustflow-foundation",
        stellarAddress: STELLAR_ADDRESSES[0],
        website: "https://trustflow.foundation",
        description: "Building trust-based funding coordination",
        country: "US",
        isVerified: true,
      },
      update: {},
    }),
    prisma.organization.upsert({
      where: { slug: "remitbridge-inc" },
      create: {
        name: "RemitBridge Inc",
        slug: "remitbridge-inc",
        website: "https://remitbridge.io",
        description: "Cross-border payroll and aid disbursement",
        country: "SG",
        isVerified: true,
      },
      update: {},
    }),
    prisma.organization.upsert({
      where: { slug: "open-aid-collective" },
      create: {
        name: "Open Aid Collective",
        slug: "open-aid-collective",
        description: "Decentralized humanitarian aid distribution",
        country: "CH",
        isVerified: false,
      },
      update: {},
    }),
  ]);

  // Create users
  const users = await Promise.all(
    STELLAR_ADDRESSES.map((addr, i) =>
      prisma.user.upsert({
        where: { stellarAddress: addr },
        create: {
          stellarAddress: addr,
          displayName: `User ${i + 1}`,
          organizationId: i < 3 ? orgs[i % orgs.length].id : undefined,
          isActive: true,
        },
        update: {},
      })
    )
  );

  // Create trust relationships
  await Promise.all([
    prisma.trustRelationship.upsert({
      where: { trustorId_trusteeId_trustType: { trustorId: users[0].id, trusteeId: users[1].id, trustType: "PROFESSIONAL" } },
      create: { trustorId: users[0].id, trusteeId: users[1].id, trustType: "PROFESSIONAL", weight: 0.9, status: "ACTIVE" },
      update: {},
    }),
    prisma.trustRelationship.upsert({
      where: { trustorId_trusteeId_trustType: { trustorId: users[1].id, trusteeId: users[2].id, trustType: "ORGANIZATIONAL" } },
      create: { trustorId: users[1].id, trusteeId: users[2].id, trustType: "ORGANIZATIONAL", weight: 0.8, status: "ACTIVE" },
      update: {},
    }),
    prisma.trustRelationship.upsert({
      where: { trustorId_trusteeId_trustType: { trustorId: users[2].id, trusteeId: users[3].id, trustType: "PERSONAL" } },
      create: { trustorId: users[2].id, trusteeId: users[3].id, trustType: "PERSONAL", weight: 0.95, status: "ACTIVE" },
      update: {},
    }),
    prisma.trustRelationship.upsert({
      where: { trustorId_trusteeId_trustType: { trustorId: users[0].id, trusteeId: users[4].id, trustType: "DELEGATED" } },
      create: { trustorId: users[0].id, trusteeId: users[4].id, trustType: "DELEGATED", weight: 0.7, status: "ACTIVE" },
      update: {},
    }),
  ]);

  // Create trust scores
  for (const user of users.slice(0, 4)) {
    await prisma.trustScore.create({
      data: {
        userId: user.id,
        score: 50 + Math.random() * 50,
        components: {
          networkScore: 60,
          activityScore: 40,
          ageScore: 70,
          volumeScore: 30,
          reputationScore: 80,
        },
        algorithm: "v1",
      },
    });
  }

  // Create funding streams
  await prisma.fundingStream.upsert({
    where: { stellarTxHash: "SEED_TX_001" },
    create: {
      stellarTxHash: "SEED_TX_001",
      creatorId: users[0].id,
      recipientId: users[1].id,
      asset: "USDC",
      totalAmount: "50000",
      releasedAmount: "12500",
      startTime: new Date("2024-01-01"),
      endTime: new Date("2024-12-31"),
      status: "ACTIVE",
      streamType: "GRANT",
    },
    update: {},
  });

  // Create payroll batch
  const batch = await prisma.payrollBatch.upsert({
    where: { batchRef: "SEED-BATCH-001" },
    create: {
      organizationId: orgs[1].id,
      batchRef: "SEED-BATCH-001",
      totalAmount: "25000",
      asset: "USDC",
      recipientCount: 5,
      status: "COMPLETED",
      processedAt: new Date(),
    },
    update: {},
  });

  // Create beneficiaries
  const countries = ["NG", "KE", "PH", "IN", "MX"];
  await Promise.all(
    users.slice(3).map((user, i) =>
      prisma.beneficiary.create({
        data: {
          userId: user.id,
          batchId: batch.id,
          stellarAddress: user.stellarAddress,
          amount: "5000",
          asset: "USDC",
          country: countries[i % countries.length],
          status: "SETTLED",
          settledAt: new Date(),
        },
      })
    )
  );

  // Create assets
  await Promise.all([
    prisma.asset.upsert({
      where: { code_issuer: { code: "USDC", issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" } },
      create: {
        code: "USDC",
        issuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        type: "credit_alphanum4",
        name: "USD Coin",
        isAnchored: true,
      },
      update: {},
    }),
    prisma.asset.upsert({
      where: { code_issuer: { code: "XLM", issuer: null } },
      create: { code: "XLM", issuer: null, type: "native", name: "Stellar Lumens", isAnchored: false },
      update: {},
    }),
  ]);

  // Create sample transactions and payments
  for (let i = 0; i < 10; i++) {
    const txHash = `SEED_TX_${String(i + 100).padStart(3, "0")}`;
    const tx = await prisma.transaction.upsert({
      where: { txHash },
      create: {
        txHash,
        ledger: 50000000 + i * 1000,
        sourceAccount: STELLAR_ADDRESSES[i % STELLAR_ADDRESSES.length],
        fee: 100,
        operationCount: 1,
        successful: true,
        createdAt: new Date(Date.now() - i * 86400000),
      },
      update: {},
    });

    await prisma.payment.upsert({
      where: { operationId: `${txHash}_0` },
      create: {
        txId: tx.id,
        txHash,
        operationId: `${txHash}_0`,
        type: "PAYMENT",
        fromAddress: STELLAR_ADDRESSES[i % STELLAR_ADDRESSES.length],
        toAddress: STELLAR_ADDRESSES[(i + 1) % STELLAR_ADDRESSES.length],
        assetCode: i % 3 === 0 ? "XLM" : "USDC",
        assetIssuer: i % 3 === 0 ? undefined : "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
        amount: String(100 + i * 50),
        country: countries[i % countries.length],
        createdAt: new Date(Date.now() - i * 86400000),
      },
      update: {},
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
