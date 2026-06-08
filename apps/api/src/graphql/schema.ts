import { buildSchema } from "graphql";

const typeDefs = `
  type Query {
    stats: EcosystemMetrics!
    transactions(page: Int, pageSize: Int, address: String): TransactionPage!
    transaction(hash: String!): Transaction
    payments(page: Int, pageSize: Int, address: String, assetCode: String, country: String): PaymentPage!
    payment(operationId: String!): Payment
    trustRelationships(page: Int, pageSize: Int, userId: String, status: TrustStatus): TrustPage!
    trustGraph(userId: String, depth: Int): TrustGraph!
    trustScore(userId: String!): TrustScore
    fundingStreams(page: Int, pageSize: Int, status: StreamStatus): FundingStreamPage!
    fundingStream(id: String!): FundingStream
    organizations(page: Int, pageSize: Int, search: String): OrgPage!
    organization(slug: String!): Organization
    users(page: Int, pageSize: Int, search: String): UserPage!
    user(address: String!): User
    dailyVolume(days: Int): [VolumeMetric!]!
    monthlyVolume(months: Int): [VolumeMetric!]!
    countryStats: [CountryStat!]!
    assetDistribution: [AssetStat!]!
  }

  type EcosystemMetrics {
    totalUsers: Int!
    totalOrganizations: Int!
    totalTransactions: Int!
    totalVolume: String!
    totalTrustRelationships: Int!
    activeFundingStreams: Int!
    totalRecipients: Int!
    countriesReached: Int!
  }

  type Transaction {
    id: String!
    txHash: String!
    ledger: Int!
    sourceAccount: String!
    fee: Int!
    operationCount: Int!
    successful: Boolean!
    memo: String
    createdAt: String!
    payments: [Payment!]!
  }

  type TransactionPage {
    data: [Transaction!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type Payment {
    id: String!
    txHash: String!
    operationId: String!
    type: String!
    fromAddress: String!
    toAddress: String!
    assetCode: String!
    assetIssuer: String
    amount: String!
    memo: String
    country: String
    createdAt: String!
  }

  type PaymentPage {
    data: [Payment!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type TrustRelationship {
    id: String!
    trustorId: String!
    trusteeId: String!
    trustType: TrustType!
    weight: Float!
    status: TrustStatus!
    createdAt: String!
    trustor: User
    trustee: User
  }

  type TrustPage {
    data: [TrustRelationship!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type TrustScore {
    userId: String!
    score: Float!
    computedAt: String!
  }

  type TrustGraphNode {
    id: String!
    address: String!
    displayName: String
    type: String!
  }

  type TrustGraphEdge {
    source: String!
    target: String!
    weight: Float!
    trustType: TrustType!
    status: TrustStatus!
  }

  type TrustGraph {
    nodes: [TrustGraphNode!]!
    edges: [TrustGraphEdge!]!
  }

  type FundingStream {
    id: String!
    asset: String!
    totalAmount: String!
    releasedAmount: String!
    startTime: String!
    endTime: String
    status: StreamStatus!
    streamType: StreamType!
    createdAt: String!
    creator: User
    recipient: User
  }

  type FundingStreamPage {
    data: [FundingStream!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type Organization {
    id: String!
    name: String!
    slug: String!
    logoUrl: String
    website: String
    country: String
    isVerified: Boolean!
    createdAt: String!
  }

  type OrgPage {
    data: [Organization!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type User {
    id: String!
    stellarAddress: String!
    displayName: String
    avatarUrl: String
    createdAt: String!
    isActive: Boolean!
    organization: Organization
  }

  type UserPage {
    data: [User!]!
    total: Int!
    page: Int!
    pageSize: Int!
    hasMore: Boolean!
  }

  type VolumeMetric {
    date: String!
    volume: String!
    txCount: Int!
  }

  type CountryStat {
    country: String!
    volume: String!
    txCount: Int!
    userCount: Int!
  }

  type AssetStat {
    assetCode: String!
    volume: String!
    txCount: Int!
  }

  enum TrustType {
    PERSONAL
    PROFESSIONAL
    ORGANIZATIONAL
    DELEGATED
  }

  enum TrustStatus {
    ACTIVE
    REVOKED
    EXPIRED
    PENDING
  }

  enum StreamStatus {
    ACTIVE
    PAUSED
    COMPLETED
    CANCELLED
  }

  enum StreamType {
    SALARY
    GRANT
    AID
    MILESTONE
    RECURRING
  }
`;

import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers.js";

export const schema = makeExecutableSchema({ typeDefs, resolvers });
