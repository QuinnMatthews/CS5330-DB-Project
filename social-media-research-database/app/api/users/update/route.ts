import { NextResponse, NextRequest } from 'next/server'
import mysql from 'mysql2/promise';
import { GetDBSettings, IDBSettings } from '@/database'

let connectionParams = GetDBSettings()

export async function POST(request: NextRequest) {
  const body = await request.json()

  try {
    // Connect to the database
    const connection = await mysql.createConnection(connectionParams)
    const new_exp_query = `UPDATE user
    SET first_name = ?, last_name = ?, birthdate = ?, gender = ?,
    birth_country = ?, residence_country = ?
    WHERE username = ? AND social_name = ?`;
    
    console.log(body)

    // Execute the query
    const result = await connection.execute(new_exp_query, [
    body.first_name, body.last_name,
    body.birthdate, body.gender, body.birth_country, body.residence_country,
    body.username, body.social_name])
    
    // Close the database connection
    connection.end()
    // return the results as a JSON API response
    return NextResponse.json(result)
  } catch (err) {
    console.log('ERROR: API - ', (err as Error).message)
    const response = {
      error: (err as Error).message,
      returnedStatus: 500,
    }
    return NextResponse.json(response, { status: 500 })
  }
}
