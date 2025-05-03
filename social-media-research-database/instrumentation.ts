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
    user: {
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
                verified BOOLEAN,
                PRIMARY KEY (username, social_name),
                FOREIGN KEY (social_name) REFERENCES social(name) ON DELETE CASCADE
            )
        `,
        demoData: {
            insert: `INSERT INTO user (username, social_name, first_name, last_name, birthdate, gender, birth_country, residence_country, verified) VALUES (?,?,?,?,?,?,?,?,?)`,
            values: [
                ['jdoe2', 'Twitter', 'John', 'Doe', '1990-01-01', 'Male', 'USA', 'USA', '0'],
                ['jsmithy315', 'Instagram', 'Jane', 'Smith', '1985-12-25', 'Female', 'Canada', 'USA', '1'],
                ['jdoe2', 'Facebook', 'John', 'Doe', '1995-05-15', 'Male', 'USA', 'USA', '1'],
                ['jsmithy315', 'Snapchat', 'Jane', 'Smith', '1980-07-10', 'Female', 'Canada', 'USA', '0'],
                ['therealjdoe2', 'TikTok', 'John', 'Doe', '1992-03-20', 'Male', 'USA', 'USA', '1'],
                ['Bob212', 'YouTube', 'Bobby', 'Jane', '1988-10-05', 'Male', 'USA', 'USA', '0'],
                ['jsmithy315', 'Pinterest', 'Jane', 'Smith', '1975-09-15', 'Female', 'Canada', 'USA', '0'],
                ['reddituser123', 'Reddit', 'Red', 'Dude', '1999-06-15', 'Male', 'USA', 'USA', '1'],
                ['linda99', 'LinkedIn', 'Linda', 'Smith', '1982-04-05', 'Female', 'USA', 'USA', '1'],
                ['mydogisthebest', 'Twitter', 'dog', 'lady', '1990-01-01', 'Female', 'USA', 'USA', '0'],
                ['iheartmycat', 'Instagram', 'cat', 'man', '1985-12-25', 'Male', 'Canada', 'USA', '1'],
            ],
        },
    },
    post: {
        create: `
            CREATE TABLE post (
                datetime DATETIME,
                username VARCHAR(100),
                social_name VARCHAR(100),
                text TEXT,
                country VARCHAR(50),
                region VARCHAR(50),
                city VARCHAR(50),
                likes INT,
                dislikes INT,
                has_multimedia BOOLEAN,
                PRIMARY KEY (datetime, username, social_name),
                FOREIGN KEY (username, social_name) REFERENCES user(username, social_name) ON DELETE CASCADE
            )
        `,
        demoData: {
            insert: `INSERT INTO post (datetime, username, social_name, text, country, region, city, likes, dislikes, has_multimedia)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            values: [
                ['2020-01-01 00:00:04', 'iheartmycat', 'Instagram', 'happy meow year', 'Japan', 'Ehime', 'Ozu', '43110', '0', '1'],
                ['2015-03-14 09:26:53', 'jdoe2', 'Twitter', "It's pi o'clock", 'England', 'London', 'London', '314159', '26535', '0'],
                ['2015-03-14 09:26:55', 'therealjdoe2', 'TikTok', "jdoe2 on Twitter is FAKE. The REAL John Doe is here on Musical.ly", "China", "Shanghai", "Shanghai", "4547", "0", '1'],
                ['2025-03-28 19:16:00', 'therealjdoe2', 'TikTok', "Join CRYPTOBUDDY, an AI CRYPTO platform for Senior ADULTS (60+)", "USA", "Texas", "Dallas", "9976878", "0", '1'],
                ['2025-04-28 19:16:05', 'Bob212', 'YouTube', "Join CRYPTOBUDDY, an AI CRYPTO platform for Senior ADULTS (55+) confused about CRYPTO!", "USA", "Texas", "Dallas", "987654", "0", '1'],
                ['2025-04-29 15:26:55', 'reddituser123', 'Reddit', "Join CRYPTOBUDDY, an AI CRYPTO platform for Senior ADULTS (50+) confused about CRYPTO! Our platform will protect you against scams using chatbots!!1!", "USA", "Texas", "Dallas", "14579", "4824", '0'],
                ['2025-04-30 11:28:35', 'reddituser123', 'Reddit', "Join CRYPTOBUDDY, an AI CRYPTO platform for Senior ADULTS (45+) confused about CRYPTO blockchain! We use CHATBOTS with GUARDRAILS to protect you from SCAMS!!!", "USA", "Texas", "Dallas", "50089", "1112", '0'],
                ['2025-05-01 07:15:28', 'linda99', 'LinkedIn', 'Arab traders fooled Europeans, including Aristotle, into thinking cinnamon came from a cinnamon bird, a belief that survived for two thousand years. Be more like those Arab traders and protect your trade secrets!', 'UAE', 'Dubai', 'Dubai', "123456", "43210", '1'],
                ['2025-05-01 07:16:35', 'mydogisthebest', 'Twitter', "Join CRYPTOBUDDY, an AI CRYPTO platform for Senior DOGS (5+) confused about CRYPTO blockchain and HUMANS! Our HALLUCINATION PROOF CHATBOTS will protect your DOG from SCAMS!!1!", "USA", "Nevada", "Las Vegas", "234", "65422", '0'],
                ['2024-12-31 16:00:04', 'iheartmycat', 'Instagram', 'happy meow year in CHINA 🍵 #china #dongjing #catisland', 'China', 'Dongjing', 'Dongjing', '4234', '0', '1'],
                ['2024-12-31 15:00:05', 'iheartmycat', 'Instagram', 'happy meow year in JAPAN 🍵 #japan #matcha #cat #catisland', 'Japan', 'Ehime', 'Ozu', '2147483647', '0', '1'],
                ['2025-05-01 08:20:54', 'jsmithy315', 'Pinterest', 'Oepsie poepsie de trein is stukkie wukkie! we sijn heul hard aan t werk om dit te make mss kun je beter gaan fwietsen owo', 'The Netherlands', 'South Holland', 'The Hague', '10029', '140', '1'],
            ],
        },
    },
    project: {
        create: `
            CREATE TABLE project (
                name VARCHAR(100),
                manager_first VARCHAR(50),
                manager_last VARCHAR(50),
                institute VARCHAR(100),
                start_date DATE,
                end_date DATE,
                PRIMARY KEY (name)
            )
        `,
        demoData: {
            insert: `INSERT INTO project (name, manager_first, manager_last, institute, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            values: [
                ['Cat Sentiment Analysis :3', 'Ima', 'Yumen', 'Center for Alternative Technology', '2025-01-01', '2026-01-01'],
                ['Mu Alpha Theta Pi Project', 'Brady', 'Haran', 'University of Nottingham', '2015-03-14', '2015-06-28'],
                ['Disinformation Analyzer', 'Matt', 'Verich', 'Disinformation Project', '2023-07-06', '2027-04-05'],
            ],
        },
    },
    field: {
        create: `
            CREATE TABLE field (
                name VARCHAR(100),
                project_name VARCHAR(100),
                PRIMARY KEY (name, project_name),
                FOREIGN KEY (project_name) REFERENCES project(name) ON DELETE CASCADE
            )
        `,
        demoData: {
            insert: `INSERT INTO field (name, project_name) VALUES (?, ?)`,
            values: [
                ['Cat Sentiment', 'Cat Sentiment Analysis :3'], 
                ['Pi Factor', 'Mu Alpha Theta Pi Project'],
                ['Tau Factor', 'Mu Alpha Theta Pi Project'],
                ['Bot Influence Probability', 'Disinformation Analyzer'],
                ['Factual Correlation Factor', 'Disinformation Analyzer'],
            ],
        },
    },
    fieldResult: {
        create: `
            CREATE TABLE fieldresult (
                field_name VARCHAR(100),
                project_name VARCHAR(100),
                post_datetime DATETIME,
                post_username VARCHAR(100),
                post_social_name VARCHAR(100),
                result TEXT,
                PRIMARY KEY (field_name, project_name, post_datetime, post_username, post_social_name),
                FOREIGN KEY (field_name, project_name) REFERENCES field(name, project_name) ON DELETE CASCADE,
                FOREIGN KEY (post_datetime, post_username, post_social_name) REFERENCES post(datetime, username, social_name) ON DELETE CASCADE
            )
        `,
        demoData: {
            insert: `INSERT INTO fieldresult (field_name, project_name, post_datetime, post_username, post_social_name, result) VALUES (?, ?, ?, ?, ?, ?)`,
            values: [
                ['Cat Sentiment', 'Cat Sentiment Analysis :3', '2024-12-31 15:00:05', 'iheartmycat', 'Instagram', '100'],
                ['Cat Sentiment', 'Cat Sentiment Analysis :3', '2025-05-01 07:16:35', 'mydogisthebest', 'Twitter', '4'],
                ['Pi Factor', 'Mu Alpha Theta Pi Project', '2015-03-14 09:26:53', 'jdoe2', 'Twitter', 'Very Pi'],
                ['Pi Factor', 'Mu Alpha Theta Pi Project', '2015-03-14 09:26:55', 'therealjdoe2', 'TikTok', 'Pi Hater'],
                ['Factual Correlation Factor', 'Disinformation Analyzer', '2025-05-01 07:16:35', 'mydogisthebest', 'Twitter', '-1235'],
            ],
        },
    },
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