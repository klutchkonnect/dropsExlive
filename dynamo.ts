/**
 * DynamoDB layer — handles businesses + deliveries
 * Required for H0 Hackathon (AWS DynamoDB track)
 * Tables are auto-created on first run if they don't exist.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand, GetCommand, UpdateCommand,
  ScanCommand, DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";

// ── Client ──────────────────────────────────────────────────
const rawClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
export const ddb = DynamoDBDocumentClient.from(rawClient);

const BUSINESSES_TABLE = "dropsex-businesses";
const DELIVERIES_TABLE = "dropsex-deliveries";

// ── Auto-create tables on first call ────────────────────────
async function ensureTable(name: string, hashKey: string) {
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: name }));
  } catch {
    try {
      await rawClient.send(new CreateTableCommand({
        TableName: name,
        AttributeDefinitions: [{ AttributeName: hashKey, AttributeType: "S" }],
        KeySchema: [{ AttributeName: hashKey, KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      }));
      // Wait briefly for table to become active
      await new Promise(r => setTimeout(r, 2000));
    } catch (e: any) {
      if (e.name !== "ResourceInUseException") throw e;
    }
  }
}

let tablesReady = false;
export async function ensureTables() {
  if (tablesReady) return;
  await Promise.all([
    ensureTable(BUSINESSES_TABLE, "business_id"),
    ensureTable(DELIVERIES_TABLE, "tracking_id"),
  ]);
  tablesReady = true;
}

// ── Types ────────────────────────────────────────────────────
export type DeliveryStatus = "pending"|"confirmed"|"processing"|"dispatched"|"delivered"|"failed";
export type PlanType       = "per_trip"|"starter_bundle"|"business_plan"|"enterprise";

export const PLAN_DETAILS: Record<PlanType,{name:string;price:number;trips:number|null;perTrip:number;desc:string}> = {
  per_trip:       { name:"Per Trip",       price:3500,  trips:null, perTrip:3500, desc:"₦3,500/delivery · No commitment"        },
  starter_bundle: { name:"Starter Bundle", price:50000, trips:20,   perTrip:2500, desc:"₦50,000/month · Up to 20 deliveries"    },
  business_plan:  { name:"Business Plan",  price:80000, trips:40,   perTrip:2000, desc:"₦80,000/month · Up to 40 deliveries"    },
  enterprise:     { name:"Enterprise",     price:0,     trips:null, perTrip:1500, desc:"40+ deliveries · Custom pricing"        },
};

export const LAGOS_ZONES = ["Isolo","Surulere","Lagos Island","Victoria Island","Lekki","Yaba","Mushin","Oshodi","Ikeja","Ajah","Ikorodu","Festac","Maryland","Gbagada"];

export interface Business {
  business_id:   string;
  business_name: string;
  email:         string;
  phone:         string;
  address:       string;
  zone:          string;
  plan:          PlanType;
  password_hash: string;
  created_at:    string;
  is_active:     boolean;
  trips_used:    number;
  auto_dispatch: boolean;
}

export interface Delivery {
  tracking_id:      string;
  client_id:        string;
  client_name:      string;
  recipient_name:   string;
  recipient_phone:  string;
  pickup_address:   string;
  delivery_zone:    string;
  delivery_address: string;
  item_description: string;
  status:           DeliveryStatus;
  admin_approved:   boolean;
  whatsapp_sent:    boolean;
  created_at:       string;
  updated_at:       string;
  status_history:   { status:DeliveryStatus; timestamp:string; note?:string }[];
}

// ── Business operations ──────────────────────────────────────
export async function createBusiness(data: Omit<Business,"business_id"|"created_at"|"is_active"|"trips_used"|"auto_dispatch">): Promise<Business> {
  await ensureTables();
  const { v4: uuid } = await import("uuid");
  const b: Business = { ...data, business_id: uuid(), created_at: new Date().toISOString(), is_active: true, trips_used: 0, auto_dispatch: false };
  await ddb.send(new PutCommand({ TableName: BUSINESSES_TABLE, Item: b }));
  return b;
}

export async function getBusinessByEmail(email: string): Promise<Business|null> {
  await ensureTables();
  const r = await ddb.send(new ScanCommand({
    TableName: BUSINESSES_TABLE,
    FilterExpression: "email = :e",
    ExpressionAttributeValues: { ":e": email.toLowerCase() },
  }));
  return (r.Items?.[0] as Business) || null;
}

export async function getBusinessById(id: string): Promise<Business|null> {
  await ensureTables();
  const r = await ddb.send(new GetCommand({ TableName: BUSINESSES_TABLE, Key: { business_id: id } }));
  return (r.Item as Business) || null;
}

export async function listBusinesses(): Promise<Business[]> {
  await ensureTables();
  const r = await ddb.send(new ScanCommand({ TableName: BUSINESSES_TABLE }));
  return ((r.Items || []) as Business[]).sort((a,b) => b.created_at.localeCompare(a.created_at));
}

// ── Delivery operations ──────────────────────────────────────
export async function createDelivery(data: Omit<Delivery,"tracking_id"|"created_at"|"updated_at"|"status_history"|"status"|"admin_approved"|"whatsapp_sent">): Promise<Delivery> {
  await ensureTables();
  const tracking_id = "KLUTCH-" + Math.random().toString(36).slice(2,8).toUpperCase();
  const now = new Date().toISOString();
  const d: Delivery = { ...data, tracking_id, status:"pending", admin_approved:false, whatsapp_sent:false, created_at:now, updated_at:now, status_history:[{ status:"pending", timestamp:now, note:"Order received" }] };
  await ddb.send(new PutCommand({ TableName: DELIVERIES_TABLE, Item: d }));
  return d;
}

export async function getDelivery(tracking_id: string): Promise<Delivery|null> {
  await ensureTables();
  const r = await ddb.send(new GetCommand({ TableName: DELIVERIES_TABLE, Key: { tracking_id } }));
  return (r.Item as Delivery) || null;
}

export async function updateDeliveryStatus(tracking_id: string, status: DeliveryStatus, note?: string): Promise<Delivery|null> {
  const d = await getDelivery(tracking_id);
  if (!d) return null;
  const now = new Date().toISOString();
  const history = [...d.status_history, { status, timestamp:now, note }];
  await ddb.send(new UpdateCommand({
    TableName: DELIVERIES_TABLE, Key: { tracking_id },
    UpdateExpression: "SET #s = :s, updated_at = :u, status_history = :h",
    ExpressionAttributeNames: { "#s":"status" },
    ExpressionAttributeValues: { ":s":status, ":u":now, ":h":history },
  }));
  return { ...d, status, updated_at:now, status_history:history };
}

export async function approveDelivery(tracking_id: string): Promise<Delivery|null> {
  const d = await getDelivery(tracking_id);
  if (!d) return null;
  const now = new Date().toISOString();
  const history = [...d.status_history, { status:"confirmed" as DeliveryStatus, timestamp:now, note:"Approved by DropsEx ⚡" }];
  await ddb.send(new UpdateCommand({
    TableName: DELIVERIES_TABLE, Key: { tracking_id },
    UpdateExpression: "SET admin_approved = :a, #s = :s, updated_at = :u, status_history = :h, whatsapp_sent = :w",
    ExpressionAttributeNames: { "#s":"status" },
    ExpressionAttributeValues: { ":a":true, ":s":"confirmed", ":u":now, ":h":history, ":w":true },
  }));
  return { ...d, admin_approved:true, status:"confirmed", whatsapp_sent:true, updated_at:now, status_history:history };
}

export async function listDeliveries(client_id?: string): Promise<Delivery[]> {
  await ensureTables();
  const params: any = { TableName: DELIVERIES_TABLE };
  if (client_id) {
    params.FilterExpression = "client_id = :c";
    params.ExpressionAttributeValues = { ":c": client_id };
  }
  const r = await ddb.send(new ScanCommand(params));
  return ((r.Items || []) as Delivery[]).sort((a,b) => b.created_at.localeCompare(a.created_at));
}
