import mysql from "mysql2/promise";
import { GetDBSettings } from "@/database";

let connectionParams = GetDBSettings();

export async function queryDB<T = any>(
  query: string,
  values: (string | boolean | number| null)[] = []
): Promise<T> {

  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection(connectionParams);
    const [results] = await connection.execute(query, values);
    return results as T;
  } catch (err) {
    console.error("Database query error:", (err as Error).message);
    throw err;
  } finally {
    if (connection) await connection.end();
  }
}
