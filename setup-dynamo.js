#!/usr/bin/env node
// Run once to create all DynamoDB tables:
// AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx AWS_REGION=us-east-1 node scripts/setup-dynamo.js

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tables = [
  { TableName: "dropsex-deliveries", key: "trackingId" },
  { TableName: "dropsex-businesses", key: "businessId" },
  { TableName: "dropsex-sessions",   key: "sessionId"  },
];

async function setup() {
  for (const { TableName, key } of tables) {
    try {
      await client.send(new DescribeTableCommand({ TableName }));
      console.log(`✅ "${TableName}" already exists.`);
    } catch {
      await client.send(new CreateTableCommand({
        TableName,
        AttributeDefinitions: [{ AttributeName: key, AttributeType: "S" }],
        KeySchema: [{ AttributeName: key, KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      }));
      console.log(`✅ "${TableName}" created.`);
    }
  }
  console.log("\n🚀 All tables ready!");
}

setup().catch(console.error);
