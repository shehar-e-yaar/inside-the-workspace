import type { SkillId } from './forgeData';

export type Responsibility = { label: string; clue: string };
export type EngineeringChallenge = {
  problem: string;
  roles: Partial<Record<SkillId, Responsibility>>;
  // Indices into forgeData.sources: every insight and workflow has a source.
  source: number;
};
const role = (label: string, clue: string): Responsibility => ({ label, clue });
// These are simplified explanations of the audited repository paths in forgeData.
// Repository-specific prompts and role clues; static pipeline artwork lives separately.
export const challenges: Record<string, EngineeringChallenge> = {
  venomlink: {
    problem: 'Facility records are scattered. How would you prepare reliable geographic data and deliver it to a map?',
    roles: {
      python: role('Prepare records', 'Fetch, clean and validate geographic records with a general-purpose data language.'),
      amazonwebservices: role('Serve the map', 'Use the cloud with S3 storage, API Gateway and Lambda delivery.'),
    },
    source: 1,
  },
  'stock-pipeline': {
    problem: 'Stock quotes arrive continuously. How would you ingest, process and store them for a queryable dashboard?',
    roles: {
      python: role('Quote producer', 'Poll the quote API and serialize events with a general-purpose data language.'),
      apachekafka: role('Ingestion', 'Carry continuous events between services with a durable streaming broker.'),
      apachespark: role('Processing', 'Parse JSON in a distributed engine with Structured Streaming micro-batches.'),
      postgresql: role('Storage', 'Persist typed rows in a relational database with JDBC connectivity.'),
      docker: role('Environment', 'Package services and run them together with Compose.'),
      sql: role('Queries', 'Select the latest records with a relational query language.'),
    },
    source: 1,
  },
  'nyc-taxi': {
    problem: 'New taxi-trip files need repeatable cleaning and loading. How would you schedule the work and keep the results queryable?',
    roles: {
      python: role('Trip cleaning', 'Read Parquet batches and remove missing values using Pandas.'),
      apacheairflow: role('Scheduling', 'Orchestrate daily tasks and dependencies as a DAG.'),
      postgresql: role('Trip storage', 'Load cleaned batches into a persistent relational database.'),
      docker: role('Environment', 'Package the workflow infrastructure in containers.'),
    },
    source: 1,
  },
  'ecommerce-warehouse': {
    problem: 'Transactions are spread across users, products and orders. How would you turn them into a model ready for sales analysis?',
    roles: {
      python: role('Sample data', 'Generate synthetic users, products and transactions with Faker.'),
      sql: role('Sales queries', 'Aggregate measures from warehouse tables with a query language.'),
      dbt: role('Data modeling', 'Build versioned warehouse transformations into facts and dimensions.'),
    },
    source: 0,
  },
  ombudsai: {
    problem: 'An agent wants to close a civic ticket. How would you check the evidence and escalate an uncertain action for human review?',
    roles: {
      python: role('Evidence rules', 'Apply deterministic source-of-record checks before an agent action.'),
      amazonwebservices: role('Review memo', 'Use the cloud offering Bedrock to draft an escalation memo.'),
    },
    source: 0,
  },
  'research-reproductions': {
    problem: 'A streaming experiment must account for the rows it processes. How would you feed file batches and inspect the output?',
    roles: {
      python: role('Batch samples', 'Prepare a held-out sample and write incremental CSV files.'),
      apachespark: role('File streaming', 'Read new files with an explicit schema in Structured Streaming.'),
      sql: role('Row audit', 'Query the in-memory table to inspect processed rows.'),
    },
    source: 0,
  },
  'text-editor': {
    problem: 'Typing changes a text buffer. How would you support cursor edits and reverse an insertion without losing the previous state?',
    roles: { cplusplus: role('Buffer & history', 'Use the compiled language with manual linked nodes and action stacks in this console editor.') },
    source: 0,
  },
};
