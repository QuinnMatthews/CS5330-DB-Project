import { NextResponse, NextRequest } from 'next/server'
import mysql from 'mysql2/promise';
import { GetDBSettings, IDBSettings } from '@/database'

let connectionParams = GetDBSettings()


export async function GET(request: Request) {
  try {
    // Connect to the database
    const connection = await mysql.createConnection(connectionParams)

    // Create a query to fetch data
    let get_exp_query = 'SELECT * FROM user'
    let values: any[] = []

    // Execute the query
    const [results] = await connection.execute(get_exp_query, values)

    // Close the database connection
    connection.end()

    // return the results as a JSON API response
    return NextResponse.json(results)

  } catch (err) {
    console.log('ERROR: API - ', (err as Error).message)

    const response = {
      error: (err as Error).message,

      returnedStatus: 200,
    }

    return NextResponse.json(response, { status: 200 })
  }
}
