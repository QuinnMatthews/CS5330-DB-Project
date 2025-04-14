import mysql from "mysql2/promise";
import { GetDBSettings, IDBSettings } from "@/database";

let connectionParams = GetDBSettings();

type TableDefinition = {
    create: string;
    demoData?: {
      insert: string;
      values: Array<string[]>;
    };
  };
  
  export const tables: Record<string, TableDefinition> = {
    social: {
      create: `
        CREATE TABLE social (
            name VARCHAR(100) PRIMARY KEY
        )
      `,
      demoData: {
        insert: `INSERT INTO social (name) VALUES (?)`,
        values: [['Twitter'], ['Instagram'], ['Facebook'], ['Snapchat'], ['TikTok'], ['YouTube'], ['Pinterest'], ['Reddit'], ['LinkedIn']],
      },
    },
    user : {
        create: `
            CREATE TABLE user (
                username VARCHAR(100),
                social_name VARCHAR(100),
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                birthdate DATE,
                gender VARCHAR(10),
                birth_country VARCHAR(50),
                residence_country VARCHAR(50),
                PRIMARY KEY (username, social_name),
                FOREIGN KEY (social_name) REFERENCES social(name) ON DELETE CASCADE
            )
        `,
        demoData: {
            insert: `INSERT INTO user (username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country) VALUES (?,?,?,?,?,?,?,?)`,
            values: [
                ['jdoe2', 'Twitter', 'John', 'Doe', '1990-01-01', 'Male', 'USA', 'USA'],
                ['jsmithy315', 'Instagram', 'Jane', 'Smith', '1985-12-25', 'Female', 'Canada', 'USA'],
                ['jdoe2', 'Facebook', 'John', 'Doe', '1995-05-15', 'Male', 'USA', 'USA'],
                ['jsmithy315', 'Snapchat', 'Jane', 'Smith', '1980-07-10', 'Female', 'Canada', 'USA'],
                ['therealjdoe2', 'TikTok', 'John', 'Doe', '1992-03-20', 'Male', 'USA', 'USA'],
                ['Bob212', 'YouTube', 'Bobby', 'Jane', '1988-10-05', 'Male', 'USA', 'USA'],
                ['jsmithy315', 'Pinterest', 'Jane', 'Smith', '1975-09-15', 'Female', 'Canada', 'USA'],
                ['reddituser123', 'Reddit', 'Red', 'Dude', '1999-06-15', 'Male', 'USA', 'USA'],
                ['linda99', 'LinkedIn', 'Linda', 'Smith', '1982-04-05', 'Female', 'USA', 'USA'],
                ['mydogisthebest', 'Twitter', 'dog', 'lady', '1990-01-01', 'Female', 'USA', 'USA'],
                ['iheartmycat', 'Instagram', 'cat', 'man', '1985-12-25', 'Male', 'Canada', 'USA'],
            ],
        },
    }
  };


async function tableExists(
    tableName: string,
    connection: mysql.Connection
): Promise<boolean> {
    const [rows] = await connection.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [process.env.DB_NAME!, tableName]
    );

    const tableExists = (rows as any)[0].count > 0;

    return tableExists;
}

export async function register() {
    const connection = await mysql.createConnection(connectionParams);

    // Loop through each table definition
    for (const tableName of Object.keys(tables)) {
        // Check if the table exists in the database
        if (await tableExists(tableName, connection)) {
            console.log(`Table "${tableName}" already exists.`);
        } else {
            console.log(`Creating table "${tableName}"`);
            await connection.query(tables[tableName].create);
            if (tables[tableName].demoData) {
                console.log(`Inserting demo data into table "${tableName}"`);
                for (const values of tables[tableName].demoData.values) {
                    await connection.query(tables[tableName].demoData.insert, values);
                }
            }
        }
    }

    // Close the connection
    await connection.end();
}