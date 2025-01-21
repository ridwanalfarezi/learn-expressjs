import { createConnection } from "mysql2/promise";
import config from "../config.js";

async function query(sql, params) {
  const connection = await createConnection(config);
  const [results] = await connection.execute(sql, params);

  return results;
}

export default query;